"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export interface CurrentUser {
  id: string
  nombre: string
  rol: string
  email: string | null
  avatar_url: string | null
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
      const { data } = await supabase
        .from("usuarios")
        .select("id, nombre, rol, email, avatar_url")
        .eq("id", authData.user.id)
        .maybeSingle()
      if (active) {
        setUser(
          data
            ? { id: data.id, nombre: data.nombre, rol: data.rol, email: data.email, avatar_url: data.avatar_url }
            : {
                id: authData.user!.id,
                nombre: (authData.user!.user_metadata?.nombre as string) || "Usuario",
                rol: (authData.user!.user_metadata?.rol as string) || "editor",
                email: authData.user!.email || null,
                avatar_url: null,
              }
        )
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

export const rolLabel = (rol: string) => (rol === "admin" ? "Administrador" : "Editor")
