"use client"

import { useState } from "react"
import { Mail, CheckCircle, CircleNotch } from "@/lib/icons"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus("loading")
    const res = await fetch("/api/suscripciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (res.ok) {
      setStatus("success")
      setMessage(data.message || "¡Suscripción exitosa!")
      setEmail("")
    } else {
      setStatus("error")
      setMessage(data.error || "Error al suscribirte")
    }
  }

  return (
    <div>
      <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
        <Mail className="h-3.5 w-3.5" /> Boletín de Novedades
      </h3>
      {status === "success" ? (
        <div className="rounded-lg border border-emerald-600/30 bg-emerald-600/10 p-3 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Recibí las nuevas normas, resoluciones y noticias oficiales directamente en tu correo.
          </p>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" required className="h-10" />
          <Button type="submit" disabled={status === "loading"} className="w-full gap-2" size="default">
            {status === "loading" ? <CircleNotch className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Suscribirme
          </Button>
          {status === "error" && <p className="text-xs text-destructive">{message}</p>}
        </form>
      )}
    </div>
  )
}
