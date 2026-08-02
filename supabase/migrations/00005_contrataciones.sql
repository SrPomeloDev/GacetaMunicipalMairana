-- ============================================================================
-- 00005_contrataciones.sql
-- Tabla de contrataciones públicas (SICOES-style) + RLS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contrataciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    slug text NOT NULL UNIQUE,
    tipo text NOT NULL CHECK (tipo IN ('licitacion', 'apoyo_nacional', 'compras_menores', 'contratacion_directa', 'emergencia')),
    modalidad text,
    objeto text,
    monto numeric(14, 2),
    empresa_adjudicada text,
    fecha_publicacion date NOT NULL DEFAULT CURRENT_DATE,
    fecha_presentacion date,
    fecha_adjudicacion date,
    archivo_pdf text,
    estado text NOT NULL DEFAULT 'publicada' CHECK (estado IN ('borrador', 'publicada', 'adjudicada', 'desierta', 'concluida')),
    publicada bool NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contrataciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contrataciones_select_public ON public.contrataciones;
DROP POLICY IF EXISTS contrataciones_insert_staff ON public.contrataciones;
DROP POLICY IF EXISTS contrataciones_update_staff ON public.contrataciones;
DROP POLICY IF EXISTS contrataciones_delete_admin ON public.contrataciones;

CREATE POLICY contrataciones_select_public ON public.contrataciones
    FOR SELECT USING (publicada = true OR public.is_staff());
CREATE POLICY contrataciones_insert_staff ON public.contrataciones
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));
CREATE POLICY contrataciones_update_staff ON public.contrataciones
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));
CREATE POLICY contrataciones_delete_admin ON public.contrataciones
    FOR DELETE USING (public.current_user_role() = 'admin');

DROP TRIGGER IF EXISTS trg_contrataciones_updated_at ON public.contrataciones;
CREATE TRIGGER trg_contrataciones_updated_at
    BEFORE UPDATE ON public.contrataciones
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
