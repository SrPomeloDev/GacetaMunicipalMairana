-- ============================================================================
-- 00015_aprobacion_normativa_ultimo_acceso.sql
-- 1) Flujo de aprobación de normativa: los funcionarios (editor/publicador)
--    suben y queda "pendiente"; solo un administrador (alcalde) publica.
-- 2) Historial de aprobaciones/rechazos.
-- 3) usuarios.ultimo_acceso para saber cuándo entró por última vez cada uno.
-- 4) Endurece usuarios: nadie puede cambiarse rol/activo/email/dependencia.
-- Aplicar en SQL Editor de Supabase (no se ejecuta localmente).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columnas de aprobación en normativa
-- ----------------------------------------------------------------------------
ALTER TABLE public.normativa
    ADD COLUMN IF NOT EXISTS estado_aprobacion text NOT NULL DEFAULT 'pendiente',
    ADD COLUMN IF NOT EXISTS aprobado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS aprobado_en timestamptz,
    ADD COLUMN IF NOT EXISTS motivo_rechazo text;

ALTER TABLE public.normativa
    DROP CONSTRAINT IF EXISTS normativa_estado_aprobacion_check;
ALTER TABLE public.normativa
    ADD CONSTRAINT normativa_estado_aprobacion_check
    CHECK (estado_aprobacion IN ('pendiente', 'aprobado', 'rechazado'));

UPDATE public.normativa
   SET estado_aprobacion = 'aprobado',
       aprobado_en = COALESCE(aprobado_en, fecha_publicacion::timestamptz, created_at)
 WHERE publicada = true
   AND estado_aprobacion <> 'aprobado';

CREATE INDEX IF NOT EXISTS idx_normativa_estado_aprobacion
    ON public.normativa(estado_aprobacion);

CREATE INDEX IF NOT EXISTS idx_normativa_pendientes
    ON public.normativa(created_at DESC)
    WHERE estado_aprobacion = 'pendiente';

-- ----------------------------------------------------------------------------
-- 2. Historial de aprobaciones
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.normativa_aprobaciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    normativa_id uuid NOT NULL REFERENCES public.normativa(id) ON DELETE CASCADE,
    usuario_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    accion text NOT NULL CHECK (accion IN ('aprobar', 'rechazar')),
    motivo text,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_norm_aprobaciones_normativa
    ON public.normativa_aprobaciones(normativa_id, created_at DESC);

ALTER TABLE public.normativa_aprobaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS norm_aprobaciones_select_staff ON public.normativa_aprobaciones;
CREATE POLICY norm_aprobaciones_select_staff ON public.normativa_aprobaciones
    FOR SELECT USING (public.is_staff());

INSERT INTO public.normativa_aprobaciones (normativa_id, accion, created_at)
SELECT n.id, 'aprobar', COALESCE(n.aprobado_en, n.created_at)
  FROM public.normativa n
 WHERE n.publicada = true
   AND NOT EXISTS (
       SELECT 1 FROM public.normativa_aprobaciones a
        WHERE a.normativa_id = n.id AND a.accion = 'aprobar'
   );

-- ----------------------------------------------------------------------------
-- 3. Helpers
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.es_admin()
RETURNS bool
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT public.current_user_role() = 'admin';
$$;

-- ----------------------------------------------------------------------------
-- 4. Regla de publicación: solo admin publica
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
        IF NEW.publicada AND NEW.estado_aprobacion IS DISTINCT FROM 'aprobado' THEN
            NEW.estado_aprobacion := 'aprobado';
            NEW.aprobado_en := COALESCE(NEW.aprobado_en, now());
            NEW.motivo_rechazo := NULL;
        END IF;
        RETURN NEW;
    END IF;

    IF public.es_admin() THEN
        IF NEW.publicada AND NEW.estado_aprobacion <> 'aprobado' THEN
            NEW.estado_aprobacion := 'aprobado';
            NEW.aprobado_por := COALESCE(NEW.aprobado_por, auth.uid());
            NEW.aprobado_en := COALESCE(NEW.aprobado_en, now());
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

DROP TRIGGER IF EXISTS trg_normativa_control_aprobacion ON public.normativa;
CREATE TRIGGER trg_normativa_control_aprobacion
    BEFORE INSERT OR UPDATE ON public.normativa
    FOR EACH ROW EXECUTE FUNCTION public.normativa_control_aprobacion();

-- ----------------------------------------------------------------------------
-- 5. RPC de revisión (solo admin)
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

    INSERT INTO public.normativa_aprobaciones (normativa_id, usuario_id, accion, motivo)
    VALUES (
        p_id,
        auth.uid(),
        CASE WHEN p_aprobar THEN 'aprobar' ELSE 'rechazar' END,
        v_motivo
    );

    RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.revisar_normativa(uuid, boolean, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.revisar_normativa(uuid, boolean, text) TO authenticated;

-- ----------------------------------------------------------------------------
-- 6. RLS normativa: sube todo el staff, publica solo el admin (por trigger)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS normativa_insert_staff ON public.normativa;
CREATE POLICY normativa_insert_staff ON public.normativa
    FOR INSERT WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS normativa_update_staff ON public.normativa;
CREATE POLICY normativa_update_staff ON public.normativa
    FOR UPDATE USING (public.is_staff())
    WITH CHECK (public.is_staff());

CREATE OR REPLACE FUNCTION public.puede_borrar_normativa(p_id uuid)
RETURNS bool
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
          FROM public.normativa n
         WHERE n.id = p_id
           AND n.created_by = auth.uid()
           AND n.publicada = false
           AND n.estado_aprobacion <> 'aprobado'
           AND NOT EXISTS (
               SELECT 1 FROM public.normativa_aprobaciones a
                WHERE a.normativa_id = n.id AND a.accion = 'aprobar'
           )
    );
$$;

REVOKE ALL ON FUNCTION public.puede_borrar_normativa(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.puede_borrar_normativa(uuid) TO authenticated;

DROP POLICY IF EXISTS normativa_delete_propias ON public.normativa;
CREATE POLICY normativa_delete_propias ON public.normativa
    FOR DELETE USING (public.puede_borrar_normativa(id));

DROP TRIGGER IF EXISTS trg_normativa_updated_at ON public.normativa;
CREATE TRIGGER trg_normativa_updated_at
    BEFORE UPDATE ON public.normativa
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Ultimo acceso + protección de campos de usuarios
-- ----------------------------------------------------------------------------
ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS ultimo_acceso timestamptz;

CREATE OR REPLACE FUNCTION public.usuarios_proteger_campos()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL OR public.es_admin() THEN
        RETURN NEW;
    END IF;

    IF NEW.rol IS DISTINCT FROM OLD.rol
       OR NEW.activo IS DISTINCT FROM OLD.activo
       OR NEW.email IS DISTINCT FROM OLD.email
       OR NEW.id IS DISTINCT FROM OLD.id
       OR NEW.dependencia_id IS DISTINCT FROM OLD.dependencia_id THEN
        RAISE EXCEPTION 'No puedes modificar rol, estado, correo ni dependencia de tu cuenta'
            USING ERRCODE = '42501';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_usuarios_proteger_campos ON public.usuarios;
CREATE TRIGGER trg_usuarios_proteger_campos
    BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.usuarios_proteger_campos();
