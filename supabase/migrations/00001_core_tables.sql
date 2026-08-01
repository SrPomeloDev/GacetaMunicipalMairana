-- ============================================================================
-- 00001_core_tables.sql
-- Tablas base del sistema Gaceta Municipal
-- ============================================================================

-- 1. usuarios (extiende auth.users)
CREATE TABLE public.usuarios (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre text NOT NULL,
    email text,
    avatar_url text,
    rol text NOT NULL CHECK (rol IN ('admin', 'editor', 'publicador')),
    dependencia_id uuid,
    activo bool NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger: crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.usuarios (id, nombre, email, avatar_url, rol)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data ->> 'nombre', new.email),
        new.email,
        new.raw_user_meta_data ->> 'avatar_url',
        COALESCE(new.raw_user_meta_data ->> 'rol', 'editor')
    );
    RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 2. categorias_normativa
CREATE TABLE public.categorias_normativa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    slug text NOT NULL UNIQUE,
    descripcion text,
    color text NOT NULL DEFAULT 'orange',
    icono text,
    orden int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. dependencias
CREATE TABLE public.dependencias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    slug text NOT NULL UNIQUE,
    tipo text NOT NULL CHECK (tipo IN ('ejecutivo', 'legislativo', 'administrativo')),
    descripcion text,
    telefono text,
    correo text,
    horario text,
    orden int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- FK: usuarios -> dependencias
ALTER TABLE public.usuarios
    ADD CONSTRAINT fk_usuarios_dependencia
    FOREIGN KEY (dependencia_id) REFERENCES public.dependencias(id);

-- 4. normativa (tabla principal)
CREATE TABLE public.normativa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero text NOT NULL,
    slug text NOT NULL UNIQUE,
    titulo text NOT NULL,
    resumen text,
    contenido_texto text,
    categoria_id uuid REFERENCES public.categorias_normativa(id),
    dependencia_id uuid REFERENCES public.dependencias(id),
    estado text NOT NULL DEFAULT 'vigente' CHECK (estado IN ('vigente', 'derogada', 'modificada', 'suspendida', 'abrogada')),
    fecha_aprobacion date,
    fecha_publicacion date,
    fecha_vigencia date,
    numero_paginas int,
    archivo_pdf text,
    firma_digital text,
    codigo_qr text,
    visitas int NOT NULL DEFAULT 0,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    publicada bool NOT NULL DEFAULT false,
    created_by uuid REFERENCES public.usuarios(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. modificaciones_normativa
CREATE TABLE public.modificaciones_normativa (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    normativa_id uuid NOT NULL REFERENCES public.normativa(id) ON DELETE CASCADE,
    normativa_modificadora_id uuid NOT NULL REFERENCES public.normativa(id) ON DELETE RESTRICT,
    tipo_modificacion text NOT NULL CHECK (tipo_modificacion IN ('deroga', 'modifica', 'complementa', 'suspende', 'prorroga')),
    articulos_afectados text,
    descripcion text,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. noticias
CREATE TABLE public.noticias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    slug text NOT NULL UNIQUE,
    resumen text,
    contenido text,
    imagen_principal text,
    categoria text NOT NULL CHECK (categoria IN ('institucional', 'evento', 'programa', 'comunicado', 'cultura')),
    destacada bool NOT NULL DEFAULT false,
    publicada bool NOT NULL DEFAULT false,
    fecha_publicacion timestamptz,
    autor_id uuid REFERENCES public.usuarios(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 7. autoridades
CREATE TABLE public.autoridades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo text NOT NULL,
    cargo text NOT NULL,
    dependencia_id uuid REFERENCES public.dependencias(id),
    tipo_autoridad text NOT NULL CHECK (tipo_autoridad IN ('alcalde', 'concejal', 'secretario', 'director', 'jefe_unidad', 'subalcalde')),
    partido text,
    foto text,
    biografia text,
    formacion text,
    funciones text,
    telefono text,
    correo text,
    activo bool NOT NULL DEFAULT true,
    orden int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 8. concejales_comisiones
CREATE TABLE public.concejales_comisiones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    autoridad_id uuid NOT NULL REFERENCES public.autoridades(id) ON DELETE CASCADE,
    comision text NOT NULL,
    cargo_comision text NOT NULL CHECK (cargo_comision IN ('presidente', 'secretario', 'vocal', 'miembro')),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. concejo_sesiones
CREATE TABLE public.concejo_sesiones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_sesion text NOT NULL,
    fecha date NOT NULL,
    tipo text NOT NULL CHECK (tipo IN ('ordinaria', 'extraordinaria', 'audiencia_publica', 'instalacion')),
    acta_pdf text,
    agenda text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. transparencia
CREATE TABLE public.transparencia (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    categoria text NOT NULL CHECK (categoria IN ('presupuesto', 'poa', 'pei', 'contratacion', 'auditoria', 'financiero', 'declaracion', 'informe')),
    descripcion text,
    archivo_pdf text,
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    publicada bool NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 11. tramites
CREATE TABLE public.tramites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    slug text NOT NULL UNIQUE,
    descripcion text,
    requisitos text[],
    formulario_pdf text,
    dependencia_id uuid REFERENCES public.dependencias(id),
    tiempo_estimado text,
    costo text,
    activo bool NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. galeria
CREATE TABLE public.galeria (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo text NOT NULL,
    descripcion text,
    imagen text NOT NULL,
    album text NOT NULL DEFAULT 'General',
    fecha date NOT NULL DEFAULT CURRENT_DATE,
    orden int NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 13. suscripciones
CREATE TABLE public.suscripciones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    categorias text[],
    activo bool NOT NULL DEFAULT true,
    token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- RLS: Habilitar en todas las tablas
-- ============================================================================
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_normativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dependencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.normativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modificaciones_normativa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autoridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concejales_comisiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concejo_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transparencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Índices
-- ============================================================================
-- usuarios
CREATE INDEX idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX idx_usuarios_dependencia_id ON public.usuarios(dependencia_id);

-- normativa
CREATE INDEX idx_normativa_categoria_id ON public.normativa(categoria_id);
CREATE INDEX idx_normativa_dependencia_id ON public.normativa(dependencia_id);
CREATE INDEX idx_normativa_created_by ON public.normativa(created_by);
CREATE INDEX idx_normativa_estado ON public.normativa(estado);
CREATE INDEX idx_normativa_fecha_publicacion ON public.normativa(fecha_publicacion);
CREATE INDEX idx_normativa_publicada ON public.normativa(publicada);
CREATE INDEX idx_normativa_slug ON public.normativa(slug);

-- modificaciones_normativa
CREATE INDEX idx_mod_normativa_id ON public.modificaciones_normativa(normativa_id);
CREATE INDEX idx_mod_normativa_modificadora_id ON public.modificaciones_normativa(normativa_modificadora_id);

-- noticias
CREATE INDEX idx_noticias_autor_id ON public.noticias(autor_id);
CREATE INDEX idx_noticias_slug ON public.noticias(slug);
CREATE INDEX idx_noticias_publicada ON public.noticias(publicada);

-- autoridades
CREATE INDEX idx_autoridades_dependencia_id ON public.autoridades(dependencia_id);

-- concejales_comisiones
CREATE INDEX idx_conc_com_autoridad_id ON public.concejales_comisiones(autoridad_id);

-- tramites
CREATE INDEX idx_tramites_dependencia_id ON public.tramites(dependencia_id);
CREATE INDEX idx_tramites_slug ON public.tramites(slug);
CREATE INDEX idx_tramites_activo ON public.tramites(activo);

-- galeria
CREATE INDEX idx_galeria_album ON public.galeria(album);

-- suscripciones
CREATE INDEX idx_suscripciones_token ON public.suscripciones(token);
