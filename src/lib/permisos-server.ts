import { createServerSupabaseClient } from "@/lib/supabase/server"
import { permisosEfectivos, tipoPermisos, tienePermiso, puedeVerModulo, type Accion, type Modulo, type Permisos } from "@/lib/roles"

export type ServerSupabase = Awaited<ReturnType<typeof createServerSupabaseClient>>

export interface PermisosUsuario {
  id: string
  rol: string
  permisos: Permisos
  supabase: ServerSupabase
}

export async function getPermisosUsuario(supabase: ServerSupabase): Promise<PermisosUsuario | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("rol,activo")
    .eq("id", authUser.id)
    .maybeSingle()
  const fila = usuario as { rol: string; activo: boolean } | null
  if (!fila || fila.activo === false) return null

  const rol = fila?.rol ?? (authUser.user_metadata?.rol as string | undefined) ?? "editor"
  const overrides = tipoPermisos(authUser.user_metadata?.permisos)

  return {
    id: authUser.id,
    rol,
    permisos: permisosEfectivos(rol, overrides),
    supabase,
  }
}

export async function requirePermiso(modulo: Modulo, accion: Accion): Promise<PermisosUsuario | null> {
  const supabase = await createServerSupabaseClient()
  const permisos = await getPermisosUsuario(supabase)
  if (!permisos) return null
  if (!tienePermiso(permisos.permisos, modulo, accion)) {
    throw new Error("NO_PERMISO")
  }
  return permisos
}

export async function requireVerModulo(modulo: Modulo): Promise<PermisosUsuario | null> {
  const supabase = await createServerSupabaseClient()
  const permisos = await getPermisosUsuario(supabase)
  if (!permisos) return null
  if (!puedeVerModulo(permisos.permisos, modulo)) {
    throw new Error("NO_PERMISO")
  }
  return permisos
}
