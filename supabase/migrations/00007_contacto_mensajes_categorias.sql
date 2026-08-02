-- ============================================================================
-- 00007_contacto_mensajes_categorias.sql
-- Extiende contacto_mensajes: categoría del mensaje + envío anónimo (denuncias)
-- ============================================================================

ALTER TABLE public.contacto_mensajes
    ADD COLUMN IF NOT EXISTS categoria text NOT NULL DEFAULT 'general'
        CHECK (categoria IN ('general', 'tramite', 'reclamo', 'denuncia', 'sugerencia', 'informacion_publica', 'normativa'));

ALTER TABLE public.contacto_mensajes
    ADD COLUMN IF NOT EXISTS anonimo bool NOT NULL DEFAULT false;