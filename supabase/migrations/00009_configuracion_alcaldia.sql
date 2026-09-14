-- Migración: campos de Alcaldía y horario en tabla configuracion
-- Ejecutar en Supabase SQL Editor DESPUÉS de la migración 00003

ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS alcalde_foto TEXT;
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS alcalde_nombre TEXT DEFAULT 'Andres Fidel Rocha Rosales';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS alcalde_cargo TEXT DEFAULT 'Alcalde Municipal — Gestión 2026';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS descripcion_municipio TEXT DEFAULT 'Comprometidos con el desarrollo sostenible, la transparencia y el bienestar de los 12,735 mairaneños.';
ALTER TABLE configuracion ADD COLUMN IF NOT EXISTS horario TEXT DEFAULT 'Lun a Vie 08:00 - 16:00';
