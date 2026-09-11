-- ============================================================================
-- 00012_seguridad_publicacion_y_storage.sql
-- 1) buscar_normativa: solo devuelve normativa publicada (los borradores
--    nunca deben salir por búsqueda pública aunque se adivine el texto).
-- 2) Storage: políticas RLS para los buckets reales
--    (noticias-imagenes, normativa-pdf, galeria, documentos), que 00004 creó
--    sin políticas. Espejo del esquema de 00002: lectura pública,
--    escritura staff, borrado solo admin.
-- Aplicar en SQL Editor de Supabase (no se ejecuta localmente).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. buscar_normativa filtrada por publicada = true
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.buscar_normativa(
    p_query text DEFAULT NULL,
    p_categoria_id uuid DEFAULT NULL,
    p_estado text DEFAULT NULL,
    p_fecha_desde date DEFAULT NULL,
    p_fecha_hasta date DEFAULT NULL,
    p_limit int DEFAULT 20,
    p_offset int DEFAULT 0
)
RETURNS TABLE(
    id uuid,
    numero text,
    titulo text,
    resumen text,
    slug text,
    categoria_id uuid,
    estado text,
    fecha_publicacion date,
    visitas int,
    rank real,
    total_count bigint
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_query tsquery;
    v_total bigint;
BEGIN
    IF p_query IS NOT NULL AND p_query <> '' THEN
        v_query := plainto_tsquery('spanish', p_query);
        IF v_query IS NULL THEN
            v_query := to_tsquery('spanish', replace(p_query, ' ', ' & '));
        END IF;
    END IF;

    SELECT count(*) INTO v_total
    FROM public.normativa n
    WHERE n.publicada = true
      AND (v_query IS NULL OR n.search_vector @@ v_query)
      AND (p_categoria_id IS NULL OR n.categoria_id = p_categoria_id)
      AND (p_estado IS NULL OR n.estado = p_estado)
      AND (p_fecha_desde IS NULL OR n.fecha_publicacion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR n.fecha_publicacion <= p_fecha_hasta);

    RETURN QUERY
    SELECT
        n.id,
        n.numero,
        n.titulo,
        n.resumen,
        n.slug,
        n.categoria_id,
        n.estado,
        n.fecha_publicacion,
        n.visitas,
        CASE
            WHEN v_query IS NOT NULL THEN ts_rank(n.search_vector, v_query)
            ELSE 0::real
        END AS rank,
        v_total AS total_count
    FROM public.normativa n
    WHERE n.publicada = true
      AND (v_query IS NULL OR n.search_vector @@ v_query)
      AND (p_categoria_id IS NULL OR n.categoria_id = p_categoria_id)
      AND (p_estado IS NULL OR n.estado = p_estado)
      AND (p_fecha_desde IS NULL OR n.fecha_publicacion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR n.fecha_publicacion <= p_fecha_hasta)
    ORDER BY
        CASE WHEN v_query IS NOT NULL THEN ts_rank(n.search_vector, v_query) ELSE NULL END DESC NULLS LAST,
        n.fecha_publicacion DESC NULLS LAST
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- ----------------------------------------------------------------------------
-- 2. Storage RLS para los buckets reales
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS storage_select_public_new ON storage.objects;
CREATE POLICY storage_select_public_new ON storage.objects
    FOR SELECT USING (bucket_id IN ('noticias-imagenes', 'normativa-pdf', 'galeria', 'documentos'));

DROP POLICY IF EXISTS storage_insert_staff_new ON storage.objects;
CREATE POLICY storage_insert_staff_new ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id IN ('noticias-imagenes', 'normativa-pdf', 'galeria', 'documentos')
        AND public.is_staff()
    );

DROP POLICY IF EXISTS storage_update_staff_new ON storage.objects;
CREATE POLICY storage_update_staff_new ON storage.objects
    FOR UPDATE USING (
        bucket_id IN ('noticias-imagenes', 'normativa-pdf', 'galeria', 'documentos')
        AND public.current_user_role() IN ('admin', 'editor')
    );

DROP POLICY IF EXISTS storage_delete_admin_new ON storage.objects;
CREATE POLICY storage_delete_admin_new ON storage.objects
    FOR DELETE USING (
        bucket_id IN ('noticias-imagenes', 'normativa-pdf', 'galeria', 'documentos')
        AND public.current_user_role() = 'admin'
    );
