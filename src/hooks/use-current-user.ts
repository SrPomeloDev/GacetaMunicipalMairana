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
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    let reintentos = 0
    const load = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
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
    } catch {
      if (active && reintentos < 2) {
        reintentos += 1
        window.setTimeout(() => {
          if (active) load()
        }, 700 * reintentos)
      } else if (active) {
        setLoading(false)
      }
    }
    }
    load()
    return () => {
      active = false
    }
  }, [supabase, version])

  useEffect(() => {
    const onPerfilActualizado = () => setVersion((v) => v + 1)
    window.addEventListener("perfil-actualizado", onPerfilActualizado)
    return () => window.removeEventListener("perfil-actualizado", onPerfilActualizado)
  }, [])

  return { user, loading, refetch: () => setVersion((v) => v + 1) }
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
