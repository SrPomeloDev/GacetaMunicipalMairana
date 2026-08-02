-- ============================================================================
-- 00004_configuracion_policies_improvements.sql
-- 1) Corrige configuracion: políticas INSERT/UPDATE para staff (admin + editor)
-- 2) Trigger genérico updated_at para tablas con columna updated_at
-- 3) Crea buckets de storage (idempotente)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. configuracion — permitir a staff (admin + editor) insertar/actualizar
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS configuracion_insert_staff ON public.configuracion;
CREATE POLICY configuracion_insert_staff ON public.configuracion
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

DROP POLICY IF EXISTS configuracion_update_admin ON public.configuracion;
DROP POLICY IF EXISTS configuracion_update_staff ON public.configuracion;
CREATE POLICY configuracion_update_staff ON public.configuracion
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

-- ----------------------------------------------------------------------------
-- 2. Trigger genérico updated_at
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'configuracion'
    ]
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%I', t, t);
        EXECUTE format(
            'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%I
             FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
            t, t
        );
    END LOOP;
END;
$$;

-- ----------------------------------------------------------------------------
-- 3. Buckets de storage (idempotente: inserta solo si no existen)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('noticias-imagenes', 'noticias-imagenes', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('normativa-pdf', 'normativa-pdf', true, 15728640, ARRAY['application/pdf']),
    ('galeria', 'galeria', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('documentos', 'documentos', true, 20971520, NULL)
ON CONFLICT (id) DO NOTHING;
