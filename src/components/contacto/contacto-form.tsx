"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { IconBox } from "@/components/ui/icon-box"
import { Send, MessageSquare, ShieldAlert, AlertTriangle, CircleNotch } from "@/lib/icons"

const CATEGORIA_OPTIONS = [
  { value: "general", label: "Consulta general" },
  { value: "tramite", label: "Trámite municipal" },
  { value: "reclamo", label: "Reclamo" },
  { value: "denuncia", label: "Denuncia (anónima disponible)" },
  { value: "sugerencia", label: "Sugerencia" },
  { value: "informacion_publica", label: "Solicitud de información pública" },
  { value: "normativa", label: "Consulta de normativa" },
]

export default function ContactoForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "", categoria: "general", anonimo: false, anonimoConfirm: false })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esDenuncia = formData.categoria === "denuncia"
  const modoAnonimo = esDenuncia && formData.anonimo

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (modoAnonimo && !formData.anonimoConfirm) {
      setError("Debes confirmar el aviso sobre denuncias falsas antes de enviar.")
      return
    }

    setSending(true)
    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.name,
          email: formData.email,
          asunto: formData.subject,
          mensaje: formData.message,
          categoria: formData.categoria,
          anonimo: modoAnonimo,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "No se pudo enviar el mensaje. Inténtalo nuevamente.")
        return
      }
      setSubmitted(true)
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta nuevamente.")
    } finally {
      setSending(false)
    }
  }

  const resetForm = () => {
    setSubmitted(false)
    setFormData({ name: "", email: "", subject: "", message: "", categoria: "general", anonimo: false, anonimoConfirm: false })
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-6 flex items-center gap-2">
          {esDenuncia ? <ShieldAlert className="h-5 w-5 text-destructive" /> : <MessageSquare className="h-5 w-5 text-primary" />}
          <h2 className="text-lg font-semibold text-foreground">{esDenuncia ? "Enviar Denuncia" : "Enviar Mensaje"}</h2>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <IconBox size="xl" shape="full" className="mb-4">
              <Send className="h-8 w-8" />
            </IconBox>
            <h3 className="text-lg font-semibold text-foreground">{esDenuncia ? "Denuncia Recibida" : "Mensaje Enviado"}</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {esDenuncia ? "Gracias por tu confianza. Tu denuncia será evaluada por el personal correspondiente." : "Gracias por contactarnos. Te responderemos a la brevedad."}
            </p>
            <Button variant="outline" className="mt-4" onClick={resetForm}>
              Enviar otro
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="categoria" className="text-sm font-medium text-foreground">Tipo de mensaje</label>
              <Select name="categoria" id="categoria" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value, anonimo: false, anonimoConfirm: false })} options={CATEGORIA_OPTIONS} />
            </div>

            {esDenuncia && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">
                    Recibimos denuncias posibles hechos irregulares. Podés reportar de forma <strong>anónima</strong> (sin revelar tu identidad) o con tus datos si preferís que te contactemos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="anonimo"
                    checked={formData.anonimo}
                    onChange={(e) => setFormData((prev) => ({ ...prev, anonimo: e.target.checked, anonimoConfirm: false }))}
                  />
                  <label htmlFor="anonimo" className="cursor-pointer text-sm font-medium text-foreground">Enviar de forma anónima</label>
                </div>
                {formData.anonimo && (
                  <div className="flex items-start gap-3 rounded-lg bg-card p-3">
                    <Checkbox
                      id="anonimoConfirm"
                      checked={formData.anonimoConfirm}
                      onChange={(e) => setFormData((prev) => ({ ...prev, anonimoConfirm: e.target.checked }))}
                    />
                    <label htmlFor="anonimoConfirm" className="cursor-pointer text-xs text-muted-foreground">
                      Confirmo que la denuncia es veraz. Declaraciones falsas pueden constituir responsabilidad legal.
                    </label>
                  </div>
                )}
              </div>
            )}

            {!modoAnonimo ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">Nombre Completo</label>
                    <Input id="name" placeholder="Juan Pérez" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">Correo Electrónico</label>
                    <Input id="email" type="email" placeholder="correo@ejemplo.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium text-foreground">Asunto</label>
                  <Input id="subject" placeholder="Motivo del mensaje" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
                </div>
              </>
            ) : (
              <p className="rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                Tu identidad no será registrada. Te pedimos incluir la mayor cantidad de detalles posibles en el mensaje.
              </p>
            )}

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-foreground">{esDenuncia && modoAnonimo ? "Detalles de la denuncia" : "Mensaje"}</label>
              <Textarea
                id="message"
                rows={5}
                placeholder={esDenuncia ? "Describe el hecho: qué ocurrió, dónde, cuándo y, si conoces, quiénes estuvieron involucrados..." : "Escribí tu mensaje aquí..."}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={sending} variant={esDenuncia ? "destructive" : "default"}>
              {sending ? <CircleNotch className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Enviando..." : esDenuncia ? (modoAnonimo ? "Enviar denuncia anónima" : "Enviar denuncia") : "Enviar Mensaje"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
        )}
      </CardContent>
    </Card>
  )
}