"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  permisosEfectivos,
  tipoPermisos,
  tienePermiso,
  puedeVerModulo,
  rolLabel as rolLabelFn,
  type Permisos,
  type Modulo,
  type Accion,
} from "@/lib/roles"

export interface CurrentUser {
  id: string
  nombre: string
  rol: string
  email: string | null
  avatar_url: string | null
  dependencia_id: string | null
  permisos: Permisos
}

export function useCurrentUser() {
  const supabase = createClient()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) {
        if (active) setLoading(false)
        return
      }
      const meta = authData.user.user_metadata as Record<string, unknown> | undefined
      const metaPermisos = tipoPermisos(meta?.permisos)

      const { data } = await supabase
        .from("usuarios")
        .select("id, nombre, rol, email, avatar_url, dependencia_id")
        .eq("id", authData.user.id)
        .maybeSingle()
      const perfil = data as {
        id: string
        nombre: string
        rol: string
        email: string | null
        avatar_url: string | null
        dependencia_id: string | null
      } | null

      const rol = perfil?.rol ?? (meta?.rol as string) ?? "editor"

      if (active) {
        setUser({
          id: authData.user!.id,
          nombre: perfil?.nombre ?? (meta?.nombre as string) ?? "Usuario",
          rol,
          email: perfil?.email ?? authData.user!.email ?? null,
          avatar_url: perfil?.avatar_url ?? null,
          dependencia_id: perfil?.dependencia_id ?? null,
          permisos: permisosEfectivos(rol, metaPermisos),
        })
        setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [supabase])

  return { user, loading }
}

export function can(user: CurrentUser | null, modulo: Modulo, accion: Accion): boolean {
  if (!user) return false
  return tienePermiso(user.permisos, modulo, accion)
}

export function canView(user: CurrentUser | null, modulo: Modulo): boolean {
  if (!user) return false
  return puedeVerModulo(user.permisos, modulo)
}

export const rolLabel = (rol: string) => rolLabelFn(rol)
