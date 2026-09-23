-- Migración: número de WhatsApp del municipio en tabla configuracion
-- Ejecutar en Supabase SQL Editor DESPUÉS de la migración 00012

ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS whatsapp TEXT;