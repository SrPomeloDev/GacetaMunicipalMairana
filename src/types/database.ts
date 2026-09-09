import type {
  Usuario, CategoriaNormativa, Dependencia, Normativa,
  ModificacionNormativa, Noticia, Autoridad, ComisionConcejal,
  SesionConcejo, Transparencia, Tramite, Galeria, Suscripcion,
  Contratacion, MensajeContacto, Configuracion, NormativaEmbedding
} from './index'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Columnas NOT NULL quedan requeridas; columnas nullable pasan a opcionales.
type InsertOf<T> = {
  [K in keyof T as null extends T[K] ? never : K]: T[K]
} & {
  [K in keyof T as null extends T[K] ? K : never]?: T[K]
}

// Igual que el codegen oficial: cualquier columna puede omitirse o recibir null.
type UpdateOf<T> = { [K in keyof T]?: T[K] | null }

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario
        Insert: InsertOf<Omit<Usuario, 'created_at'>>
        Update: UpdateOf<Omit<Usuario, 'id'>>
        Relationships: []
      }
      categorias_normativa: {
        Row: CategoriaNormativa
        Insert: InsertOf<Omit<CategoriaNormativa, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<CategoriaNormativa, 'id'>>
        Relationships: []
      }
      dependencias: {
        Row: Dependencia
        Insert: InsertOf<Omit<Dependencia, 'id'>>
        Update: UpdateOf<Omit<Dependencia, 'id'>>
        Relationships: []
      }
      normativa: {
        Row: Normativa
        Insert: InsertOf<Omit<Normativa, 'id' | 'created_at' | 'updated_at' | 'visitas'>>
        Update: UpdateOf<Omit<Normativa, 'id'>>
        Relationships: []
      }
      modificaciones_normativa: {
        Row: ModificacionNormativa
        Insert: InsertOf<Omit<ModificacionNormativa, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<ModificacionNormativa, 'id'>>
        Relationships: [
          {
            foreignKeyName: 'modificaciones_normativa_normativa_id_fkey'
            columns: ['normativa_id']
            referencedRelation: 'normativa'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'modificaciones_normativa_normativa_modificadora_id_fkey'
            columns: ['normativa_modificadora_id']
            referencedRelation: 'normativa'
            referencedColumns: ['id']
          }
        ]
      }
      noticias: {
        Row: Noticia
        Insert: InsertOf<Omit<Noticia, 'id' | 'created_at' | 'updated_at'>>
        Update: UpdateOf<Omit<Noticia, 'id'>>
        Relationships: []
      }
      autoridades: {
        Row: Autoridad
        Insert: InsertOf<Omit<Autoridad, 'id' | 'created_at' | 'updated_at'>>
        Update: UpdateOf<Omit<Autoridad, 'id'>>
        Relationships: []
      }
      concejales_comisiones: {
        Row: ComisionConcejal
        Insert: InsertOf<Omit<ComisionConcejal, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<ComisionConcejal, 'id'>>
        Relationships: []
      }
      concejo_sesiones: {
        Row: SesionConcejo
        Insert: InsertOf<Omit<SesionConcejo, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<SesionConcejo, 'id'>>
        Relationships: []
      }
      transparencia: {
        Row: Transparencia
        Insert: InsertOf<Omit<Transparencia, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<Transparencia, 'id'>>
        Relationships: []
      }
      tramites: {
        Row: Tramite
        Insert: InsertOf<Omit<Tramite, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<Tramite, 'id'>>
        Relationships: []
      }
      galeria: {
        Row: Galeria
        Insert: InsertOf<Omit<Galeria, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<Galeria, 'id'>>
        Relationships: []
      }
      suscripciones: {
        Row: Suscripcion
        Insert: InsertOf<Omit<Suscripcion, 'id' | 'created_at' | 'token'>>
        Update: UpdateOf<Omit<Suscripcion, 'id'>>
        Relationships: []
      }
      configuracion: {
        Row: Configuracion
        Insert: InsertOf<Omit<Configuracion, 'updated_at'>>
        Update: UpdateOf<Omit<Configuracion, 'id'>>
        Relationships: []
      }
      contrataciones: {
        Row: Contratacion
        Insert: InsertOf<Omit<Contratacion, 'id' | 'created_at' | 'updated_at'>>
        Update: UpdateOf<Omit<Contratacion, 'id'>>
        Relationships: []
      }
      contacto_mensajes: {
        Row: MensajeContacto
        Insert: InsertOf<Omit<MensajeContacto, 'id' | 'leido' | 'estado' | 'respuesta' | 'respondido_en'>>
        Update: UpdateOf<Omit<MensajeContacto, 'id'>>
        Relationships: []
      }
      normativa_embeddings: {
        Row: NormativaEmbedding
        Insert: InsertOf<Omit<NormativaEmbedding, 'id' | 'created_at'>>
        Update: UpdateOf<Omit<NormativaEmbedding, 'id'>>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      buscar_normativa: {
        Args: {
          p_query: string
          p_categoria_id?: string
          p_estado?: string
          p_fecha_desde?: string
          p_fecha_hasta?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: Array<{
          id: string
          numero: string
          titulo: string
          resumen: string | null
          slug: string
          categoria_nombre: string
          categoria_slug: string
          estado: string
          fecha_publicacion: string | null
          rank: number
        }>
      }
      current_user_role: {
        Args: Record<string, never>
        Returns: string
      }
      is_staff: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
