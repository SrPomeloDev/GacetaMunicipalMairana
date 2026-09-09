-- 00010_noticias_facebook.sql
-- Columna opcional para pegar el enlace de una publicación de Facebook.
-- Si tiene valor, la ficha pública muestra el post incrustado.
-- Aplicar en SQL Editor de Supabase (no se ejecuta localmente).

ALTER TABLE public.noticias ADD COLUMN IF NOT EXISTS facebook_url text;
