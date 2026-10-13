export interface SeccionManualMeta {
  id: string
  titulo: string
  categoria: string
  subtitulo: string
  descripcion: string
  icono: string
  urlPanel?: string
  rolRequerido: "admin" | "editor" | "publicador" | "todos"
}

export interface CampoDocumentado {
  nombre: string
  tipo?: string
  requerido?: boolean
  descripcion: string
  ejemplo: string
}

export interface PasoAccion {
  numero: number
  titulo: string
  descripcion: string
  consejo?: string
}

export interface MockFormField {
  name: string
  label: string
  type?: "text" | "select" | "textarea" | "checkbox" | "file-stub"
  value?: string | boolean
  options?: { value: string; label: string }[]
  readOnly?: boolean
  helpText?: string
}

export interface MockTablaRegistro {
  [key: string]: string | number | boolean
}

export interface MockTablaConfig {
  columnas: { key: string; label: string }[]
  filas: MockTablaRegistro[]
}

export interface ContenidoSeccionManual {
  meta: SeccionManualMeta
  proposito: string
  requisitos?: string[]
  pasos: PasoAccion[]
  campos: CampoDocumentado[]
  mockForm?: {
    titulo: string
    subtitulo: string
    campos: MockFormField[]
    botonTexto?: string
  }
  mockTabla?: MockTablaConfig
  notas?: string[]
  erroresComunes?: {
    error: string
    causa: string
    solucion: string
  }[]
}

export const SECCIONES_MANUAL: SeccionManualMeta[] = [
  {
    id: "acceso",
    titulo: "Acceso y Seguridad",
    categoria: "General",
    subtitulo: "Inicio de sesión, credenciales y recuperación",
    descripcion: "Autenticación segura en el panel de control municipal, roles y cierre de sesión.",
    icono: "Lock",
    urlPanel: "/admin/login",
    rolRequerido: "todos",
  },
  {
    id: "dashboard",
    titulo: "Panel de Control",
    categoria: "General",
    subtitulo: "Métricas en tiempo real y accesos rápidos",
    descripcion: "Resumen estadístico de normativas, noticias, trámites y accesos directos de gestión.",
    icono: "Home",
    urlPanel: "/admin/dashboard",
    rolRequerido: "todos",
  },
  {
    id: "normativa",
    titulo: "Normativa Municipal",
    categoria: "Gaceta Oficial",
    subtitulo: "Leyes, decretos, resoluciones y ordenanzas",
    descripcion: "Registro oficial, estados de vigencia, texto completo, PDFs escaneados y modificaciones.",
    icono: "ScrollText",
    urlPanel: "/admin/normativa",
    rolRequerido: "publicador",
  },
  {
    id: "noticias",
    titulo: "Noticias Institucionales",
    categoria: "Comunicación",
    subtitulo: "Boletines, artículos y enlaces a redes",
    descripcion: "Publicaciones oficiales, noticias destacadas en portada, fotos y vínculos de Facebook.",
    icono: "Newspaper",
    urlPanel: "/admin/noticias",
    rolRequerido: "editor",
  },
  {
    id: "autoridades",
    titulo: "Autoridades Municipales",
    categoria: "Institucional",
    subtitulo: "Gabinete ejecutivo, concejo y directores",
    descripcion: "Nómina institucional con fotos oficiales, cargos, contacto y orden jerárquico.",
    icono: "Users",
    urlPanel: "/admin/autoridades",
    rolRequerido: "editor",
  },
  {
    id: "dependencias",
    titulo: "Dependencias y Unidades",
    categoria: "Institucional",
    subtitulo: "Direcciones, secretarías y jefaturas",
    descripcion: "Catálogo de oficinas municipales, siglas, responsabilidades y líneas de atención.",
    icono: "Building2",
    urlPanel: "/admin/dependencias",
    rolRequerido: "editor",
  },
  {
    id: "categorias",
    titulo: "Categorías del Sistema",
    categoria: "Clasificación",
    subtitulo: "Taxonomía de contenidos del portal",
    descripcion: "Gestión de etiquetas y clasificación temática para normativa, noticias y trámites.",
    icono: "Filter",
    urlPanel: "/admin/categorias",
    rolRequerido: "editor",
  },
  {
    id: "concejo",
    titulo: "Concejo Municipal",
    categoria: "Institucional",
    subtitulo: "Sesiones plenarias y comisiones de trabajo",
    descripcion: "Actas oficiales de sesiones, agendas correlativas y conformación de comisiones.",
    icono: "Landmark",
    urlPanel: "/admin/concejo",
    rolRequerido: "editor",
  },
  {
    id: "transparencia",
    titulo: "Transparencia (Ley 341)",
    categoria: "Rendición de Cuentas",
    subtitulo: "Presupuestos, POA, auditorías e informes",
    descripcion: "Publicación obligatoria de balances financieros, planificación y documentos de control.",
    icono: "ShieldCheck",
    urlPanel: "/admin/transparencia",
    rolRequerido: "editor",
  },
  {
    id: "tramites",
    titulo: "Trámites y Servicios",
    categoria: "Atención Ciudadana",
    subtitulo: "Guía de procedimientos, aranceles y requisitos",
    descripcion: "Catálogo de trámites vecinales, tiempos estimados, requisitos y formularios descargables.",
    icono: "ClipboardList",
    urlPanel: "/admin/tramites",
    rolRequerido: "editor",
  },
  {
    id: "galeria",
    titulo: "Galería de Imágenes",
    categoria: "Comunicación",
    subtitulo: "Registro fotográfico de obras y eventos",
    descripcion: "Álbumes temáticos de inauguraciones, obras comunales, ferias y actividades culturales.",
    icono: "Images",
    urlPanel: "/admin/galeria",
    rolRequerido: "editor",
  },
  {
    id: "contrataciones",
    titulo: "Contrataciones Públicas",
    categoria: "Licitaciones",
    subtitulo: "Procesos SICOES, ANPE y licitaciones",
    descripcion: "Convocatorias públicas, montos referenciales, pliegos PDF y actas de adjudicación.",
    icono: "Gavel",
    urlPanel: "/admin/contrataciones",
    rolRequerido: "editor",
  },
  {
    id: "suscripciones",
    titulo: "Suscripciones al Boletín",
    categoria: "Comunicación",
    subtitulo: "Padrón de vecinos suscriptores",
    descripcion: "Control de altas, bajas y estados de suscripción para envíos informativos.",
    icono: "Mail",
    urlPanel: "/admin/suscripciones",
    rolRequerido: "editor",
  },
  {
    id: "mensajes",
    titulo: "Bandeja de Mensajes",
    categoria: "Atención Ciudadana",
    subtitulo: "Consultas, reclamos y denuncias ciudadanas",
    descripcion: "Atención de correspondencia digital ciudadana con soporte para denuncias anónimas.",
    icono: "MessageSquare",
    urlPanel: "/admin/mensajes",
    rolRequerido: "editor",
  },
  {
    id: "usuarios",
    titulo: "Usuarios y Permisos",
    categoria: "Seguridad",
    subtitulo: "Cuentas de funcionarios y matriz de acceso",
    descripcion: "Administración de usuarios, asignación de roles y permisos específicos por módulo.",
    icono: "UserGear",
    urlPanel: "/admin/usuarios",
    rolRequerido: "admin",
  },
  {
    id: "configuracion",
    titulo: "Configuración y Perfil",
    categoria: "Administración",
    subtitulo: "Datos institucionales, portal y mi cuenta",
    descripcion: "Parámetros globales del municipio, imagen institucional, redes sociales y perfil personal.",
    icono: "SlidersHorizontal",
    urlPanel: "/admin/configuracion",
    rolRequerido: "admin",
  },
  {
    id: "archivos",
    titulo: "Almacenamiento de Archivos",
    categoria: "Infraestructura",
    subtitulo: "Políticas de buckets, cuotas y optimización",
    descripcion: "Límites técnicos de almacenamiento, compresión automática WebP y resolución de fallos.",
    icono: "FolderOpen",
    urlPanel: "/admin/configuracion",
    rolRequerido: "todos",
  },
]

export const CONTENIDO_MANUAL: Record<string, ContenidoSeccionManual> = {
  acceso: {
    meta: SECCIONES_MANUAL[0],
    proposito:
      "El módulo de Acceso regula el ingreso autenticado de funcionarios y operadores de la Gaceta Municipal. Las credenciales se verifican mediante Supabase Auth y validan el estado de la cuenta en la base de datos.",
    requisitos: [
      "Contar con una cuenta institucional previamente dada de alta por un Administrador.",
      "Disponer de un correo electrónico válido y contraseña de al menos 6 caracteres.",
      "Mantener la cuenta en estado activo en el padrón de usuarios.",
    ],
    pasos: [
      {
        numero: 1,
        titulo: "Ingreso al formulario de login",
        descripcion:
          "Diríjase a la ruta /admin/login desde cualquier navegador moderno o mediante el enlace 'Acceso Funcionarios' del portal público.",
      },
      {
        numero: 2,
        titulo: "Introducción de credenciales",
        descripcion:
          "Escriba su correo electrónico registrado y su contraseña personal. Si el teclado tiene Bloq Mayús activo, verifique antes de enviar.",
      },
      {
        numero: 3,
        titulo: "Validación y redirección",
        descripcion:
          "Al hacer clic en 'Iniciar Sesión', el sistema verifica que la cuenta esté activa. Si la autenticación es correcta, será derivado automáticamente al Panel de Control (/admin/dashboard).",
        consejo: "Si su sesión permanece inactiva por un período prolongado, el sistema solicitará renovar credenciales.",
      },
      {
        numero: 4,
        titulo: "Cierre seguro de sesión",
        descripcion:
          "Para salir de una terminal compartida, pulse en el menú superior o en la barra lateral el botón 'Cerrar Sesión'. Nunca deje terminales de carga abiertas al público.",
      },
    ],
    campos: [
      {
        nombre: "Correo Electrónico",
        tipo: "Texto (Email)",
        requerido: true,
        descripcion: "Dirección de correo electrónico asociada al usuario en el sistema.",
        ejemplo: "EJ-operador@mairana.gob.bo",
      },
      {
        nombre: "Contraseña",
        tipo: "Contraseña",
        requerido: true,
        descripcion: "Clave de acceso confidencial asignada al usuario.",
        ejemplo: "EJ-ClaveSegura2026*",
      },
    ],
    mockForm: {
      titulo: "Iniciar Sesión Institucional",
      subtitulo: "Credenciales de acceso para personal autorizado del municipio.",
      campos: [
        { name: "email", label: "Correo Electrónico", type: "text", value: "EJ-funcionario@mairana.gob.bo" },
        { name: "password", label: "Contraseña", type: "text", value: "••••••••••••" },
      ],
      botonTexto: "Iniciar Sesión",
    },
    notas: [
      "El registro público de usuarios se encuentra desactivado por política de seguridad.",
      "Si un usuario inactivo intenta ingresar, el middleware rechazará el acceso con aviso de cuenta inactiva.",
    ],
    erroresComunes: [
      {
        error: "Credenciales inválidas",
        causa: "Correo o contraseña escritos de manera errónea.",
        solucion: "Verifique mayúsculas y solicite a un administrador el restablecimiento si no recuerda la clave.",
      },
      {
        error: "Cuenta inactiva (?error=inactive)",
        causa: "El usuario fue suspendido o dado de baja temporalmente en el panel.",
        solucion: "Contacte al Administrador General para reactivar la cuenta.",
      },
    ],
  },

  dashboard: {
    meta: SECCIONES_MANUAL[1],
    proposito:
      "El Dashboard ofrece una vista panorámica instantánea del estado de la plataforma, consolidando estadísticas operativas de normativas, noticias publicadas, trámites en curso y accesos rápidos.",
    pasos: [
      {
        numero: 1,
        titulo: "Revisión de tarjetas de conteo",
        descripcion:
          "Observe los indicadores superiores que reportan el volumen de normativas vigentes, noticias publicadas, trámites disponibles y solicitudes pendientes.",
      },
      {
        numero: 2,
        titulo: "Monitoreo de actividad reciente",
        descripcion:
          "Consulte la lista de últimas publicaciones para corroborar que los decretos u ordenanzas recién subidos ya estén visibles al ciudadano.",
      },
      {
        numero: 3,
        titulo: "Navegación mediante atajos directos",
        descripcion:
          "Utilice los botones de acción rápida para iniciar una nueva norma, cargar un boletín informativo o verificar la bandeja de mensajes.",
      },
    ],
    campos: [
      {
        nombre: "Normativas Publicadas",
        tipo: "Métrica numérica",
        descripcion: "Total acumulado de leyes, decretos, resoluciones y ordenanzas visibles al público.",
        ejemplo: "142 documentos",
      },
      {
        nombre: "Noticias en Portada",
        tipo: "Métrica numérica",
        descripcion: "Artículos y comunicados activos en el portal informativo.",
        ejemplo: "28 publicaciones",
      },
      {
        nombre: "Trámites Activos",
        tipo: "Métrica numérica",
        descripcion: "Procedimientos administrativos vigentes a disposición de la ciudadanía.",
        ejemplo: "19 guías",
      },
      {
        nombre: "Mensajes Nuevos",
        tipo: "Métrica de alerta",
        descripcion: "Correspondencia digital ciudadana pendiente de revisión.",
        ejemplo: "4 pendientes",
      },
    ],
    mockTabla: {
      columnas: [
        { key: "modulo", label: "Módulo" },
        { key: "total", label: "Registros" },
        { key: "estado", label: "Estado Operativo" },
        { key: "ultimo", label: "Última Actualización" },
      ],
      filas: [
        { modulo: "Normativa Municipal", total: 142, estado: "Actualizado", ultimo: "Hoy 08:30" },
        { modulo: "Noticias Institucionales", total: 28, estado: "Al día", ultimo: "Ayer 17:15" },
        { modulo: "Trámites y Aranceles", total: 19, estado: "Revisado", ultimo: "Hace 3 días" },
        { modulo: "Mensajes Ciudadanos", total: 4, estado: "Atención requerida", ultimo: "Hoy 09:10" },
      ],
    },
    notas: [
      "Los conteos se actualizan automáticamente al ingresar al panel.",
      "Solo se computan registros con estado activo o publicado para los resúmenes públicos.",
    ],
  },

  normativa: {
    meta: SECCIONES_MANUAL[2],
    proposito:
      "Administra el cuerpo legal del Municipio de Mairana. Permite catalogar leyes, decretos, resoluciones, ordenanzas y acuerdos, adjuntar el PDF oficial escaneado y registrar el árbol de modificaciones y derogaciones.",
    requisitos: [
      "Documento oficial aprobado con número de correlativo y fecha de promulgación.",
      "Archivo PDF digitalizado que no exceda 4 MB.",
      "Resumen claro de la disposición legal para facilitar el motor de búsqueda.",
    ],
    pasos: [
      {
        numero: 1,
        titulo: "Acceso al catálogo normativo",
        descripcion: "Ingrese a /admin/normativa y haga clic en 'Nueva Normativa' en la esquina superior derecha.",
      },
      {
        numero: 2,
        titulo: "Completar metadatos legales",
        descripcion:
          "Ingrese el número oficial (ej. 01/2026), título descriptivo, categoría legal (Ley, Decreto, Resolución, Ordenanza) y dependencia de origen.",
      },
      {
        numero: 3,
        titulo: "Definir fechas y vigencia",
        descripcion:
          "Indique la fecha de aprobación, la fecha de publicación oficial y la fecha de vigencia. Seleccione el estado: Vigente, Derogada, Modificada o Suspendida.",
      },
      {
        numero: 4,
        titulo: "Cargar PDF o redactar texto",
        descripcion:
          "Suba el documento PDF en el campo de archivo (límite 4 MB en bucket normativa-pdf). Si no cuenta con PDF, copie el articulado completo en el editor de texto.",
      },
      {
        numero: 5,
        titulo: "Vincular modificaciones (si aplica)",
        descripcion:
          "Si la norma reforma a otra anterior, añada la relación indicando norma afectada, artículos modificados y tipo de efecto (Modifica, Complementa o Deroga).",
      },
    ],
    campos: [
      { nombre: "Número", tipo: "Texto", requerido: true, descripcion: "Correlativo formal del instrumento legal.", ejemplo: "EJ-LEY-014/2026" },
      { nombre: "Estado", tipo: "Selector", requerido: true, descripcion: "Situación jurídica de la norma.", ejemplo: "Vigente" },
      { nombre: "Título", tipo: "Texto", requerido: true, descripcion: "Nombre formal de la ley u ordenanza.", ejemplo: "EJ-Ley Municipal de Fomento a la Producción Tabacalera Sostenible" },
      { nombre: "Slug", tipo: "Texto", requerido: false, descripcion: "Identificador web autogenerado a partir del título.", ejemplo: "ej-ley-fomento-produccion-tabacalera" },
      { nombre: "Categoría", tipo: "Selector", requerido: true, descripcion: "Tipo de instrumento normativo.", ejemplo: "Ley Municipal" },
      { nombre: "Dependencia", tipo: "Selector", requerido: true, descripcion: "Órgano emisor del acto administrativo.", ejemplo: "H. Concejo Municipal" },
      { nombre: "Fecha Aprobación", tipo: "Fecha", requerido: true, descripcion: "Fecha de sanción o aprobación.", ejemplo: "2026-03-15" },
      { nombre: "Fecha Publicación", tipo: "Fecha", requerido: true, descripcion: "Fecha en que se inserta en Gaceta.", ejemplo: "2026-03-18" },
      { nombre: "Número de Páginas", tipo: "Numérico", requerido: false, descripcion: "Páginas del expediente para sellado.", ejemplo: "12" },
      { nombre: "Resumen", tipo: "Texto largo", requerido: true, descripcion: "Síntesis orientativa del alcance de la norma.", ejemplo: "EJ-Establece incentivos técnicos para productores agrícolas..." },
      { nombre: "Archivo PDF", tipo: "Documento (PDF)", requerido: false, descripcion: "Folleto escaneado con firmas y sellos.", ejemplo: "EJ-ley-014-2026.pdf" },
      { nombre: "Publicada", tipo: "Casilla", requerido: true, descripcion: "Determina si el documento es visible al público.", ejemplo: "true" },
    ],
    mockForm: {
      titulo: "Nueva Disposición Normativa",
      subtitulo: "Registro de leyes y decretos para la Gaceta Oficial.",
      campos: [
        { name: "numero", label: "Número Oficial", type: "text", value: "EJ-014/2026" },
        {
          name: "estado",
          label: "Estado Jurídico",
          type: "select",
          value: "vigente",
          options: [
            { value: "vigente", label: "Vigente" },
            { value: "modificada", label: "Modificada" },
            { value: "derogada", label: "Derogada" },
            { value: "suspendida", label: "Suspendida" },
          ],
        },
        { name: "titulo", label: "Título de la Norma", type: "text", value: "EJ-Ley Municipal de Fomento Agrícola y Riego Tecnificado" },
        { name: "categoria", label: "Categoría", type: "select", value: "ley", options: [{ value: "ley", label: "Ley Municipal" }, { value: "decreto", label: "Decreto Edil" }] },
        { name: "resumen", label: "Resumen Institucional", type: "textarea", value: "EJ-Norma que aprueba el plan maestro de canalización y apoyo técnico comunal." },
        { name: "pdf", label: "Documento Oficial PDF", type: "file-stub", value: "EJ-norma-reglamento-014.pdf" },
        { name: "publicada", label: "Publicar inmediatamente en el portal", type: "checkbox", value: true },
      ],
      botonTexto: "Guardar Normativa",
    },
    mockTabla: {
      columnas: [
        { key: "numero", label: "Número" },
        { key: "titulo", label: "Título" },
        { key: "categoria", label: "Categoría" },
        { key: "estado", label: "Estado" },
        { key: "publicada", label: "Visible" },
      ],
      filas: [
        { numero: "EJ-014/2026", titulo: "EJ-Ley de Fomento Agrícola", categoria: "Ley Municipal", estado: "Vigente", publicada: "Sí" },
        { numero: "EJ-008/2026", titulo: "EJ-Decreto Edil de Alerta Sanitaria", categoria: "Decreto Edil", estado: "Vigente", publicada: "Sí" },
        { numero: "EJ-002/2025", titulo: "EJ-Ordenanza de Patentes Temporales", categoria: "Ordenanza", estado: "Modificada", publicada: "Sí" },
      ],
    },
    notas: [
      "El buscador público de normativa indexa automáticamente el título, número, resumen y texto completo mediante la función SQL buscar_normativa().",
    ],
  },

  noticias: {
    meta: SECCIONES_MANUAL[3],
    proposito:
      "Permite difundir noticias municipales, obras comunitarias y comunicados urgentes. Soporta redacción directa en el portal o vinculación transparente con publicaciones de la página oficial de Facebook.",
    pasos: [
      {
        numero: 1,
        titulo: "Crear borrador de noticia",
        descripcion: "Acceda a /admin/noticias y pulse en 'Nueva Noticia'.",
      },
      {
        numero: 2,
        titulo: "Elegir modalidad de publicación",
        descripcion:
          "Si la noticia proviene de Facebook, pegue el enlace permanente directo (debe tener formato /posts/...). Si es redacción propia, redacte el resumen y cuerpo completo.",
      },
      {
        numero: 3,
        titulo: "Subir imagen de portada",
        descripcion:
          "Adjunte una fotografía representativa (hasta 2 MB, bucket noticias-imagenes). El sistema la optimiza automáticamente a formato WebP.",
      },
      {
        numero: 4,
        titulo: "Destacar y publicar",
        descripcion:
          "Marque 'Noticia Destacada' si desea que encabece el carrusel de la página de inicio. Active 'Publicada' para hacerla visible de inmediato.",
      },
    ],
    campos: [
      { nombre: "Título", tipo: "Texto", requerido: true, descripcion: "Titular principal de la nota.", ejemplo: "EJ-Inician obras de ampliación en el sistema de agua potable de Mairana" },
      { nombre: "Categoría", tipo: "Selector", requerido: true, descripcion: "Clasificación temática (Obras, Salud, Educación, Cultura).", ejemplo: "Obras Públicas" },
      { nombre: "Imagen Principal", tipo: "Imagen", requerido: true, descripcion: "Fotografía de cabecera (máx 2 MB).", ejemplo: "EJ-inauguracion-obras.webp" },
      { nombre: "Enlace de Facebook", tipo: "URL", requerido: false, descripcion: "Enlace permanente del post oficial si se incrusta desde red social.", ejemplo: "https://facebook.com/GAMMairana/posts/123456789" },
      { nombre: "Resumen", tipo: "Texto largo", requerido: false, descripcion: "Bajada informativa requerida si no hay link de Facebook.", ejemplo: "EJ-El Gobierno Autónomo Municipal dio inicio a los trabajos de tendido de tubería..." },
      { nombre: "Contenido", tipo: "Texto largo / Markdown", requerido: false, descripcion: "Desarrollo completo de la nota periodística.", ejemplo: "EJ-Con la presencia de autoridades y juntas vecinales..." },
      { nombre: "Destacada", tipo: "Casilla", requerido: false, descripcion: "Muestra la nota en el banner principal del home.", ejemplo: "true" },
    ],
    mockForm: {
      titulo: "Redacción de Noticia Institucional",
      subtitulo: "Publicación informativa para el portal y la portada principal.",
      campos: [
        { name: "titulo", label: "Título de la Noticia", type: "text", value: "EJ-Avanza la pavimentación en el barrio El Carmen" },
        { name: "categoria", label: "Categoría", type: "select", value: "obras", options: [{ value: "obras", label: "Obras Públicas" }, { value: "cultura", label: "Cultura y Deportes" }] },
        { name: "imagen", label: "Foto Principal", type: "file-stub", value: "EJ-foto-pavimento-elcarmen.webp" },
        { name: "resumen", label: "Extracto Breve", type: "textarea", value: "EJ-Cuadrillas municipales completaron la primera fase de vaciado con hormigón de alta durabilidad." },
        { name: "destacada", label: "Marcar como Noticia Destacada en Portada", type: "checkbox", value: true },
        { name: "publicada", label: "Publicar en la web", type: "checkbox", value: true },
      ],
      botonTexto: "Guardar y Publicar",
    },
  },

  autoridades: {
    meta: SECCIONES_MANUAL[4],
    proposito:
      "Gestiona el directorio público de servidores públicos del Municipio de Mairana, incluyendo al Alcalde Municipal, los miembros del H. Concejo Municipal y los directores de área.",
    pasos: [
      {
        numero: 1,
        titulo: "Revisar la nómina actual",
        descripcion: "Ingrese a /admin/autoridades para consultar la lista jerárquica de autoridades.",
      },
      {
        numero: 2,
        titulo: "Registrar o editar autoridad",
        descripcion:
          "Complete el nombre completo, cargo oficial, tipo de autoridad (Alcalde, Concejal, Director o Funcionario) y datos de contacto institucional.",
      },
      {
        numero: 3,
        titulo: "Cargar retrato fotográfico",
        descripcion:
          "Suba una foto nítida de frente (bucket noticias-imagenes, máx 2 MB). Se recomienda fondo neutro institucional.",
      },
      {
        numero: 4,
        titulo: "Fijar el orden de prelación",
        descripcion: "Asigne un número de orden menor para posicionar a la autoridad en los primeros lugares del portal.",
      },
    ],
    campos: [
      { nombre: "Nombre Completo", tipo: "Texto", requerido: true, descripcion: "Nombres y apellidos oficiales de la autoridad.", ejemplo: "EJ-Lic. Juan Carlos Vargas Rocha" },
      { nombre: "Cargo", tipo: "Texto", requerido: true, descripcion: "Designación oficial del puesto.", ejemplo: "Presidente del H. Concejo Municipal" },
      { nombre: "Tipo", tipo: "Selector", requerido: true, descripcion: "Nivel jerárquico (Alcalde, Concejal, Director, Funcionario).", ejemplo: "Concejal" },
      { nombre: "Foto", tipo: "Imagen", requerido: false, descripcion: "Retrato oficial del funcionario.", ejemplo: "EJ-retrato-concejal-vargas.webp" },
      { nombre: "Email", tipo: "Texto (Email)", requerido: false, descripcion: "Correo de despacho institucional.", ejemplo: "EJ-concejo.presidencia@mairana.gob.bo" },
      { nombre: "Teléfono", tipo: "Texto", requerido: false, descripcion: "Línea telefónica o interno.", ejemplo: "EJ-(+591) 3 944-2001" },
      { nombre: "Orden", tipo: "Numérico", requerido: true, descripcion: "Prioridad de visualización en la galería pública.", ejemplo: "1" },
      { nombre: "Activo", tipo: "Casilla", requerido: true, descripcion: "Determina si el perfil está visible en la nómina.", ejemplo: "true" },
    ],
    mockTabla: {
      columnas: [
        { key: "nombre", label: "Nombre" },
        { key: "cargo", label: "Cargo" },
        { key: "tipo", label: "Tipo" },
        { key: "orden", label: "Orden" },
        { key: "activo", label: "Activo" },
      ],
      filas: [
        { nombre: "EJ-Andres Fidel Rocha Rosales", cargo: "Alcalde Municipal", tipo: "Alcalde", orden: 0, activo: "Sí" },
        { nombre: "EJ-Lic. Juan Carlos Vargas", cargo: "Presidente H. Concejo", tipo: "Concejal", orden: 1, activo: "Sí" },
        { nombre: "EJ-Ing. María Elena Soliz", cargo: "Directora de Obras Públicas", tipo: "Director", orden: 5, activo: "Sí" },
      ],
    },
  },

  dependencias: {
    meta: SECCIONES_MANUAL[5],
    proposito:
      "Estructura el organigrama operativo del Gobierno Municipal, registrando secretarías, direcciones, departamentos y unidades técnicas con sus respectivas funciones y contactos.",
    pasos: [
      {
        numero: 1,
        titulo: "Crear una nueva unidad",
        descripcion: "Ingrese a /admin/dependencias y presione 'Nueva Dependencia'.",
      },
      {
        numero: 2,
        titulo: "Definir nombre y acrónimo",
        descripcion: "Escriba el nombre completo de la unidad y su sigla administrativa reconocida (ej. DITEC, GAM).",
      },
      {
        numero: 3,
        titulo: "Asignar jefatura y vías de contacto",
        descripcion: "Indique el nombre del responsable titular, correo electrónico institucional y teléfono directo.",
      },
    ],
    campos: [
      { nombre: "Nombre", tipo: "Texto", requerido: true, descripcion: "Nombre formal de la dependencia municipal.", ejemplo: "EJ-Dirección Técnica de Obras y Urbanismo" },
      { nombre: "Sigla", tipo: "Texto", requerido: false, descripcion: "Acrónimo oficial o abreviatura.", ejemplo: "EJ-DITOU" },
      { nombre: "Descripción", tipo: "Texto largo", requerido: false, descripcion: "Competencias y áreas de servicio a cargo.", ejemplo: "EJ-Unidad encargada de catastro, plan regulador y fiscalización vial." },
      { nombre: "Jefe de Dependencia", tipo: "Texto", requerido: false, descripcion: "Nombre del profesional a cargo.", ejemplo: "EJ-Ing. Ramiro Peñaranda" },
      { nombre: "Email", tipo: "Texto (Email)", requerido: false, descripcion: "Correo de contacto de la secretaría.", ejemplo: "EJ-urbanismo@mairana.gob.bo" },
      { nombre: "Orden", tipo: "Numérico", requerido: true, descripcion: "Posición en el listado del portal.", ejemplo: "3" },
    ],
    mockTabla: {
      columnas: [
        { key: "sigla", label: "Sigla" },
        { key: "nombre", label: "Dependencia" },
        { key: "jefe", label: "Responsable" },
        { key: "activo", label: "Visible" },
      ],
      filas: [
        { sigla: "EJ-GAMM", nombre: "Despacho del Alcalde", jefe: "EJ-Andres Fidel Rocha", activo: "Sí" },
        { sigla: "EJ-DITOU", nombre: "Dirección de Obras y Urbanismo", jefe: "EJ-Ing. Ramiro Peñaranda", activo: "Sí" },
        { sigla: "EJ-DAF", nombre: "Dirección Administrativa y Financiera", jefe: "EJ-Lic. Silvia Moreno", activo: "Sí" },
      ],
    },
  },

  categorias: {
    meta: SECCIONES_MANUAL[6],
    proposito:
      "Centraliza la taxonomía temática del portal, permitiendo clasificar y filtrar registros en normativa legal, artículos informativos, trámites y documentos de transparencia.",
    pasos: [
      {
        numero: 1,
        titulo: "Seleccionar el tipo de recurso",
        descripcion: "Al registrar una categoría, elija si aplica a: normativa, noticias, tramites o transparencia.",
      },
      {
        numero: 2,
        titulo: "Asignar nombre y color",
        descripcion: "Defina el título identificador y el color visual que decorará los distintivos (chips) en el portal.",
      },
      {
        numero: 3,
        titulo: "Generar el slug",
        descripcion: "El sistema genera automáticamente el slug web para los enlaces de filtrado.",
      },
    ],
    campos: [
      { nombre: "Nombre", tipo: "Texto", requerido: true, descripcion: "Etiqueta visible al ciudadano.", ejemplo: "EJ-Medio Ambiente y Recursos Hídricos" },
      { nombre: "Slug", tipo: "Texto", requerido: false, descripcion: "Ruta URL para el motor de filtros.", ejemplo: "ej-medio-ambiente" },
      { nombre: "Tipo", tipo: "Selector", requerido: true, descripcion: "Módulo en el que tendrá efecto.", ejemplo: "normativa" },
      { nombre: "Color", tipo: "Texto (Color)", requerido: false, descripcion: "Código hexadecimal o identificador de color.", ejemplo: "#00978A" },
      { nombre: "Orden", tipo: "Numérico", requerido: true, descripcion: "Secuencia en las listas desplegables.", ejemplo: "2" },
    ],
    mockTabla: {
      columnas: [
        { key: "nombre", label: "Categoría" },
        { key: "tipo", label: "Módulo" },
        { key: "slug", label: "Slug" },
        { key: "activo", label: "Estado" },
      ],
      filas: [
        { nombre: "EJ-Leyes Municipales", tipo: "normativa", slug: "ej-leyes-municipales", activo: "Activo" },
        { nombre: "EJ-Obras Comunales", tipo: "noticias", slug: "ej-obras-comunales", activo: "Activo" },
        { nombre: "EJ-Licencias y Catastro", tipo: "tramites", slug: "ej-licencias-catastro", activo: "Activo" },
        { nombre: "EJ-Presupuesto y POA", tipo: "transparencia", slug: "ej-presupuesto-poa", activo: "Activo" },
      ],
    },
  },

  concejo: {
    meta: SECCIONES_MANUAL[7],
    proposito:
      "Registra la actividad deliberativa y fiscalizadora del Honorable Concejo Municipal de Mairana: sesiones plenarias ordinarias, extraordinarias y solemnes, actas en PDF y conformación de comisiones legislativas.",
    pasos: [
      {
        numero: 1,
        titulo: "Cargar una sesión de concejo",
        descripcion:
          "Vaya a /admin/concejo/sesiones/nueva. Ingrese el número correlativo de sesión, fecha, tipo de plenaria y temas de la agenda.",
      },
      {
        numero: 2,
        titulo: "Adjuntar el acta oficial",
        descripcion: "Suba el documento digitalizado del acta aprobada (en PDF, máx 4 MB en bucket documentos).",
      },
      {
        numero: 3,
        titulo: "Gestionar comisiones de trabajo",
        descripcion:
          "En la pestaña 'Comisiones', asigne a los concejales electos sus responsabilidades (Presidente, Vocal, Secretario) en carteras como Hacienda, Obras o Desarrollo Humano.",
      },
    ],
    campos: [
      { nombre: "Sesión N°", tipo: "Texto", requerido: true, descripcion: "Correlativo de la plenaria legislativa.", ejemplo: "EJ-SES-012/2026" },
      { nombre: "Fecha", tipo: "Fecha", requerido: true, descripcion: "Día en que tuvo lugar la sesión.", ejemplo: "2026-03-10" },
      { nombre: "Tipo", tipo: "Selector", requerido: true, descripcion: "Naturaleza de la reunión (Ordinaria, Extraordinaria, Solemne).", ejemplo: "Ordinaria" },
      { nombre: "Agenda", tipo: "Texto largo", requerido: true, descripcion: "Orden del día y puntos tratados.", ejemplo: "EJ-1. Aprobación del acta anterior. 2. Tratamiento del proyecto de ley de riego..." },
      { nombre: "Acta PDF", tipo: "Documento (PDF)", requerido: false, descripcion: "Transcripción legal del acta rubricada.", ejemplo: "EJ-acta-sesion-012.pdf" },
    ],
    mockTabla: {
      columnas: [
        { key: "sesion", label: "Sesión" },
        { key: "tipo", label: "Tipo" },
        { key: "fecha", label: "Fecha" },
        { key: "acta", label: "Acta Digital" },
      ],
      filas: [
        { sesion: "EJ-SES-012/2026", tipo: "Ordinaria", fecha: "10-mar-2026", acta: "Adjunta (PDF)" },
        { sesion: "EJ-SES-011/2026", tipo: "Extraordinaria", fecha: "04-mar-2026", acta: "Adjunta (PDF)" },
        { sesion: "EJ-SES-010/2026", tipo: "Solemne", fecha: "24-sep-2025", acta: "Adjunta (PDF)" },
      ],
    },
  },

  transparencia: {
    meta: SECCIONES_MANUAL[8],
    proposito:
      "Publica y respalda la información obligatoria de rendición de cuentas según lo estipulado por la Ley N° 341 de Participación y Control Social. Abarca presupuestos anuales, POA, estados financieros, auditorías y salarios.",
    pasos: [
      {
        numero: 1,
        titulo: "Crear entrada de rendición",
        descripcion: "Acceda a /admin/transparencia y seleccione 'Nuevo Documento'.",
      },
      {
        numero: 2,
        titulo: "Clasificar la información",
        descripcion:
          "Escoja la categoría legal (POA, Presupuesto, Estados Financieros, Auditorías, Organigrama, Escala Salarial).",
      },
      {
        numero: 3,
        titulo: "Adjuntar respaldo documental",
        descripcion: "Suba el documento en PDF debidamente visado (límite 4 MB en bucket documentos).",
      },
      {
        numero: 4,
        titulo: "Publicar con acceso ciudadano libre",
        descripcion:
          "Marque 'Publicada' para que cualquier vecino pueda consultar y descargar el informe sin requerir credenciales.",
      },
    ],
    campos: [
      { nombre: "Título", tipo: "Texto", requerido: true, descripcion: "Nombre descriptivo del informe.", ejemplo: "EJ-Informe de Rendición Pública de Cuentas Inicial - Gestión 2026" },
      { nombre: "Categoría", tipo: "Selector", requerido: true, descripcion: "Tipo de obligación de transparencia.", ejemplo: "Rendición de Cuentas" },
      { nombre: "Fecha", tipo: "Fecha", requerido: true, descripcion: "Fecha oficial de emisión del balance.", ejemplo: "2026-02-28" },
      { nombre: "Descripción", tipo: "Texto largo", requerido: false, descripcion: "Resumen de las metas financieras alcanzadas.", ejemplo: "EJ-Balance detallado de ejecución presupuestaria e inversión pública comunal." },
      { nombre: "Archivo PDF", tipo: "Documento (PDF)", requerido: true, descripcion: "Expediente digitalizado para descarga pública.", ejemplo: "EJ-rendicion-inicial-2026.pdf" },
      { nombre: "Publicada", tipo: "Casilla", requerido: true, descripcion: "Visibilidad en el portal de transparencia.", ejemplo: "true" },
    ],
    mockTabla: {
      columnas: [
        { key: "titulo", label: "Documento de Transparencia" },
        { key: "categoria", label: "Rubro" },
        { key: "fecha", label: "Fecha" },
        { key: "archivo", label: "Descarga" },
      ],
      filas: [
        { titulo: "EJ-POA Municipal 2026 Aprobado", categoria: "POA", fecha: "Ene 2026", archivo: "PDF (3.2 MB)" },
        { titulo: "EJ-Ejecución Presupuestaria Cuarto Trimestre", categoria: "Presupuesto", fecha: "Dic 2025", archivo: "PDF (2.8 MB)" },
        { titulo: "EJ-Auditoría Interna de Obras Civiles", categoria: "Auditoría", fecha: "Nov 2025", archivo: "PDF (1.9 MB)" },
      ],
    },
  },

  tramites: {
    meta: SECCIONES_MANUAL[9],
    proposito:
      "Ofrece a los vecinos una guía completa para realizar trámites municipales sin demoras ni intermediarios. Detalla requisitos, pasos, costos en bolivianos, tiempos y formularios descargables.",
    pasos: [
      {
        numero: 1,
        titulo: "Definir el servicio municipal",
        descripcion: "Acceda a /admin/tramites y haga clic en 'Nuevo Trámite'. Indique el nombre común del trámite.",
      },
      {
        numero: 2,
        titulo: "Detallar pasos y requisitos",
        descripcion:
          "Explique de forma pedagógica qué documentos debe presentar el vecino (cédula, comprobante de pago, plano visado) y los pasos dentro de la alcaldía.",
      },
      {
        numero: 3,
        titulo: "Indicar costos y tiempos de entrega",
        descripcion:
          "Si tiene costo, especifique el monto en bolivianos (o escriba Gratuito). Indique el plazo estimado de resolución (ej. 48 horas hábiles).",
      },
      {
        numero: 4,
        titulo: "Subir formulario imprimible",
        descripcion: "Adjunte el formulario de solicitud en PDF para que el vecino pueda descargarlo y llenarlo desde su casa.",
      },
    ],
    campos: [
      { nombre: "Título", tipo: "Texto", requerido: true, descripcion: "Nombre del trámite.", ejemplo: "EJ-Licencia de Funcionamiento de Actividades Económicas" },
      { nombre: "Slug", tipo: "Texto", requerido: false, descripcion: "Enlace amigable autogenerado.", ejemplo: "ej-licencia-funcionamiento" },
      { nombre: "Descripción", tipo: "Texto largo", requerido: true, descripcion: "Procedimiento paso a paso para el vecino.", ejemplo: "EJ-1. Presentar requisitos en ventanilla única. 2. Inspección técnica en 48 hrs..." },
      { nombre: "Requisitos", tipo: "Texto largo", requerido: true, descripcion: "Documentación que el ciudadano debe presentar.", ejemplo: "EJ-Fotocopia de CI, NIT si corresponde, croquis de ubicación y última factura de luz." },
      { nombre: "Dependencia", tipo: "Selector", requerido: true, descripcion: "Unidad municipal responsable.", ejemplo: "Dirección de Recaudaciones" },
      { nombre: "Tiempo Estimado", tipo: "Texto", requerido: false, descripcion: "Plazo de respuesta.", ejemplo: "3 días hábiles" },
      { nombre: "Costo", tipo: "Texto", requerido: false, descripcion: "Monto legal del arancel.", ejemplo: "Bs. 50 (Según tipo de rubro)" },
      { nombre: "Formulario PDF", tipo: "Documento (PDF)", requerido: false, descripcion: "Ficha oficial para llenado previo.", ejemplo: "EJ-form-licencia-01.pdf" },
    ],
    mockTabla: {
      columnas: [
        { key: "tramite", label: "Trámite" },
        { key: "unidad", label: "Unidad" },
        { key: "costo", label: "Arancel" },
        { key: "tiempo", label: "Plazo" },
      ],
      filas: [
        { tramite: "EJ-Licencia de Funcionamiento Comercial", unidad: "Recaudaciones", costo: "Bs. 50", tiempo: "3 días" },
        { tramite: "EJ-Certificado Catastral Urbano", unidad: "Catastro", costo: "Bs. 80", tiempo: "5 días" },
        { tramite: "EJ-Autorización de Cierre de Vía", unidad: "Tráfico y Vialidad", costo: "Gratuito", tiempo: "24 hrs" },
      ],
    },
  },

  galeria: {
    meta: SECCIONES_MANUAL[10],
    proposito:
      "Almacena y clasifica las memorias fotográficas de la gestión municipal, documentando desfiles patrios, ferias productivas, trabajos de mantenimiento vial y eventos culturales en Mairana.",
    pasos: [
      {
        numero: 1,
        titulo: "Preparar las imágenes",
        descripcion:
          "Verifique que las fotos estén en formato JPG, PNG o WebP. El límite por archivo es de 3 MB en el bucket galeria.",
      },
      {
        numero: 2,
        titulo: "Asignar a un álbum temático",
        descripcion:
          "Agrupe las fotos con un nombre de álbum común (ej. 'EJ-Fiesta de la Tradición 2026', 'EJ-Obras Viales').",
      },
      {
        numero: 3,
        titulo: "Cargar y contextualizar",
        descripcion: "Añada un título descriptivo y la fecha en que fue capturada la imagen.",
      },
    ],
    campos: [
      { nombre: "Título", tipo: "Texto", requerido: true, descripcion: "Pie de foto o título descriptivo.", ejemplo: "EJ-Desfile cívico por el 150 aniversario de Mairana" },
      { nombre: "Descripción", tipo: "Texto largo", requerido: false, descripcion: "Contexto o reseña de la actividad.", ejemplo: "EJ-Estudiantes y juntas vecinales participaron del acto en la plaza principal." },
      { nombre: "Álbum", tipo: "Texto", requerido: true, descripcion: "Colección temática a la que pertenece la foto.", ejemplo: "EJ-Aniversario y Fiestas Cívicas" },
      { nombre: "Imagen", tipo: "Imagen", requerido: true, descripcion: "Fotografía (máx 3 MB, bucket galeria).", ejemplo: "EJ-plaza-desfile-mairana.webp" },
      { nombre: "Fecha", tipo: "Fecha", requerido: true, descripcion: "Día del evento.", ejemplo: "2025-09-24" },
      { nombre: "Orden", tipo: "Numérico", requerido: false, descripcion: "Posición dentro del carrusel del álbum.", ejemplo: "1" },
    ],
    mockTabla: {
      columnas: [
        { key: "titulo", label: "Fotografía" },
        { key: "album", label: "Álbum" },
        { key: "fecha", label: "Fecha" },
        { key: "tamano", label: "Peso Optimizado" },
      ],
      filas: [
        { titulo: "EJ-Acto en Plaza Principal", album: "EJ-Fiestas Cívicas", fecha: "24-sep-2025", tamano: "480 KB (WebP)" },
        { titulo: "EJ-Pavimentación Calle Sucre", album: "EJ-Obras 2026", fecha: "14-feb-2026", tamano: "620 KB (WebP)" },
        { titulo: "EJ-Feria del Tabaco y Derivados", album: "EJ-Producción", fecha: "18-nov-2025", tamano: "510 KB (WebP)" },
      ],
    },
  },

  contrataciones: {
    meta: SECCIONES_MANUAL[11],
    proposito:
      "Publica licitaciones, convocatorias públicas y adquisiciones de bienes y servicios del municipio en cumplimiento de las normas básicas del Sistema de Administración de Bienes y Servicios (SABS) y el SICOES.",
    pasos: [
      {
        numero: 1,
        titulo: "Iniciar registro de proceso",
        descripcion: "Diríjase a /admin/contrataciones y presione 'Nueva Contratación'.",
      },
      {
        numero: 2,
        titulo: "Cargar códigos y modalidades",
        descripcion:
          "Indique el código de proceso (ej. EJ-ANPE-04/2026), modalidad (Licitación Pública, ANPE, Contratación Menor) y objeto de contratación.",
      },
      {
        numero: 3,
        titulo: "Fijar cronograma y montos",
        descripcion:
          "Ingrese el monto referencial en bolivianos, la fecha de publicación en SICOES y la fecha límite impostergable para la presentación de propuestas.",
      },
      {
        numero: 4,
        titulo: "Adjuntar pliegos (DBC) y actualizar estado",
        descripcion:
          "Suba las bases del pliego en PDF (bucket documentos). Cuando concluya la evaluación, cambie el estado a Adjudicada e indique la empresa ganadora.",
      },
    ],
    campos: [
      { nombre: "Título", tipo: "Texto", requerido: true, descripcion: "Nombre del proceso de licitación.", ejemplo: "EJ-Construcción del Muro de Contención en Quebrada La Pajcha" },
      { nombre: "Tipo", tipo: "Selector", requerido: true, descripcion: "Modalidad de compra (Licitación, ANPE, Menor, Directa).", ejemplo: "ANPE" },
      { nombre: "Modalidad", tipo: "Texto", requerido: true, descripcion: "Identificador correlativo oficial.", ejemplo: "EJ-ANPE-04/2026" },
      { nombre: "Objeto", tipo: "Texto largo", requerido: true, descripcion: "Alcance técnico del contrato.", ejemplo: "EJ-Adquisición de gaviones y provisión de mano de obra especializada." },
      { nombre: "Monto Referencial", tipo: "Numérico / Moneda", requerido: true, descripcion: "Presupuesto asignado en bolivianos.", ejemplo: "Bs. 185.000,00" },
      { nombre: "Empresa Adjudicada", tipo: "Texto", requerido: false, descripcion: "Razón social adjudicataria tras la calificación.", ejemplo: "EJ-Constructora Valles S.R.L." },
      { nombre: "Fecha Publicación", tipo: "Fecha", requerido: true, descripcion: "Lanzamiento oficial en el sistema.", ejemplo: "2026-03-01" },
      { nombre: "Fecha Límite", tipo: "Fecha y hora", requerido: true, descripcion: "Cierre de recepción de sobres.", ejemplo: "2026-03-18 10:00" },
      { nombre: "Estado", tipo: "Selector", requerido: true, descripcion: "En proceso, Adjudicada, Desierta o Cancelada.", ejemplo: "En proceso" },
      { nombre: "Documento PDF", tipo: "Documento (PDF)", requerido: false, descripcion: "Pliego de condiciones o DBC.", ejemplo: "EJ-dbc-anpe-04-2026.pdf" },
    ],
    mockTabla: {
      columnas: [
        { key: "codigo", label: "Proceso" },
        { key: "objeto", label: "Objeto de Contratación" },
        { key: "monto", label: "Monto Ref." },
        { key: "estado", label: "Estado" },
      ],
      filas: [
        { codigo: "EJ-ANPE-04/2026", objeto: "Construcción Muro de Contención", monto: "Bs. 185.000", estado: "En proceso" },
        { codigo: "EJ-CM-02/2026", objeto: "Dotación de Material de Escritorio", monto: "Bs. 24.500", estado: "Adjudicada" },
        { codigo: "EJ-LP-01/2025", objeto: "Pavimento Articulado Fase II", monto: "Bs. 890.000", estado: "Adjudicada" },
      ],
    },
  },

  suscripciones: {
    meta: SECCIONES_MANUAL[12],
    proposito:
      "Permite supervisar la lista de correos de ciudadanos inscritos al boletín digital de la Gaceta Municipal. Facilita la depuración de cuentas no deseadas y el control del estado de suscripción.",
    pasos: [
      {
        numero: 1,
        titulo: "Revisar el padrón de suscriptores",
        descripcion: "Ingrese a /admin/suscripciones para ver las altas registradas a través del pie de página del portal.",
      },
      {
        numero: 2,
        titulo: "Suspender o reactivar",
        descripcion:
          "Si un vecino solicita pausar sus avisos, puede cambiar el estado a inactivo sin necesidad de eliminar el registro.",
      },
      {
        numero: 3,
        titulo: "Baja definitiva",
        descripcion:
          "En caso de solicitudes expresas de derecho al olvido o correos rebotados, utilice la opción de eliminar suscriptor.",
      },
    ],
    campos: [
      { nombre: "Email", tipo: "Texto (Email)", requerido: true, descripcion: "Correo electrónico del suscriptor.", ejemplo: "EJ-vecino.comunidad@gmail.com" },
      { nombre: "Fecha de Suscripción", tipo: "Fecha", requerido: true, descripcion: "Momento en que confirmó su inscripción.", ejemplo: "2026-02-11 14:22" },
      { nombre: "Estado", tipo: "Selector / Booleano", requerido: true, descripcion: "Activo / Inactivo.", ejemplo: "Activo" },
    ],
    mockTabla: {
      columnas: [
        { key: "email", label: "Correo Electrónico" },
        { key: "fecha", label: "Fecha de Alta" },
        { key: "estado", label: "Estado" },
      ],
      filas: [
        { email: "EJ-vecino1@correo.com", fecha: "10-feb-2026", estado: "Activo" },
        { email: "EJ-asociacion.productores@correo.com", fecha: "18-ene-2026", estado: "Activo" },
        { email: "EJ-comite.vigilancia@correo.com", fecha: "02-ene-2026", estado: "Activo" },
      ],
    },
  },

  mensajes: {
    meta: SECCIONES_MANUAL[13],
    proposito:
      "Bandeja de entrada ciudadana para recibir solicitudes, reclamos, denuncias, pedidos de información pública y sugerencias. Soporta el régimen de denuncias anónimas y el registro de respuestas del personal.",
    pasos: [
      {
        numero: 1,
        titulo: "Filtrar la bandeja de entrada",
        descripcion:
          "Utilice las pestañas superiores: Todos, No leídos, Denuncias o Sin responder. También puede filtrar por categoría temática.",
      },
      {
        numero: 2,
        titulo: "Analizar el contenido del mensaje",
        descripcion:
          "Revise los datos del remitente. Si la categoría es Denuncia y el ciudadano eligió modalidad anónima, sus datos de contacto no se mostrarán.",
      },
      {
        numero: 3,
        titulo: "Registrar la respuesta oficial",
        descripcion:
          "Redacte la contestación en el panel. El sistema guardará el texto, la fecha de respuesta y actualizará el estado a 'Respondido' o 'Cerrado'.",
      },
    ],
    campos: [
      { nombre: "Remitente", tipo: "Texto", requerido: true, descripcion: "Nombre del ciudadano o 'Anónimo'.", ejemplo: "EJ-Rosaura Méndez" },
      { nombre: "Email", tipo: "Texto (Email)", requerido: false, descripcion: "Correo para notificación (no aplica en anónimo).", ejemplo: "EJ-rosaura.mendez@correo.bo" },
      { nombre: "Categoría", tipo: "Selector", requerido: true, descripcion: "General, Trámite, Reclamo, Denuncia, Sugerencia, Información, Normativa.", ejemplo: "Reclamo" },
      { nombre: "Asunto", tipo: "Texto", requerido: true, descripcion: "Título o resumen del motivo.", ejemplo: "EJ-Alumbrado público defectuoso en Barrio Central" },
      { nombre: "Mensaje", tipo: "Texto largo", requerido: true, descripcion: "Cuerpo detallado de la comunicación vecinal.", ejemplo: "EJ-Solicitamos el cambio de dos luminarias frente a la cancha polifuncional..." },
      { nombre: "Estado", tipo: "Selector", requerido: true, descripcion: "Nuevo, En revisión, Respondido o Cerrado.", ejemplo: "Nuevo" },
      { nombre: "Respuesta", tipo: "Texto largo", requerido: false, descripcion: "Explicación brindada al vecino por la alcaldía.", ejemplo: "EJ-Se derivó la orden de trabajo #412 a la cuadrilla técnica para su reparación." },
    ],
    mockTabla: {
      columnas: [
        { key: "remitente", label: "Remitente" },
        { key: "categoria", label: "Categoría" },
        { key: "asunto", label: "Asunto" },
        { key: "estado", label: "Estado" },
      ],
      filas: [
        { remitente: "EJ-Rosaura Méndez", categoria: "Reclamo", asunto: "EJ-Luminaria en B° Central", estado: "Nuevo" },
        { remitente: "EJ-Anónimo", categoria: "Denuncia", asunto: "EJ-Construcción sin retiro municipal", estado: "En revisión" },
        { remitente: "EJ-Carlos Vaca", categoria: "Trámite", asunto: "EJ-Consulta sobre catastro rústico", estado: "Respondido" },
      ],
    },
    notas: [
      "Las denuncias anónimas nunca exigen correo ni teléfono para preservar la identidad del denunciante.",
    ],
  },

  usuarios: {
    meta: SECCIONES_MANUAL[14],
    proposito:
      "Control de identidades y privilegios del sistema. Permite al Administrador dar de alta funcionarios, asignar roles predefinidos (Admin, Editor, Publicador) y personalizar la matriz de permisos por módulo.",
    requisitos: [
      "Exclusivo para usuarios con rol de Administrador General.",
      "Las cuentas deben tener correo único y contraseña de al menos 6 caracteres.",
    ],
    pasos: [
      {
        numero: 1,
        titulo: "Crear un nuevo usuario institucional",
        descripcion: "Acceda a /admin/usuarios y pulse 'Nuevo Usuario'. Ingrese nombre completo, correo y clave provisional.",
      },
      {
        numero: 2,
        titulo: "Asignar rol base",
        descripcion:
          "Escoja el rol: Admin (acceso absoluto), Editor (gestión de contenido sin configuración ni borrado masivo), o Publicador (exclusivamente aprobación de visibilidad).",
      },
      {
        numero: 3,
        titulo: "Personalizar matriz de permisos",
        descripcion:
          "Si el funcionario requiere permisos a medida, active o desactive casillas individuales (crear, editar, eliminar, publicar) por cada módulo.",
      },
      {
        numero: 4,
        titulo: "Restablecer contraseñas y desactivar",
        descripcion:
          "Desde la tabla de usuarios puede generar una nueva contraseña temporal o desactivar de inmediato a un funcionario que deja el cargo.",
      },
    ],
    campos: [
      { nombre: "Nombre Completo", tipo: "Texto", requerido: true, descripcion: "Nombre del funcionario.", ejemplo: "EJ-Lic. Pablo Zeballos" },
      { nombre: "Email", tipo: "Texto (Email)", requerido: true, descripcion: "Correo de inicio de sesión.", ejemplo: "EJ-pablo.zeballos@mairana.gob.bo" },
      { nombre: "Rol", tipo: "Selector", requerido: true, descripcion: "admin, editor o publicador.", ejemplo: "editor" },
      { nombre: "Dependencia", tipo: "Selector", requerido: false, descripcion: "Unidad asignada.", ejemplo: "Dirección de Comunicación" },
      { nombre: "Cuenta Activa", tipo: "Casilla", requerido: true, descripcion: "Habilita o revoca el login de forma inmediata.", ejemplo: "true" },
    ],
    mockTabla: {
      columnas: [
        { key: "nombre", label: "Usuario" },
        { key: "email", label: "Correo" },
        { key: "rol", label: "Rol Base" },
        { key: "estado", label: "Cuenta" },
      ],
      filas: [
        { nombre: "EJ-Andres Fidel Rocha", email: "EJ-alcalde@mairana.gob.bo", rol: "admin", estado: "Activa" },
        { nombre: "EJ-Lic. Pablo Zeballos", email: "EJ-comunicacion@mairana.gob.bo", rol: "editor", estado: "Activa" },
        { nombre: "EJ-Operador Gaceta", email: "EJ-gaceta@mairana.gob.bo", rol: "publicador", estado: "Activa" },
      ],
    },
    notas: [
      "Los permisos personalizados se almacenan en los metadatos de usuario (raw_user_meta_data) y prevalecen sobre los roles base.",
      "El checkbox de activación utiliza inputs nativos con evento onChange para compatibilidad estricta.",
    ],
  },

  configuracion: {
    meta: SECCIONES_MANUAL[15],
    proposito:
      "Ajustes globales de identidad municipal, apariencia del portal, datos de contacto del footer, recuadro de honor del Alcalde, redes sociales y preferencias de 'Mi Cuenta'.",
    pasos: [
      {
        numero: 1,
        titulo: "Configurar datos del municipio",
        descripcion:
          "Actualice nombre institucional, lema oficial ('Corazón de los Valles'), dirección del palacio edil, teléfonos de emergencia y horarios de ventanilla.",
      },
      {
        numero: 2,
        titulo: "Ajustar recuadro del Alcalde",
        descripcion:
          "Configure el nombre del Alcalde, gestión, mensaje institucional y foto oficial que engalanará la portada principal.",
      },
      {
        numero: 3,
        titulo: "Redes sociales e imagen de fondo",
        descripcion:
          "Ingrese enlaces a Facebook, X, YouTube o Instagram (solo se muestran botones si tienen URL). Suba la foto hero del portal (recomendada 1920x1080 px).",
      },
      {
        numero: 4,
        titulo: "Administrar Mi Perfil (/admin/perfil)",
        descripcion:
          "Cada funcionario puede actualizar su foto de avatar, cambiar su contraseña y definir su tema visual preferido (Claro, Oscuro o Sistema).",
      },
    ],
    campos: [
      { nombre: "Nombre del Municipio", tipo: "Texto", requerido: true, descripcion: "Encabezado y pie de página general.", ejemplo: "Gobierno Autónomo Municipal de Mairana" },
      { nombre: "Lema", tipo: "Texto", requerido: false, descripcion: "Lema institucional en cabecera y pie.", ejemplo: "Corazón de los Valles Cruceños" },
      { nombre: "Nombre del Alcalde", tipo: "Texto", requerido: true, descripcion: "Nombre para el saludo del home.", ejemplo: "EJ-Andres Fidel Rocha Rosales" },
      { nombre: "Gestión", tipo: "Texto", requerido: true, descripcion: "Período gubernamental.", ejemplo: "Gestión 2026 - 2031" },
      { nombre: "Imagen de Fondo", tipo: "Imagen", requerido: false, descripcion: "Fondo del hero principal (1920x1080 px).", ejemplo: "EJ-plaza-mairana-hero.webp" },
      { nombre: "Preferencia de Tema", tipo: "Selector", requerido: false, descripcion: "Claro, Oscuro o Automático según el sistema.", ejemplo: "Sistema" },
    ],
    mockForm: {
      titulo: "Información Institucional del Municipio",
      subtitulo: "Ajustes visibles en el portal público y en la Gaceta Oficial.",
      campos: [
        { name: "municipio", label: "Nombre de la Entidad", type: "text", value: "Gobierno Autónomo Municipal de Mairana" },
        { name: "lema", label: "Lema Institucional", type: "text", value: "Capital Tabacalera de Bolivia" },
        { name: "direccion", label: "Dirección de la Alcaldía", type: "text", value: "Plaza 24 de Septiembre, Acera Este" },
        { name: "telefono", label: "Teléfono de Despacho", type: "text", value: "(+591) 3 944-2001" },
        { name: "horario", label: "Horario de Atención", type: "text", value: "Lunes a Viernes de 08:00 a 16:00 (Continuo)" },
      ],
      botonTexto: "Guardar Configuración",
    },
    notas: [
      "El portal público renderiza dinámicamente estos valores sin requerir una recompilación de código.",
      "El color institucional naranja (#EA580C) está fijado por normativa de marca del portal para garantizar uniformidad.",
    ],
  },

  archivos: {
    meta: SECCIONES_MANUAL[16],
    proposito:
      "Documenta las especificaciones técnicas del almacenamiento en la nube (Supabase Storage). Detalla los límites por bucket, compresión automática WebP, cuota global y protocolos de resolución ante errores.",
    pasos: [
      {
        numero: 1,
        titulo: "Identificar el bucket adecuado",
        descripcion:
          "Cada formulario conecta directamente al bucket correspondiente. Asegúrese de que el archivo cumpla con los formatos y peso máximo admitidos.",
      },
      {
        numero: 2,
        titulo: "Compresión automática transparente",
        descripcion:
          "En los buckets de imágenes (noticias-imagenes y galeria), el sistema redimensiona a 1600 px y convierte a WebP automáticamente en el navegador antes de subir.",
      },
      {
        numero: 3,
        titulo: "Supervisar cuota de almacenamiento",
        descripcion:
          "La cuota total asignada al portal es de 200 MB, con aviso preventivo a partir de 150 MB. Elimine periódicamente archivos obsoletos si la capacidad se aproxima al tope.",
      },
    ],
    campos: [
      { nombre: "noticias-imagenes", tipo: "Bucket", descripcion: "Imágenes de noticias, logos, fondo de portal y autoridades.", ejemplo: "Máx 2 MB · JPG, PNG, WebP · Comprime a WebP" },
      { nombre: "galeria", tipo: "Bucket", descripcion: "Fotografías para los álbumes culturales y de obras.", ejemplo: "Máx 3 MB · JPG, PNG, WebP · Comprime a WebP" },
      { nombre: "normativa-pdf", tipo: "Bucket", descripcion: "Documentos legales escaneados en PDF.", ejemplo: "Máx 4 MB · PDF estricto · Sin compresión" },
      { nombre: "documentos", tipo: "Bucket", descripcion: "Actas de concejo, transparencia, trámites y DBC.", ejemplo: "Máx 4 MB · PDF, DOCX, XLSX · Sin compresión" },
    ],
    notas: [
      "Los archivos PDF no son comprimibles por el navegador: si exceden 4 MB, deben optimizarse desde la herramienta de escaneo o dividirse.",
      "Al reemplazar un archivo en cualquier formulario, el sistema elimina automáticamente el archivo anterior para evitar el consumo innecesario de almacenamiento.",
    ],
    erroresComunes: [
      {
        error: "TAMANO_EXCEDIDO",
        causa: "El archivo sobrepasa el límite individual configurado para el bucket (2 MB, 3 MB o 4 MB), incluso tras el intento de compresión.",
        solucion: "Para imágenes: reduzca la resolución a 1600 px de ancho o baje la calidad de exportación JPG. Para PDF: reduzca los DPI de escaneo (150 DPI es ideal para texto legal) o separe el expediente.",
      },
      {
        error: "CUOTA_LLENA",
        causa: "El almacenamiento total del portal alcanzó el límite máximo de 200 MB.",
        solucion: "Diríjase al módulo correspondiente y elimine registros o fotografías antiguas que ya no se utilicen, o solicite a soporte una ampliación de capacidad.",
      },
      {
        error: "TIPO_NO_PERMITIDO",
        causa: "Se intentó subir un formato no admitido (ejemplo: un archivo .exe o .zip en un campo de PDF).",
        solucion: "Convierta el archivo al formato autorizado especificado en la etiqueta del campo.",
      },
    ],
  },
}
