-- ============================================================================
-- 00008_mensajes_flujo.sql
-- Extiende contacto_mensajes: estado del mensaje + respuesta del admin
--  - estado: 'nuevo' | 'en_revision' | 'respondido' | 'cerrado'
--  - respuesta: texto con la respuesta del staff
--  - respondido_en: timestamp de cuándo se marcó como respondido
-- ============================================================================

ALTER TABLE public.contacto_mensajes
    ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'nuevo'
        CHECK (estado IN ('nuevo', 'en_revision', 'respondido', 'cerrado'));

ALTER TABLE public.contacto_mensajes
    ADD COLUMN IF NOT EXISTS respuesta text;

ALTER TABLE public.contacto_mensajes
    ADD COLUMN IF NOT EXISTS respondido_en timestamptz;