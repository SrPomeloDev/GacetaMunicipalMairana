"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Lock, User, LogIn, Loader2, ShieldCheck, ArrowLeft } from "lucide-react"
import Link from "next/link"

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
      router.push("/admin/dashboard")
      router.refresh()
    } else {
      if (password.length < 6) { setError("Mínimo 6 caracteres"); setLoading(false); return }
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
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.06),transparent_70%)] dark:hidden" aria-hidden />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.06),transparent_70%)] dark:hidden" aria-hidden />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al sitio público
        </Link>

        <div className="overflow-hidden rounded-2xl liquid-glass shadow-2xl shadow-primary/10 animate-in zoom-in-95 fade-in duration-200">
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-amber-500 to-primary" />
          <div className="p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 ring-4 ring-primary/10">
                <img
                  src="/images/escudo-mairana.jpg"
                  alt="Escudo de Mairana"
                  className="h-full w-full rounded-xl object-contain"
                />
              </div>
              <h1 className="font-serif text-2xl font-extrabold text-foreground">
                {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "login" ? "Panel de administración de la Gaceta Municipal" : "Registrate para gestionar la Gaceta"}
              </p>
              <div className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-medium text-primary">
                <ShieldCheck className="h-3 w-3" />
                Acceso restringido a funcionarios
              </div>
            </div>

            {(error || redirectError === "inactive") && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in duration-200">
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
                    minLength={6}
                    className="pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
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

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          &copy; {new Date().getFullYear()} Gaceta Municipal de Mairana — Gobierno Autónomo Municipal
        </p>
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
