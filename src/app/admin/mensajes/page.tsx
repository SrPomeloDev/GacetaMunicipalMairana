"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { useCurrentUser, can } from "@/hooks/use-current-user"
import { Inbox, Mail, MailOpen, Trash2, User, Calendar, ShieldAlert, ChevronDown, ChevronUp, Reply } from "lucide-react"
import { cn } from "@/lib/utils"

const CATEGORIA_LABEL: Record<string, string> = {
  general: "General",
  tramite: "Trámite",
  reclamo: "Reclamo",
  denuncia: "Denuncia",
  sugerencia: "Sugerencia",
  informacion_publica: "Información pública",
  normativa: "Normativa",
}

const ESTADO_LABEL: Record<string, { label: string; className: string }> = {
  nuevo: { label: "Nuevo", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
  en_revision: { label: "En revisión", className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  respondido: { label: "Respondido", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" },
  cerrado: { label: "Cerrado", className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300" },
}

const ESTADO_OPTIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "en_revision", label: "En revisión" },
  { value: "respondido", label: "Respondido" },
  { value: "cerrado", label: "Cerrado" },
]

interface Mensaje {
  id: string
  nombre: string
  email: string
  asunto: string | null
  mensaje: string
  categoria: string
  anonimo: boolean
  leido: boolean
  estado: string
  respuesta: string | null
  respondido_en: string | null
  created_at: string
}

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [filtro, setFiltro] = useState<"todos" | "no_leidos" | "denuncias" | "sin_responder">("todos")
  const [filtroEstado, setFiltroEstado] = useState<string>("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [respuestaDraft, setRespuestaDraft] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Mensaje | null>(null)
  const [deleteBulk, setDeleteBulk] = useState(false)
  const { addToast } = useToast()
  const { user } = useCurrentUser()

  const puedeEditar = can(user, "mensajes", "editar")
  const puedeEliminar = can(user, "mensajes", "eliminar")

  const fetchMensajes = useCallback(async () => {
    const params = new URLSearchParams()
    if (filtro === "no_leidos") params.set("no_leidos", "true")
    if (filtro === "denuncias") params.set("categoria", "denuncia")
    if (filtro === "sin_responder") params.set("estado", "nuevo")
    if (filtro !== "sin_responder" && filtroEstado) params.set("estado", filtroEstado)
    const res = await fetch(`/api/admin/mensajes?${params.toString()}`)
    if (!res.ok) {
      const data = await res.json()
      addToast(data.error || "Error al cargar mensajes", "error")
    } else {
      setMensajes(await res.json())
    }
    setLoading(false)
  }, [filtro, filtroEstado, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchMensajes()
    }
    run()
  }, [fetchMensajes])

  const sinLeer = useMemo(() => mensajes.filter((m) => !m.leido).length, [mensajes])

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    setSelected((prev) => prev.size === mensajes.length ? new Set() : new Set(mensajes.map((m) => m.id)))
  }

  const marcarLeido = async (mensaje: Mensaje) => {
    const res = await fetch(`/api/admin/mensajes/${mensaje.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leido: !mensaje.leido }),
    })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al actualizar", "error")
      return
    }
    addToast(!mensaje.leido ? "Marcado como leído" : "Marcado como no leído", "success")
    fetchMensajes()
  }

  const cambiarEstado = async (mensaje: Mensaje, estado: string) => {
    const res = await fetch(`/api/admin/mensajes/${mensaje.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al actualizar", "error")
      return
    }
    addToast("Estado actualizado", "success")
    setRespuestaDraft("")
    fetchMensajes()
  }

  const responder = async (mensaje: Mensaje) => {
    if (!respuestaDraft.trim()) {
      addToast("Escribe una respuesta antes de enviar", "error")
      return
    }
    const res = await fetch(`/api/admin/mensajes/${mensaje.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "respondido", respuesta: respuestaDraft, leido: true }),
    })
    const data = await res.json()
    if (!res.ok) {
      addToast(data.error || "Error al guardar", "error")
      return
    }
    addToast("Respuesta guardada", "success")
    setRespuestaDraft("")
    fetchMensajes()
  }

  const handleDelete = async () => {
    if (deleteBulk && selected.size) {
      const res = await fetch("/api/admin/mensajes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al eliminar", "error")
        return
      }
      addToast(data.message || "Mensajes eliminados", "success")
      setSelected(new Set())
    } else if (deleteTarget) {
      const res = await fetch(`/api/admin/mensajes/${deleteTarget.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        addToast(data.error || "Error al eliminar", "error")
        return
      }
      addToast("Mensaje eliminado", "success")
    }
    setDeleteTarget(null)
    setDeleteBulk(false)
    fetchMensajes()
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            Mensajes de Contacto
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sinLeer > 0 ? `${sinLeer} mensaje(s) sin leer` : "Sin mensajes sin leer"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {puedeEditar && <span className="text-sm font-medium text-amber-600 dark:text-amber-400">{mensajes.filter((m) => m.estado === "nuevo").length} en nuevo</span>}
          {puedeEliminar && selected.size > 0 && (
            <Button variant="destructive" size="sm" onClick={() => setDeleteBulk(true)}>
              Eliminar seleccionados ({selected.size})
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFiltro("todos")}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium border", filtro === "todos" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro("sin_responder")}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium border", filtro === "sin_responder" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}
        >
          Sin responder
        </button>
        <button
          onClick={() => setFiltro("no_leidos")}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium border", filtro === "no_leidos" ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/40")}
        >
          No leídos
        </button>
        <button
          onClick={() => setFiltro("denuncias")}
          className={cn("rounded-lg px-4 py-2 text-sm font-medium border flex items-center gap-1.5", filtro === "denuncias" ? "bg-destructive text-destructive-foreground border-destructive" : "bg-card border-border hover:border-destructive/40")}
        >
          <ShieldAlert className="h-4 w-4" />
          Denuncias
        </button>
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setFiltro("todos") }}
          className="h-10 rounded-lg border border-input bg-card px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Todos los estados</option>
          {ESTADO_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {mensajes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">No hay mensajes</p>
          <p className="text-sm text-muted-foreground mt-1">Los mensajes enviados desde el formulario de contacto aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mensajes.length > 0 && (
            <div className="flex items-center gap-3 px-1">
              <Checkbox id="select-all" checked={selected.size === mensajes.length} onChange={(e) => { if (e.target.checked) toggleSelectAll(); else setSelected(new Set()) }} />
              <span className="text-xs text-muted-foreground">Seleccionar todo</span>
            </div>
          )}
          {mensajes.map((m) => {
            const isSelected = selected.has(m.id)
            return (
              <div key={m.id} className={cn("rounded-xl border bg-card transition-colors", !m.leido && "border-primary/40 bg-primary/[0.03]", isSelected && "ring-2 ring-primary/40")}>
                <div className="flex items-start justify-between gap-4 p-4 cursor-pointer" onClick={() => { setExpandedId(expandedId === m.id ? null : m.id); setRespuestaDraft("") }}>
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                      <Checkbox id={`sel-${m.id}`} checked={isSelected} onChange={() => toggleSelect(m.id)} />
                    </div>
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", m.categoria === "denuncia" ? "bg-destructive/10 text-destructive" : m.leido ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                      {m.categoria === "denuncia" ? <ShieldAlert className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground">{m.nombre}</span>
                        {m.anonimo && <Badge variant="secondary" className="text-xs">Anónima</Badge>}
                        <Badge variant={m.categoria === "denuncia" ? "destructive" : "outline"} className="text-xs">{CATEGORIA_LABEL[m.categoria] || m.categoria}</Badge>
                        {(() => { const e = ESTADO_LABEL[m.estado]; return e ? <Badge className={e.className}>{e.label}</Badge> : null })()}
                        {m.estado === "respondido" && <MailOpen className="h-4 w-4 text-emerald-600" />}
                        {!m.leido && <Badge className="bg-primary text-primary-foreground">Nuevo</Badge>}
                      </div>
                      {!m.anonimo && <p className="text-xs text-muted-foreground">{m.email}</p>}
                      <p className="mt-1 font-medium text-card-foreground">{m.asunto || (m.categoria === "denuncia" ? "Denuncia" : "Sin asunto")}</p>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{m.mensaje}</p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(m.created_at, "full")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      {puedeEditar && (
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); marcarLeido(m) }}>
                          {m.leido ? <MailOpen className="h-4 w-4 mr-1.5" /> : <Mail className="h-4 w-4 mr-1.5" />}
                          {m.leido ? "No leído" : "Leer"}
                        </Button>
                      )}
                      {puedeEliminar && (
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDeleteTarget(m) }}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <button className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary" onClick={() => { setExpandedId(expandedId === m.id ? null : m.id); setRespuestaDraft("") }}>
                      {expandedId === m.id ? <><ChevronUp className="h-4 w-4" /> Ocultar</> : <><ChevronDown className="h-4 w-4" /> Detalle</>}
                    </button>
                  </div>
                </div>

                {expandedId === m.id && (
                  <div className="border-t bg-background/40 px-4 py-4 space-y-4">
                    <div className="rounded-lg border bg-card p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Mensaje completo</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{m.mensaje}</p>
                    </div>

                    {m.respuesta && (
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <p className="text-xs font-medium text-emerald-700 mb-1">Respuesta del equipo {m.respondido_en ? `(el ${formatDate(m.respondido_en, "short")})` : ""}</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{m.respuesta}</p>
                      </div>
                    )}

                    {puedeEditar && (
                      <>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-foreground">Estado:</span>
                          <select
                            value={m.estado}
                            onChange={(e) => cambiarEstado(m, e.target.value)}
                            className="h-9 rounded-lg border border-input bg-card px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {ESTADO_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Responder al ciudadano</label>
                          <textarea
                            value={respuestaDraft}
                            onChange={(e) => setRespuestaDraft(e.target.value)}
                            rows={3}
                            placeholder="Escribe la respuesta para este mensaje..."
                            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                          />
                          <div className="flex justify-end">
                            <Button size="sm" className="gap-2" onClick={() => responder(m)}>
                              <Reply className="h-4 w-4" />
                              Guardar respuesta y marcar como respondido
                            </Button>
                          </div>
                        </div>
                        {m.anonimo && (
                          <p className="text-xs text-muted-foreground">Denuncia anónima: no se puede notificar por email al remitente.</p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget || deleteBulk}
        title={deleteBulk ? "Eliminar mensajes seleccionados" : "Eliminar mensaje"}
        description={deleteBulk
          ? `¿Seguro que deseas eliminar ${selected.size} mensaje(s)? Esta acción no se puede deshacer.`
          : `¿Seguro que deseas eliminar el mensaje de "${deleteTarget?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => { setDeleteTarget(null); setDeleteBulk(false) }}
      />
    </div>
  )
}