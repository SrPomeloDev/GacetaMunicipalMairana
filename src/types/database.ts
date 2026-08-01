import type {
  Usuario, CategoriaNormativa, Dependencia, Normativa,
  ModificacionNormativa, Noticia, Autoridad, ComisionConcejal,
  SesionConcejo, Transparencia, Tramite, Galeria, Suscripcion, NormativaEmbedding
} from './index'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: Usuario
        Insert: Omit<Usuario, 'created_at'>
        Update: Partial<Omit<Usuario, 'id'>>
      }
      categorias_normativa: {
        Row: CategoriaNormativa
        Insert: Omit<CategoriaNormativa, 'id' | 'created_at'>
        Update: Partial<Omit<CategoriaNormativa, 'id'>>
      }
      dependencias: {
        Row: Dependencia
        Insert: Omit<Dependencia, 'id'>
        Update: Partial<Omit<Dependencia, 'id'>>
      }
      normativa: {
        Row: Normativa
        Insert: Omit<Normativa, 'id' | 'created_at' | 'updated_at' | 'visitas'>
        Update: Partial<Omit<Normativa, 'id'>>
      }
      modificaciones_normativa: {
        Row: ModificacionNormativa
        Insert: Omit<ModificacionNormativa, 'id' | 'created_at'>
        Update: Partial<Omit<ModificacionNormativa, 'id'>>
      }
      noticias: {
        Row: Noticia
        Insert: Omit<Noticia, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Noticia, 'id'>>
      }
      autoridades: {
        Row: Autoridad
        Insert: Omit<Autoridad, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Autoridad, 'id'>>
      }
      concejales_comisiones: {
        Row: ComisionConcejal
        Insert: Omit<ComisionConcejal, 'id' | 'created_at'>
        Update: Partial<Omit<ComisionConcejal, 'id'>>
      }
      concejo_sesiones: {
        Row: SesionConcejo
        Insert: Omit<SesionConcejo, 'id' | 'created_at'>
        Update: Partial<Omit<SesionConcejo, 'id'>>
      }
      transparencia: {
        Row: Transparencia
        Insert: Omit<Transparencia, 'id' | 'created_at'>
        Update: Partial<Omit<Transparencia, 'id'>>
      }
      tramites: {
        Row: Tramite
        Insert: Omit<Tramite, 'id' | 'created_at'>
        Update: Partial<Omit<Tramite, 'id'>>
      }
      galeria: {
        Row: Galeria
        Insert: Omit<Galeria, 'id' | 'created_at'>
        Update: Partial<Omit<Galeria, 'id'>>
      }
      suscripciones: {
        Row: Suscripcion
        Insert: Omit<Suscripcion, 'id' | 'created_at' | 'token'>
        Update: Partial<Omit<Suscripcion, 'id'>>
      }
      normativa_embeddings: {
        Row: NormativaEmbedding
        Insert: Omit<NormativaEmbedding, 'id' | 'created_at'>
        Update: Partial<Omit<NormativaEmbedding, 'id'>>
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
    }
    Enums: Record<string, never>
  }
}
