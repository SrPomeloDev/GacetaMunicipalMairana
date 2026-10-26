-- ============================================================================
-- 00016_auditoria_aprobacion_trigger.sql
-- 1) La auditoría de aprobación/rechazo pasa a un trigger AFTER: cubre tanto
--    la RPC revisar_normativa() como la publicación desde la ficha.
-- 2) Un admin que publica sin aprobación previa deja aprobado_por/aprobado_en.
--    Así el historial y puede_borrar_normativa() quedan consistentes.
-- Aplicar en SQL Editor de Supabase (después de 00015).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Trigger de control: estampar aprobador al publicar
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normativa_control_aprobacion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.estado_aprobacion IS NULL THEN
        NEW.estado_aprobacion := 'pendiente';
    END IF;

    IF auth.uid() IS NULL THEN
        IF NEW.publicada THEN
            NEW.estado_aprobacion := 'aprobado';
            NEW.aprobado_en := COALESCE(NEW.aprobado_en, now());
            NEW.motivo_rechazo := NULL;
        END IF;
        RETURN NEW;
    END IF;

    IF public.es_admin() THEN
        IF NEW.publicada THEN
            NEW.estado_aprobacion := 'aprobado';
            IF NEW.aprobado_en IS NULL THEN
                NEW.aprobado_por := auth.uid();
                NEW.aprobado_en := now();
            END IF;
            NEW.motivo_rechazo := NULL;
        END IF;
        RETURN NEW;
    END IF;

    NEW.publicada := false;
    NEW.estado_aprobacion := 'pendiente';
    NEW.aprobado_por := NULL;
    NEW.aprobado_en := NULL;
    NEW.motivo_rechazo := NULL;

    RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Auditoría automática
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normativa_auditar_revision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.estado_aprobacion = 'aprobado' AND NEW.publicada = true
       AND (TG_OP = 'INSERT' OR OLD.estado_aprobacion IS DISTINCT FROM 'aprobado') THEN
        INSERT INTO public.normativa_aprobaciones (normativa_id, usuario_id, accion, motivo)
        VALUES (NEW.id, auth.uid(), 'aprobar', NULL);
    ELSIF NEW.estado_aprobacion = 'rechazado'
       AND (TG_OP = 'INSERT' OR OLD.estado_aprobacion IS DISTINCT FROM 'rechazado') THEN
        INSERT INTO public.normativa_aprobaciones (normativa_id, usuario_id, accion, motivo)
        VALUES (NEW.id, auth.uid(), 'rechazar', NEW.motivo_rechazo);
    END IF;

    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_normativa_auditar_revision ON public.normativa;
CREATE TRIGGER trg_normativa_auditar_revision
    AFTER INSERT OR UPDATE ON public.normativa
    FOR EACH ROW EXECUTE FUNCTION public.normativa_auditar_revision();

-- ----------------------------------------------------------------------------
-- 3. created_by por defecto = usuario autenticado (autores de sus borradores)
-- ----------------------------------------------------------------------------
ALTER TABLE public.normativa ALTER COLUMN created_by SET DEFAULT auth.uid();

-- ----------------------------------------------------------------------------
-- 4. RPC sin INSERT manual (lo hace el trigger, evita duplicados)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.revisar_normativa(
    p_id uuid,
    p_aprobar boolean,
    p_motivo text DEFAULT NULL
)
RETURNS public.normativa
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_row public.normativa;
    v_motivo text := NULLIF(btrim(COALESCE(p_motivo, '')), '');
BEGIN
    IF NOT public.es_admin() THEN
        RAISE EXCEPTION 'Solo un administrador puede revisar normativa'
            USING ERRCODE = '42501';
    END IF;

    IF p_aprobar THEN
        UPDATE public.normativa
           SET estado_aprobacion = 'aprobado',
               publicada = true,
               aprobado_por = auth.uid(),
               aprobado_en = now(),
               motivo_rechazo = NULL,
               fecha_publicacion = COALESCE(fecha_publicacion, CURRENT_DATE)
         WHERE id = p_id
         RETURNING * INTO v_row;
    ELSE
        IF v_motivo IS NULL THEN
            RAISE EXCEPTION 'Debes indicar el motivo del rechazo'
                USING ERRCODE = '22023';
        END IF;

        UPDATE public.normativa
           SET estado_aprobacion = 'rechazado',
               publicada = false,
               aprobado_por = auth.uid(),
               aprobado_en = now(),
               motivo_rechazo = v_motivo
         WHERE id = p_id
         RETURNING * INTO v_row;
    END IF;

    IF v_row.id IS NULL THEN
        RAISE EXCEPTION 'Normativa no encontrada'
            USING ERRCODE = 'P0002';
    END IF;

    RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.revisar_normativa(uuid, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revisar_normativa(uuid, boolean, text) TO authenticated;
