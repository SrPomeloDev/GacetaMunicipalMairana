export interface Usuario {
  id: string
  nombre: string
  email: string
  avatar_url: string | null
  rol: 'admin' | 'editor' | 'publicador'
  dependencia_id: string | null
  activo: boolean
  created_at: string
}

export interface CategoriaNormativa {
  id: string
  nombre: string
  slug: string
  descripcion: string | null
  color: string
  icono: string | null
  orden: number
  created_at: string
}

export interface Dependencia {
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

export interface Normativa {
  id: string
  numero: string
  slug: string
  titulo: string
  resumen: string | null
  contenido_texto: string | null
  categoria_id: string
  dependencia_id: string
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

export interface ModificacionNormativa {
  id: string
  normativa_id: string
  normativa_modificadora_id: string
  tipo_modificacion: 'deroga' | 'modifica' | 'complementa' | 'suspende' | 'prorroga'
  articulos_afectados: string | null
  descripcion: string | null
  fecha: string
  created_at: string
}

export interface Noticia {
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

export interface Autoridad {
  id: string
  nombre_completo: string
  cargo: string
  dependencia_id: string
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

export interface ComisionConcejal {
  id: string
  autoridad_id: string
  comision: string
  cargo_comision: 'presidente' | 'secretario' | 'vocal' | 'miembro'
  created_at: string
}

export interface SesionConcejo {
  id: string
  numero_sesion: string
  fecha: string
  tipo: 'ordinaria' | 'extraordinaria' | 'audiencia_publica' | 'instalacion'
  acta_pdf: string | null
  agenda: string | null
  created_at: string
}

export interface Transparencia {
  id: string
  titulo: string
  categoria: 'presupuesto' | 'poa' | 'pei' | 'contratacion' | 'auditoria' | 'financiero' | 'declaracion' | 'informe'
  descripcion: string | null
  archivo_pdf: string | null
  fecha: string | null
  publicada: boolean
  created_at: string
}

export interface Tramite {
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

export interface Galeria {
  id: string
  titulo: string
  descripcion: string | null
  imagen: string
  album: string
  fecha: string | null
  orden: number
  created_at: string
}

export interface Suscripcion {
  id: string
  email: string
  categorias: string[]
  activo: boolean
  token: string
  created_at: string
}

export interface NormativaEmbedding {
  id: string
  normativa_id: string
  chunk_index: number
  chunk_text: string
  embedding: number[]
  created_at: string
}

export interface NormativaConRelaciones extends Normativa {
  categoria?: CategoriaNormativa
  dependencia?: Dependencia
  modificaciones?: ModificacionNormativa[]
}
