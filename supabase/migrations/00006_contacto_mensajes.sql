-- ============================================================================
-- 00006_contacto_mensajes.sql
-- Tabla de mensajes enviados desde el formulario de contacto + RLS
--  - INSERT público (cualquier visitante puede enviar un mensaje)
--  - SELECT/UPDATE/DELETE solo staff (admin + editor)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.contacto_mensajes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    email text NOT NULL,
    asunto text,
    mensaje text NOT NULL,
    leido bool NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contacto_mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS contacto_mensajes_insert_public ON public.contacto_mensajes;
CREATE POLICY contacto_mensajes_insert_public ON public.contacto_mensajes
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS contacto_mensajes_select_staff ON public.contacto_mensajes;
CREATE POLICY contacto_mensajes_select_staff ON public.contacto_mensajes
    FOR SELECT USING (public.is_staff());

DROP POLICY IF EXISTS contacto_mensajes_update_staff ON public.contacto_mensajes;
CREATE POLICY contacto_mensajes_update_staff ON public.contacto_mensajes
    FOR UPDATE USING (public.is_staff())
    WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS contacto_mensajes_delete_staff ON public.contacto_mensajes;
CREATE POLICY contacto_mensajes_delete_staff ON public.contacto_mensajes
    FOR DELETE USING (public.is_staff());