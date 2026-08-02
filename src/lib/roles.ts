export type Accion = "crear" | "editar" | "eliminar" | "publicar"
export type Modulo =
  | "normativa"
  | "noticias"
  | "autoridades"
  | "transparencia"
  | "tramites"
  | "galeria"
  | "usuarios"
  | "configuracion"
  | "dependencias"
  | "categorias"
  | "concejo"
  | "suscripciones"
  | "contrataciones"
  | "mensajes"

export type Permisos = Partial<Record<Modulo, Accion[]>>

export const MODULOS: { value: Modulo; label: string }[] = [
  { value: "normativa", label: "Normativa" },
  { value: "noticias", label: "Noticias" },
  { value: "autoridades", label: "Autoridades" },
  { value: "transparencia", label: "Transparencia" },
  { value: "tramites", label: "Trámites" },
  { value: "galeria", label: "Galería" },
  { value: "usuarios", label: "Usuarios" },
  { value: "configuracion", label: "Configuración" },
  { value: "dependencias", label: "Dependencias" },
  { value: "categorias", label: "Categorías" },
  { value: "concejo", label: "Concejo" },
  { value: "suscripciones", label: "Suscripciones" },
  { value: "contrataciones", label: "Contrataciones" },
  { value: "mensajes", label: "Mensajes" },
]

export const ACCIONES: { value: Accion; label: string }[] = [
  { value: "crear", label: "Crear" },
  { value: "editar", label: "Editar" },
  { value: "eliminar", label: "Eliminar" },
  { value: "publicar", label: "Publicar" },
]

const TODAS: Accion[] = ["crear", "editar", "eliminar", "publicar"]
const GESTIONAR: Accion[] = ["crear", "editar", "publicar"]
const PUBLICAR: Accion[] = ["publicar"]
const GESTIONAR_MENSAJES: Accion[] = ["editar", "eliminar"]

export interface RolDef {
  label: string
  color: string
  descripcion: string
  permisos: Permisos
}

export const ROLES: Record<string, RolDef> = {
  admin: {
    label: "Administrador",
    color: "bg-primary/10 text-primary",
    descripcion: "Acceso total al sistema.",
    permisos: {
      normativa: TODAS,
      noticias: TODAS,
      autoridades: TODAS,
      transparencia: TODAS,
      tramites: TODAS,
      galeria: TODAS,
      usuarios: TODAS,
      configuracion: TODAS,
      dependencias: TODAS,
      categorias: TODAS,
      concejo: TODAS,
      suscripciones: TODAS,
      contrataciones: TODAS,
      mensajes: TODAS,
    },
  },
  editor: {
    label: "Editor",
    color: "bg-blue-100 text-blue-700",
    descripcion: "Gestiona contenido, pero no puede eliminar ni administrar usuarios.",
    permisos: {
      normativa: GESTIONAR,
      noticias: GESTIONAR,
      autoridades: GESTIONAR,
      transparencia: GESTIONAR,
      tramites: GESTIONAR,
      galeria: GESTIONAR,
      usuarios: [],
      configuracion: [],
      dependencias: GESTIONAR,
      categorias: GESTIONAR,
      concejo: GESTIONAR,
      suscripciones: GESTIONAR,
      contrataciones: GESTIONAR,
      mensajes: GESTIONAR_MENSAJES,
    },
  },
  publicador: {
    label: "Publicador",
    color: "bg-green-100 text-green-700",
    descripcion: "Solo puede publicar contenido aprobado.",
    permisos: {
      normativa: PUBLICAR,
      noticias: PUBLICAR,
      autoridades: PUBLICAR,
      transparencia: PUBLICAR,
      tramites: PUBLICAR,
      galeria: PUBLICAR,
      usuarios: [],
      configuracion: [],
      dependencias: [],
      categorias: [],
      concejo: [],
      suscripciones: [],
      contrataciones: [],
      mensajes: [],
    },
  },
}

export function permisosPorRol(rol: string): Permisos {
  return ROLES[rol]?.permisos ?? ROLES.editor.permisos
}

export function permisosEfectivos(rol: string, overrides?: Permisos | null): Permisos {
  const base = permisosPorRol(rol)
  if (!overrides) return base
  const result: Permisos = {}
  for (const modulo of MODULOS) {
    const acciones = overrides[modulo.value] ?? base[modulo.value] ?? []
    result[modulo.value] = [...acciones]
  }
  return result
}

export function tienePermiso(permisos: Permisos, modulo: Modulo, accion: Accion): boolean {
  return (permisos[modulo] ?? []).includes(accion)
}

export function puedeVerModulo(permisos: Permisos, modulo: Modulo): boolean {
  return (permisos[modulo] ?? []).length > 0
}

export function rolLabel(rol: string): string {
  return ROLES[rol]?.label ?? "Usuario"
}

const ACCIONES_VALIDAS: Accion[] = ["crear", "editar", "eliminar", "publicar"]

export function tipoPermisos(valor: unknown): Permisos | null {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return null
  const result: Permisos = {}
  for (const modulo of MODULOS) {
    const acc = (valor as Record<string, unknown>)[modulo.value]
    if (Array.isArray(acc)) {
      const filtradas = acc.filter((a): a is Accion =>
        typeof a === "string" && (ACCIONES_VALIDAS as string[]).includes(a)
      )
      result[modulo.value] = [...new Set(filtradas)]
    }
  }
  return result
}
