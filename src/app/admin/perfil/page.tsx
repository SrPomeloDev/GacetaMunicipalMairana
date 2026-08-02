"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { Skeleton } from "@/components/ui/skeleton"
import { FileUpload } from "@/components/admin/file-upload"
import { useCurrentUser, rolLabel, type CurrentUser } from "@/hooks/use-current-user"
import { useTheme } from "@/components/theme-provider"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Save, KeyRound, User } from "lucide-react"
import { cn } from "@/lib/utils"

export default function PerfilPage() {
  const { user, loading } = useCurrentUser()

  if (loading || !user) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
  }

  return <PerfilForm user={user} />
}

function PerfilForm({ user }: { user: CurrentUser }) {
  const supabase = createClient()
  const { addToast } = useToast()
  const { theme, setTheme } = useTheme()

  const [nombre, setNombre] = useState(user.nombre)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatar_url)
  const [dependencia, setDependencia] = useState("")
  const [saving, setSaving] = useState(false)

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    if (!user.dependencia_id) return
    const loadDep = async () => {
      const { data } = await supabase
        .from("dependencias")
        .select("nombre")
        .eq("id", user.dependencia_id as string)
        .maybeSingle()
      const fila = data as { nombre: string } | null
      setDependencia(fila?.nombre || "")
    }
    loadDep()
  }, [user.dependencia_id, supabase])

  const handleSavePerfil = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nombre.trim()) {
      addToast("El nombre es obligatorio", "error")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/admin/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, avatar_url: avatarUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al guardar el perfil", "error")
        return
      }
      addToast("Perfil actualizado", "success")
    } finally {
      setSaving(false)
    }
  }

  const handleTema = async (tema: "light" | "dark") => {
    setTheme(tema)
    const res = await fetch("/api/admin/perfil", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema }),
    })
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "No se pudo guardar la preferencia de tema", "error")
    }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      addToast("La contraseña debe tener al menos 6 caracteres", "error")
      return
    }
    if (password !== confirm) {
      addToast("Las contraseñas no coinciden", "error")
      return
    }
    setChanging(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        addToast(error.message, "error")
        return
      }
      setPassword("")
      setConfirm("")
      addToast("Contraseña actualizada", "success")
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Administra tu cuenta y preferencias</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Datos del Perfil
          </CardTitle>
          <CardDescription>Tu nombre y foto se muestran en todo el panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSavePerfil} className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="shrink-0">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/30" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input value={nombre} onChange={(e) => setNombre(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Foto de Perfil</Label>
                  <FileUpload
                    bucket="noticias-imagenes"
                    accept="image/*"
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    label="Foto"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={user.email || ""} disabled className="disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Rol</Label>
                <Input value={rolLabel(user.rol)} disabled className="disabled:opacity-60" />
              </div>
              <div className="space-y-2">
                <Label>Dependencia</Label>
                <Input value={dependencia || "Sin asignar"} disabled className="disabled:opacity-60" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" loading={saving}>
                <Save className="mr-2 h-4 w-4" />
                Guardar Perfil
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencia de Tema</CardTitle>
          <CardDescription>Se guarda en tu cuenta y se aplica en cualquier dispositivo.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTema(t)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  theme === t
                    ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                    : "border-border hover:border-primary/40"
                )}
              >
                <p className="text-sm font-semibold">{t === "light" ? "Claro" : "Oscuro"}</p>
                <p className="text-xs text-muted-foreground">{t === "light" ? "Fondo claro" : "Fondo oscuro"}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>La próxima vez que inicies sesión usa la nueva contraseña.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4 sm:max-w-md">
            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Contraseña</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repite la nueva contraseña" />
            </div>
            <Button type="submit" variant="outline" loading={changing}>
              Actualizar Contraseña
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
