"use client"

import { useState } from "react"
import { MAIRANA } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import PageHeader from "@/components/layout/page-header"
import { MapPin, Phone, Mail, Clock, Send, MessageSquare, Headset, Loader2, ShieldAlert, AlertTriangle } from "lucide-react"

const contactInfo = [
  { icon: MapPin, label: "Dirección", value: `${MAIRANA.direccion}, ${MAIRANA.nombre}, ${MAIRANA.provincia}, ${MAIRANA.departamento}` },
  { icon: Phone, label: "Teléfono", value: MAIRANA.telefono },
  { icon: Mail, label: "Correo Electrónico", value: MAIRANA.email },
  { icon: Clock, label: "Horarios", value: "Lunes a Viernes: 8:00 - 16:00, Sábados: 8:00 - 12:00" },
]

const CATEGORIA_OPTIONS = [
  { value: "general", label: "Consulta general" },
  { value: "tramite", label: "Trámite municipal" },
  { value: "reclamo", label: "Reclamo" },
  { value: "denuncia", label: "Denuncia (anónima disponible)" },
  { value: "sugerencia", label: "Sugerencia" },
  { value: "informacion_publica", label: "Solicitud de información pública" },
  { value: "normativa", label: "Consulta de normativa" },
]

const MAIRANA_LAT = -18.119
const MAIRANA_LON = -63.956

export default function ContactoPage() {
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

  return (
    <div className="pb-16">
      <PageHeader
        title="Contacto"
        description="Comunicate con el Gobierno Autónomo Municipal de Mairana. Estamos para atenderte y responder tus consultas."
        crumbs={[{ label: "Contacto" }]}
        icon={<Headset className="hidden h-8 w-8 text-primary sm:block" />}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 pt-8">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              {contactInfo.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.value}</p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="overflow-hidden rounded-xl border border-primary/15 shadow-sm">
            <iframe
              title="Mapa de ubicación de la Alcaldía de Mairana"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${MAIRANA_LON - 0.012}%2C${MAIRANA_LAT - 0.008}%2C${MAIRANA_LON + 0.012}%2C${MAIRANA_LAT + 0.008}&layer=mapnik&marker=${MAIRANA_LAT}%2C${MAIRANA_LON}`}
              className="aspect-[16/9] w-full border-0"
              loading="lazy"
            />
            <div className="flex items-center justify-between gap-2 border-t border-primary/10 bg-card px-4 py-2.5">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Plaza Principal 24 de Septiembre
              </p>
              <a
                href={`https://www.openstreetmap.org/?mlat=${MAIRANA_LAT}&mlon=${MAIRANA_LON}#map=16/${MAIRANA_LAT}/${MAIRANA_LON}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-primary hover:underline"
              >
                Ver mapa ampliado
              </a>
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-2">
              {esDenuncia ? <ShieldAlert className="h-5 w-5 text-destructive" /> : <MessageSquare className="h-5 w-5 text-primary" />}
              <h2 className="text-lg font-semibold text-foreground">{esDenuncia ? "Enviar Denuncia" : "Enviar Mensaje"}</h2>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{esDenuncia ? "Denuncia Recibida" : "Mensaje Enviado"}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {esDenuncia ? "Gracias por tu confianza. Tu denuncia será evaluada por el personal correspondiente." : "Gracias por contactarnos. Te responderemos a la brevedad."}
                </p>
                <Button variant="outline" className="mt-4" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "", categoria: "general", anonimo: false, anonimoConfirm: false }) }}>
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
                  <textarea
                    id="message"
                    rows={5}
                    placeholder={esDenuncia ? "Describe el hecho: qué ocurrió, dónde, cuándo y, si conoces, quiénes estuvieron involucrados..." : "Escribí tu mensaje aquí..."}
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={sending} variant={esDenuncia ? "destructive" : "default"}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {sending ? "Enviando..." : esDenuncia ? (modoAnonimo ? "Enviar denuncia anónima" : "Enviar denuncia") : "Enviar Mensaje"}
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  )
}
