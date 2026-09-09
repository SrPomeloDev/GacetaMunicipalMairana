export type Usuario = {
  id: string
  nombre: string
  email: string
  avatar_url: string | null
  rol: 'admin' | 'editor' | 'publicador'
  dependencia_id: string | null
  activo: boolean
  created_at: string
}

export type CategoriaNormativa = {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  color: string
  icono: string | null
  orden: number
  created_at: string
}

export type Dependencia = {
  id: string
  nombre: string
  slug: string
  tipo: 'ejecutivo' | 'legislativo' | 'administrativo'
  descripcion: string | null
  telefono: string | null
  correo: string | null
  horario: string | null
  orden: number
}

export type Normativa = {
  id: string
  numero: string
  slug: string
  titulo: string
  resumen: string | null
  contenido_texto: string | null
  categoria_id: string | null
  dependencia_id: string | null
  estado: 'vigente' | 'derogada' | 'modificada' | 'suspendida' | 'abrogada'
  fecha_aprobacion: string | null
  fecha_publicacion: string | null
  fecha_vigencia: string | null
  numero_paginas: number | null
  archivo_pdf: string | null
  firma_digital: string | null
  codigo_qr: string | null
  visitas: number
  metadata: Record<string, unknown>
  publicada: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export type ModificacionNormativa = {
  id: string
  normativa_id: string
  normativa_modificadora_id: string
  tipo_modificacion: 'deroga' | 'modifica' | 'complementa' | 'suspende' | 'prorroga'
  articulos_afectados: string | null
  descripcion: string | null
  fecha: string
  created_at: string
}

export type Noticia = {
  id: string
  titulo: string
  slug: string
  resumen: string | null
  contenido: string | null
  imagen_principal: string | null
  categoria: 'institucional' | 'evento' | 'programa' | 'comunicado' | 'cultura'
  destacada: boolean
  publicada: boolean
  fecha_publicacion: string | null
  autor_id: string | null
  created_at: string
  updated_at: string
}

export type Autoridad = {
  id: string
  nombre_completo: string
  cargo: string
  dependencia_id: string | null
  tipo_autoridad: 'alcalde' | 'concejal' | 'secretario' | 'director' | 'jefe_unidad' | 'subalcalde'
  partido: string | null
  foto: string | null
  biografia: string | null
  formacion: string | null
  funciones: string | null
  telefono: string | null
  correo: string | null
  activo: boolean
  orden: number
  created_at: string
  updated_at: string
}

export type ComisionConcejal = {
  id: string
  autoridad_id: string
  comision: string
  cargo_comision: 'presidente' | 'secretario' | 'vocal' | 'miembro'
  created_at: string
}

export type SesionConcejo = {
  id: string
  numero_sesion: string
  fecha: string
  tipo: 'ordinaria' | 'extraordinaria' | 'audiencia_publica' | 'instalacion'
  acta_pdf: string | null
  agenda: string | null
  created_at: string
}

export type Transparencia = {
  id: string
  titulo: string
  categoria: 'presupuesto' | 'poa' | 'pei' | 'contratacion' | 'auditoria' | 'financiero' | 'declaracion' | 'informe'
  descripcion: string | null
  archivo_pdf: string | null
  fecha: string | null
  publicada: boolean
  created_at: string
}

export type Tramite = {
  id: string
  titulo: string
  slug: string
  descripcion: string | null
  requisitos: string[]
  formulario_pdf: string | null
  dependencia_id: string | null
  tiempo_estimado: string | null
  costo: string | null
  activo: boolean
  created_at: string
}

export type Galeria = {
  id: string
  titulo: string
  descripcion: string | null
  imagen: string
  album: string
  fecha: string | null
  orden: number
  created_at: string
}

export type Suscripcion = {
  id: string
  email: string
  categorias: string[]
  activo: boolean
  token: string
  created_at: string
}

export type Contratacion = {
  id: string
  titulo: string
  slug: string
  tipo: 'licitacion' | 'apoyo_nacional' | 'compras_menores' | 'contratacion_directa' | 'emergencia'
  modalidad: string | null
  objeto: string | null
  monto: number | null
  empresa_adjudicada: string | null
  fecha_publicacion: string | null
  fecha_presentacion: string | null
  fecha_adjudicacion: string | null
  archivo_pdf: string | null
  estado: 'borrador' | 'publicada' | 'adjudicada' | 'desierta' | 'concluida'
  publicada: boolean
  created_at: string
  updated_at: string
}

export type MensajeContacto = {
  id: string
  nombre: string
  email: string
  asunto: string | null
  mensaje: string
  categoria: 'general' | 'tramite' | 'reclamo' | 'denuncia' | 'sugerencia' | 'informacion_publica' | 'normativa'
  anonimo: boolean
  leido: boolean
  estado: 'nuevo' | 'en_revision' | 'respondido' | 'cerrado'
  respuesta: string | null
  respondido_en: string | null
  created_at: string
}

export type Configuracion = {
  id: number
  municipio: string
  lema: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  facebook: string | null
  twitter: string | null
  youtube: string | null
  instagram: string | null
  color_primario: string
  logo_url: string | null
  updated_at: string
}

export type NormativaEmbedding = {
  id: string
  normativa_id: string
  chunk_index: number
  chunk_text: string
  embedding: number[]
  created_at: string
}

export type NormativaConRelaciones = Normativa & {
  categoria?: CategoriaNormativa
  dependencia?: Dependencia
  modificaciones?: ModificacionNormativa[]
}
