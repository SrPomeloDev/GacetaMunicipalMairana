-- ============================================================================
-- 00002_search_and_rls.sql
-- Búsqueda de texto completo + políticas RLS + buckets + seed data
-- ============================================================================

-- ============================================================================
-- PARTE 1: Full-text search para normativa
-- ============================================================================

ALTER TABLE public.normativa ADD COLUMN search_vector tsvector;

CREATE OR REPLACE FUNCTION public.normativa_search_vector_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('spanish', COALESCE(NEW.numero, '')), 'A') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.titulo, '')), 'A') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.resumen, '')), 'B') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.contenido_texto, '')), 'C');
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normativa_search_vector
    BEFORE INSERT OR UPDATE ON public.normativa
    FOR EACH ROW
    EXECUTE FUNCTION public.normativa_search_vector_trigger();

CREATE INDEX idx_normativa_search_vector ON public.normativa USING GIN(search_vector);

-- Función de búsqueda con filtros y paginación
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
    -- Preparar tsquery si hay texto de búsqueda
    IF p_query IS NOT NULL AND p_query <> '' THEN
        v_query := plainto_tsquery('spanish', p_query);
        IF v_query IS NULL THEN
            v_query := to_tsquery('spanish', replace(p_query, ' ', ' & '));
        END IF;
    END IF;

    -- Calcular total de resultados (sin paginación)
    SELECT count(*) INTO v_total
    FROM public.normativa n
    WHERE (v_query IS NULL OR n.search_vector @@ v_query)
      AND (p_categoria_id IS NULL OR n.categoria_id = p_categoria_id)
      AND (p_estado IS NULL OR n.estado = p_estado)
      AND (p_fecha_desde IS NULL OR n.fecha_publicacion >= p_fecha_desde)
      AND (p_fecha_hasta IS NULL OR n.fecha_publicacion <= p_fecha_hasta);

    -- Retornar resultados paginados
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
    WHERE (v_query IS NULL OR n.search_vector @@ v_query)
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

-- ============================================================================
-- PARTE 2: RLS Policies
-- ============================================================================

-- Helper: función para verificar si el usuario pertenece al staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS bool
LANGUAGE plpgsql
SECURITY DEFINER STABLE
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.usuarios
        WHERE id = auth.uid()
          AND activo = true
          AND rol IN ('admin', 'editor', 'publicador')
    );
END;
$$;

-- Helper: rol del usuario actual
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER STABLE
AS $$
DECLARE
    v_rol text;
BEGIN
    SELECT rol INTO v_rol FROM public.usuarios WHERE id = auth.uid();
    RETURN v_rol;
END;
$$;

-- --------------------------------------------------------------------------
-- normativa
-- --------------------------------------------------------------------------
CREATE POLICY normativa_select_public ON public.normativa
    FOR SELECT USING (publicada = true);

CREATE POLICY normativa_select_staff ON public.normativa
    FOR SELECT USING (public.is_staff());

CREATE POLICY normativa_insert_staff ON public.normativa
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY normativa_update_staff ON public.normativa
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY normativa_delete_admin ON public.normativa
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- modificaciones_normativa
-- --------------------------------------------------------------------------
CREATE POLICY modificaciones_select_public ON public.modificaciones_normativa
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.normativa n
        WHERE n.id = normativa_id AND n.publicada = true
    ));

CREATE POLICY modificaciones_select_staff ON public.modificaciones_normativa
    FOR SELECT USING (public.is_staff());

CREATE POLICY modificaciones_insert_staff ON public.modificaciones_normativa
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY modificaciones_update_staff ON public.modificaciones_normativa
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY modificaciones_delete_admin ON public.modificaciones_normativa
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- noticias
-- --------------------------------------------------------------------------
CREATE POLICY noticias_select_public ON public.noticias
    FOR SELECT USING (publicada = true);

CREATE POLICY noticias_select_staff ON public.noticias
    FOR SELECT USING (public.is_staff());

CREATE POLICY noticias_insert_staff ON public.noticias
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY noticias_update_staff ON public.noticias
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY noticias_delete_admin ON public.noticias
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- autoridades
-- --------------------------------------------------------------------------
CREATE POLICY autoridades_select_public ON public.autoridades
    FOR SELECT USING (activo = true);

CREATE POLICY autoridades_select_staff ON public.autoridades
    FOR SELECT USING (public.is_staff());

CREATE POLICY autoridades_insert_staff ON public.autoridades
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY autoridades_update_staff ON public.autoridades
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY autoridades_delete_admin ON public.autoridades
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- concejales_comisiones
-- --------------------------------------------------------------------------
CREATE POLICY concejales_comisiones_select_public ON public.concejales_comisiones
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.autoridades a
        WHERE a.id = autoridad_id AND a.activo = true
    ));

CREATE POLICY concejales_comisiones_select_staff ON public.concejales_comisiones
    FOR SELECT USING (public.is_staff());

CREATE POLICY concejales_comisiones_insert_staff ON public.concejales_comisiones
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY concejales_comisiones_update_staff ON public.concejales_comisiones
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY concejales_comisiones_delete_admin ON public.concejales_comisiones
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- concejo_sesiones
-- --------------------------------------------------------------------------
CREATE POLICY concejo_sesiones_select_public ON public.concejo_sesiones
    FOR SELECT USING (true);

CREATE POLICY concejo_sesiones_insert_staff ON public.concejo_sesiones
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY concejo_sesiones_update_staff ON public.concejo_sesiones
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY concejo_sesiones_delete_admin ON public.concejo_sesiones
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- transparencia
-- --------------------------------------------------------------------------
CREATE POLICY transparencia_select_public ON public.transparencia
    FOR SELECT USING (publicada = true);

CREATE POLICY transparencia_select_staff ON public.transparencia
    FOR SELECT USING (public.is_staff());

CREATE POLICY transparencia_insert_staff ON public.transparencia
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY transparencia_update_staff ON public.transparencia
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY transparencia_delete_admin ON public.transparencia
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- tramites
-- --------------------------------------------------------------------------
CREATE POLICY tramites_select_public ON public.tramites
    FOR SELECT USING (activo = true);

CREATE POLICY tramites_select_staff ON public.tramites
    FOR SELECT USING (public.is_staff());

CREATE POLICY tramites_insert_staff ON public.tramites
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY tramites_update_staff ON public.tramites
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY tramites_delete_admin ON public.tramites
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- galeria
-- --------------------------------------------------------------------------
CREATE POLICY galeria_select_public ON public.galeria
    FOR SELECT USING (true);

CREATE POLICY galeria_insert_staff ON public.galeria
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY galeria_update_staff ON public.galeria
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY galeria_delete_admin ON public.galeria
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- categorias_normativa (lectura pública, solo staff escribe)
-- --------------------------------------------------------------------------
CREATE POLICY categorias_select_public ON public.categorias_normativa
    FOR SELECT USING (true);

CREATE POLICY categorias_insert_staff ON public.categorias_normativa
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY categorias_update_staff ON public.categorias_normativa
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY categorias_delete_admin ON public.categorias_normativa
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- dependencias (lectura pública, solo staff escribe)
-- --------------------------------------------------------------------------
CREATE POLICY dependencias_select_public ON public.dependencias
    FOR SELECT USING (true);

CREATE POLICY dependencias_insert_staff ON public.dependencias
    FOR INSERT WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY dependencias_update_staff ON public.dependencias
    FOR UPDATE USING (public.current_user_role() IN ('admin', 'editor'))
    WITH CHECK (public.current_user_role() IN ('admin', 'editor'));

CREATE POLICY dependencias_delete_admin ON public.dependencias
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- suscripciones (público puede insertar su propio email, staff gestiona)
-- --------------------------------------------------------------------------
CREATE POLICY suscripciones_insert_public ON public.suscripciones
    FOR INSERT WITH CHECK (true);

CREATE POLICY suscripciones_select_own ON public.suscripciones
    FOR SELECT USING (email = current_setting('request.jwt.claim.email', true) OR public.is_staff());

CREATE POLICY suscripciones_update_own ON public.suscripciones
    FOR UPDATE USING (email = current_setting('request.jwt.claim.email', true) OR public.current_user_role() = 'admin')
    WITH CHECK (email = current_setting('request.jwt.claim.email', true) OR public.current_user_role() = 'admin');

CREATE POLICY suscripciones_delete_admin ON public.suscripciones
    FOR DELETE USING (public.current_user_role() = 'admin');

-- --------------------------------------------------------------------------
-- usuarios (propio perfil o admin)
-- --------------------------------------------------------------------------
CREATE POLICY usuarios_select_own ON public.usuarios
    FOR SELECT USING (id = auth.uid() OR public.current_user_role() = 'admin');

CREATE POLICY usuarios_update_own ON public.usuarios
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY usuarios_insert_admin ON public.usuarios
    FOR INSERT WITH CHECK (public.current_user_role() = 'admin');

CREATE POLICY usuarios_delete_admin ON public.usuarios
    FOR DELETE USING (public.current_user_role() = 'admin');

-- ============================================================================
-- PARTE 3: Storage buckets
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, avif_autodetection)
VALUES
    ('pdfs', 'pdfs', true, false),
    ('imagenes', 'imagenes', true, false),
    ('firmas', 'firmas', true, false),
    ('actas', 'actas', true, false)
ON CONFLICT (id) DO NOTHING;

-- RLS para storage: lectura pública, solo staff escribe
CREATE POLICY storage_select_public ON storage.objects
    FOR SELECT USING (bucket_id IN ('pdfs', 'imagenes', 'firmas', 'actas'));

CREATE POLICY storage_insert_staff ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id IN ('pdfs', 'imagenes', 'firmas', 'actas')
        AND public.is_staff()
    );

CREATE POLICY storage_update_staff ON storage.objects
    FOR UPDATE USING (
        bucket_id IN ('pdfs', 'imagenes', 'firmas', 'actas')
        AND public.current_user_role() IN ('admin', 'editor')
    );

CREATE POLICY storage_delete_admin ON storage.objects
    FOR DELETE USING (
        bucket_id IN ('pdfs', 'imagenes', 'firmas', 'actas')
        AND public.current_user_role() = 'admin'
    );

-- ============================================================================
-- PARTE 4: Índices adicionales
-- ============================================================================

-- normativa
CREATE INDEX IF NOT EXISTS idx_normativa_estado_fecha ON public.normativa(estado, fecha_publicacion DESC);

-- noticias
CREATE INDEX IF NOT EXISTS idx_noticias_fecha_publicacion ON public.noticias(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON public.noticias(categoria);

-- autoridades
CREATE INDEX IF NOT EXISTS idx_autoridades_orden ON public.autoridades(orden, nombre_completo);

-- transparencia
CREATE INDEX IF NOT EXISTS idx_transparencia_categoria ON public.transparencia(categoria);
CREATE INDEX IF NOT EXISTS idx_transparencia_fecha ON public.transparencia(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_transparencia_publicada ON public.transparencia(publicada);

-- tramites
CREATE INDEX IF NOT EXISTS idx_tramites_slug_activo ON public.tramites(slug, activo);

-- galeria
CREATE INDEX IF NOT EXISTS idx_galeria_album_orden ON public.galeria(album, orden);

-- ============================================================================
-- PARTE 5: Seed data
-- ============================================================================

-- Categorías de normativa
INSERT INTO public.categorias_normativa (nombre, slug, descripcion, color, orden) VALUES
    ('Ley Municipal', 'ley-municipal', 'Leyes emitidas por el gobierno municipal', 'orange', 1),
    ('Decreto Municipal', 'decreto-municipal', 'Decretos emitidos por el Ejecutivo Municipal', 'blue', 2),
    ('Ordenanza Municipal', 'ordenanza-municipal', 'Ordenanzas aprobadas por el Concejo Municipal', 'green', 3),
    ('Resolución Municipal', 'resolucion-municipal', 'Resoluciones administrativas municipales', 'purple', 4),
    ('Acuerdo Municipal', 'acuerdo-municipal', 'Acuerdos del Concejo Municipal', 'teal', 5),
    ('Carta Orgánica', 'carta-organica', 'Carta Orgánica del Municipio', 'red', 6)
ON CONFLICT (slug) DO NOTHING;

-- Dependencias
INSERT INTO public.dependencias (nombre, slug, tipo, descripcion, orden) VALUES
    ('Concejo Municipal', 'concejo-municipal', 'legislativo', 'Órgano legislativo del municipio', 1),
    ('Alcaldía', 'alcaldia', 'ejecutivo', 'Despacho del Alcalde Municipal', 2),
    ('Secretaría de Administración', 'secretaria-de-administracion', 'administrativo', 'Gestión administrativa y financiera', 3),
    ('Secretaría de Obras Públicas', 'secretaria-de-obras-publicas', 'administrativo', 'Infraestructura y obras municipales', 4),
    ('Secretaría de Desarrollo Económico', 'secretaria-de-desarrollo-economico', 'administrativo', 'Fomento al desarrollo económico local', 5),
    ('Secretaría de Desarrollo Humano', 'secretaria-de-desarrollo-humano', 'administrativo', 'Programas sociales y desarrollo humano', 6)
ON CONFLICT (slug) DO NOTHING;
