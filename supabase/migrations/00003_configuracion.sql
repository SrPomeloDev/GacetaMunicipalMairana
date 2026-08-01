-- ============================================================================
-- 00003_configuracion.sql
-- Tabla de configuración general del sitio (una sola fila)
-- ============================================================================

CREATE TABLE public.configuracion (
    id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    municipio text NOT NULL DEFAULT 'Gobierno Autónomo Municipal de Mairana',
    lema text,
    direccion text,
    telefono text,
    email text,
    facebook text,
    twitter text,
    youtube text,
    instagram text,
    color_primario text NOT NULL DEFAULT '#EA580C',
    logo_url text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracion ENABLE ROW LEVEL SECURITY;

INSERT INTO public.configuracion (id) VALUES (1) ON CONFLICT DO NOTHING;

CREATE POLICY configuracion_select_public ON public.configuracion
    FOR SELECT USING (true);

CREATE POLICY configuracion_update_admin ON public.configuracion
    FOR UPDATE USING (public.current_user_role() = 'admin')
    WITH CHECK (public.current_user_role() = 'admin');
