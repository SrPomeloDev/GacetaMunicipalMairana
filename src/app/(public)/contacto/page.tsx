"use client"

import { useState } from "react"
import { MAIRANA } from "@/lib/constants"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Phone, Mail, Clock, Send, MessageSquare } from "lucide-react"

const contactInfo = [
  { icon: MapPin, label: "Dirección", value: `${MAIRANA.direccion}, ${MAIRANA.nombre}, ${MAIRANA.provincia}, ${MAIRANA.departamento}` },
  { icon: Phone, label: "Teléfono", value: MAIRANA.telefono },
  { icon: Mail, label: "Correo Electrónico", value: MAIRANA.email },
  { icon: Clock, label: "Horarios", value: "Lunes a Viernes: 8:00 - 16:00, Sábados: 8:00 - 12:00" },
]

export default function ContactoPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground font-serif">Contacto</h1>
        <div className="mt-2 h-1 w-20 rounded-full bg-primary" />
        <p className="mt-4 text-muted-foreground">Comunicate con el Gobierno Autónomo Municipal de Mairana</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
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

          <div className="aspect-[16/9] rounded-xl bg-muted flex flex-col items-center justify-center text-muted-foreground">
            <MapPin className="h-10 w-10 mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">Mapa de Ubicación</p>
            <p className="text-xs mt-1">Plaza Principal 24 de Septiembre</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Enviar Mensaje</h2>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Mensaje Enviado</h3>
                <p className="text-sm text-muted-foreground mt-2">Gracias por contactarnos. Te responderemos a la brevedad.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", subject: "", message: "" }) }}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">Mensaje</label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Escribí tu mensaje aquí..."
                    className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gap-2">
                  <Send className="h-4 w-4" />
                  Enviar Mensaje
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
