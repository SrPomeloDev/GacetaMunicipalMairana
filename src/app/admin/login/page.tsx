"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

const REGISTRO_HABILITADO = false

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<"login" | "register">("login")
  const [nombre, setNombre] = useState("")
  const router = useRouter()
  const supabase = createClient()

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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #fff7ed, white)", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "420px", background: "white", borderRadius: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.1)", padding: "32px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ width: "64px", height: "64px", margin: "0 auto 16px", borderRadius: "50%", background: "#EA580C", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>
            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>
          <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            {mode === "login" ? "Accedé al panel administrativo" : "Registrate para gestionar la Gaceta"}
          </p>
        </div>

        {error && (
          <div style={{ background: "#fef2f2", color: "#dc2626", padding: "12px", borderRadius: "8px", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {mode === "register" && (
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#1a1a1a", marginBottom: "6px" }}>Nombre Completo</label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
                placeholder="Ej: Juan Pérez"
              />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#1a1a1a", marginBottom: "6px" }}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
              placeholder="admin@mairana.gob.bo"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#1a1a1a", marginBottom: "6px" }}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", boxSizing: "border-box" }}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", padding: "12px", background: loading ? "#ccc" : "#EA580C", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Procesando..." : mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px", color: "#666" }}>
          {mode === "register" ? (
            <span>¿Ya tenés cuenta? <button onClick={() => { setMode("login"); setError(null) }} style={{ background: "none", border: "none", color: "#EA580C", fontWeight: 600, cursor: "pointer", padding: 0 }}>Iniciar sesión</button></span>
          ) : REGISTRO_HABILITADO ? (
            <span>¿No tenés cuenta? <button onClick={() => { setMode("register"); setError(null) }} style={{ background: "none", border: "none", color: "#EA580C", fontWeight: 600, cursor: "pointer", padding: 0 }}>Registrate</button></span>
          ) : (
            <span>Acceso restringido al personal autorizado</span>
          )}
        </div>
      </div>
    </div>
  )
}
