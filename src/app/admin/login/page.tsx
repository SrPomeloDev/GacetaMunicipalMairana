"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, LogIn, Loader2, ShieldCheck, ArrowLeft, Landmark, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const REGISTRO_HABILITADO = false

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [nombre, setNombre] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const searchParams = useSearchParams()
  const redirectError = searchParams.get("error")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === "login") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError("Credenciales inválidas"); setLoading(false); return }
      const redirect = searchParams.get("redirect")
      const destino = redirect && redirect.startsWith("/admin") && !redirect.startsWith("//")
        ? redirect
        : "/admin/dashboard"
      router.push(destino)
      router.refresh()
    } else {
      if (password.length < 8) { setError("Mínimo 8 caracteres"); setLoading(false); return }
      const { error: err } = await supabase.auth.signUp({
        email, password,
        options: { data: { nombre } },
      })
      if (err) { setError(err.message); setLoading(false); return }
      setMode("login")
      setError(null)
      alert("Registrado. Ahora iniciá sesión.")
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      <div className="absolute inset-0 bg-pattern-dots opacity-20" aria-hidden />
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.08),transparent_70%)] dark:hidden" aria-hidden />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.08),transparent_70%)] dark:hidden" aria-hidden />

      <div className="relative grid w-full max-w-4xl overflow-hidden rounded-3xl liquid-glass shadow-2xl shadow-primary/10 lg:grid-cols-5">
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-[#C7500B] to-[#8F3A08] p-10 text-primary-foreground lg:col-span-2 lg:flex">
          <Image src="/images/plaza.jpg" alt="" aria-hidden fill sizes="33vw" className="object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#7A2F06]/90 via-[#A8440B]/60 to-transparent" aria-hidden />

          <div className="relative">
            <div className="mb-8 flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-white p-1 shadow-lg">
                <Image src="/images/escudo-mairana.jpg" alt="Escudo de Mairana" width={48} height={48} className="h-full w-full rounded-xl object-contain" />
              </div>
              <div>
                <p className="font-serif text-xl font-extrabold leading-tight">Gaceta Municipal</p>
                <p className="text-xs font-medium text-white/80">G.A.M. Mairana - Bolivia</p>
              </div>
            </div>

            <p className="text-2xl font-bold leading-snug">
              Portal oficial de transparencia y normativa municipal.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/85">
              Acceso restringido al personal autorizado del Gobierno Autónomo Municipal de Mairana.
            </p>

            <div className="mt-8 space-y-3 text-xs text-white/85">
              <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <Image
                  src="/images/transparencia-ley341.png"
                  alt="Logo Transparencia Ley 341"
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 rounded bg-white/95 object-contain p-0.5"
                />
                Ley N° 482 y Ley N° 341 de Control Social
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <Landmark className="h-4 w-4 shrink-0" />
                Concejo Municipal y Órgano Ejecutivo
              </div>
              <div className="flex items-center gap-2.5 rounded-xl bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                Mairana, Capital Tabacalera de Bolivia
              </div>
            </div>
          </div>

          <p className="relative mt-8 text-[11px] text-white/60">
            &copy; {new Date().getFullYear()} Gaceta Municipal de Mairana — Gobierno Autónomo Municipal
          </p>
        </div>

        <div className="p-8 sm:p-10 lg:col-span-3">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver al sitio público
          </Link>

          <div className="mb-6 text-center lg:text-left">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-md ring-4 ring-primary/10 lg:mx-0">
              <Image
                src="/images/escudo-mairana.jpg"
                alt="Escudo de Mairana"
                width={56}
                height={56}
                className="h-full w-full rounded-xl object-contain"
              />
            </div>
            <h1 className="font-serif text-2xl font-extrabold text-foreground">
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "login" ? "Panel de administración de la Gaceta Municipal" : "Registrate para gestionar la Gaceta"}
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-3 py-1 text-[11px] font-semibold text-primary-foreground">
              <ShieldCheck className="h-3 w-3" />
              Acceso restringido a funcionarios
            </div>
          </div>

          {(error || redirectError === "inactive") && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in duration-200">
              {error || "Tu usuario fue desactivado. Contactá al administrador del sistema."}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <label htmlFor="nombre" className="text-sm font-medium text-foreground">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="pl-10"
                  placeholder="admin@mairana.gob.bo"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                   required
                   minLength={8}
                   className="pl-10"
                   placeholder="••••••••"
                />
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full gap-2 shadow-md shadow-primary/25" size="lg">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              {loading ? "Procesando..." : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "register" ? (
              <span>
                ¿Ya tenés cuenta?{" "}
                <button
                  onClick={() => { setMode("login"); setError(null) }}
                  className="font-semibold text-primary hover:underline"
                >
                  Iniciar sesión
                </button>
              </span>
            ) : REGISTRO_HABILITADO ? (
              <span>
                ¿No tenés cuenta?{" "}
                <button
                  onClick={() => { setMode("register"); setError(null) }}
                  className="font-semibold text-primary hover:underline"
                >
                  Registrate
                </button>
              </span>
            ) : (
              <span>Acceso restringido al personal autorizado del G.A.M. Mairana</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted-foreground">Cargando...</div>}>
      <LoginContent />
    </Suspense>
  )
}