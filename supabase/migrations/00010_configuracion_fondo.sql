-- Migración: imagen de fondo del portal en tabla configuracion
-- Ejecutar en Supabase SQL Editor DESPUÉS de la migración 00009

ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS fondo_url TEXT;