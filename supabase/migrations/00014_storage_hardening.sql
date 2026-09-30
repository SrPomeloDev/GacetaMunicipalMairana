-- 00014_storage_hardening.sql
--
-- Los limites por bucket (file_size_limit y allowed_mime_types) YA FUERON APLICADOS
-- via Storage API con scripts/aplicar-limites-storage.mjs, que lee la definicion de
-- src/lib/storage-limits.ts. No hace falta correr esta migracion para tenerlos.
--
-- Se conserva como registro de la correccion: la migracion 00004 pretendia fijar estos
-- limites pero uso ON CONFLICT (id) DO NOTHING sobre buckets que ya existian, asi que
-- nunca se aplicaron (los buckets quedaron en el default de 50 MB y sin MIME restriction).
--
-- Ojo: NO borra archivos. Los UPDATE de storage.buckets solo cambian metadatos; no
-- afectan a los objetos ya subidos (file_size_limit solo se evalua al subir).
-- Los buckets huerfanos (pdfs, imagenes, firmas, actas) NO se borran desde SQL: Supabase
-- lo bloquea con el trigger storage.protect_delete(). Se borran con la Storage API o el
-- Dashboard, ver scripts/eliminar-buckets-huerfanos.mjs.

UPDATE storage.buckets
SET file_size_limit = 2097152,   -- 2 MB
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'],
    public = true,
    updated_at = now()
WHERE id = 'noticias-imagenes';

UPDATE storage.buckets
SET file_size_limit = 3145728,   -- 3 MB
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'],
    public = true,
    updated_at = now()
WHERE id = 'galeria';

UPDATE storage.buckets
SET file_size_limit = 4194304,   -- 4 MB
    allowed_mime_types = ARRAY['application/pdf'],
    public = true,
    updated_at = now()
WHERE id = 'normativa-pdf';

UPDATE storage.buckets
SET file_size_limit = 4194304,   -- 4 MB
    allowed_mime_types = ARRAY[
      'application/pdf',
      'image/png', 'image/jpeg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    public = true,
    updated_at = now()
WHERE id = 'documentos';

-- Politicas de 00002 que solo aplican a los buckets huerfanos de 00002. Los buckets reales
-- usan las suyas, creadas en 00012 (storage_*_new).
DROP POLICY IF EXISTS storage_select_public ON storage.objects;
DROP POLICY IF EXISTS storage_insert_staff ON storage.objects;
DROP POLICY IF EXISTS storage_update_staff ON storage.objects;
DROP POLICY IF EXISTS storage_delete_admin ON storage.objects;

-- Verificacion: deben aparecer los 4 buckets reales con sus limites.
SELECT id, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY id;
