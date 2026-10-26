"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { createClient } from "@/lib/supabase/client"
import { puedeVerAprobaciones } from "@/lib/roles"
import { cn, formatDate } from "@/lib/utils"
import { CheckCircle2, Clock, ExternalLink, FileText, XCircle } from "lucide-react"

type EstadoRevision = "pendiente" | "rechazado" | "aprobado"

interface Fila {
  id: string
  numero: string
  titulo: string
  resumen: string | null
  archivo_pdf: string | null
  created_at: string
  created_by: string | null
  aprobado_en: string | null
  aprobado_por: string | null
  motivo_rechazo: string | null
}

const TABS = [
  { key: "pendiente", label: "Pendientes", icon: Clock },
  { key: "rechazado", label: "Rechazadas", icon: XCircle },
  { key: "aprobado", label: "Aprobadas", icon: CheckCircle2 },
] as const

const VACIO: Record<EstadoRevision, { titulo: string; desc: string }> = {
  pendiente: { titulo: "No hay normativa pendiente", desc: "Las subidas de los funcionarios aparecerán aquí." },
  rechazado: { titulo: "No hay normativa rechazada", desc: "Lo que rechaces quedará listado aquí hasta que se corrija." },
  aprobado: { titulo: "Todavía no aprobaste normativa", desc: "El historial de aprobaciones aparecerá aquí." },
}

export default function AprobacionesPage() {
  const { user, loading: userLoading } = useCurrentUser()
  const supabase = createClient()
  const { addToast } = useToast()

  const [tab, setTab] = useState<EstadoRevision>("pendiente")
  const [filas, setFilas] = useState<Fila[]>([])
  const [nombres, setNombres] = useState<Record<string, string>>({})
  const [counts, setCounts] = useState<Record<EstadoRevision, number>>({ pendiente: 0, rechazado: 0, aprobado: 0 })
  const [loading, setLoading] = useState(true)
  const [rechazando, setRechazando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState("")
  const [procesando, setProcesando] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const [listaRes, ...conteos] = await Promise.all([
      supabase
        .from("normativa")
        .select("id,numero,titulo,resumen,archivo_pdf,created_at,created_by,aprobado_en,aprobado_por,motivo_rechazo")
        .eq("estado_aprobacion", tab)
        .order(tab === "aprobado" ? "aprobado_en" : "created_at", { ascending: false, nullsFirst: false }),
      ...(["pendiente", "rechazado", "aprobado"] as const).map((estado) =>
        supabase.from("normativa").select("id", { count: "exact", head: true }).eq("estado_aprobacion", estado)
      ),
    ])

    if (listaRes.error) {
      addToast(listaRes.error.message, "error")
      setLoading(false)
      return
    }

    const nuevas = (listaRes.data as Fila[]) ?? []
    setFilas(nuevas)
    setCounts({
      pendiente: conteos[0].count ?? 0,
      rechazado: conteos[1].count ?? 0,
      aprobado: conteos[2].count ?? 0,
    })

    const ids = [
      ...new Set(
        nuevas
          .flatMap((f) => [f.created_by, f.aprobado_por])
          .filter((v): v is string => Boolean(v))
      ),
    ]
    if (ids.length > 0) {
      const { data: usuarios } = await supabase.from("usuarios").select("id,nombre").in("id", ids)
      const mapa: Record<string, string> = {}
      ;(usuarios as { id: string; nombre: string }[] | null)?.forEach((u) => { mapa[u.id] = u.nombre })
      setNombres(mapa)
    } else {
      setNombres({})
    }
    setLoading(false)
  }, [supabase, addToast, tab])

  useEffect(() => {
    if (userLoading || !puedeVerAprobaciones(user?.rol)) return
    const run = async () => { await cargar() }
    run()
  }, [userLoading, user, cargar])

  const revisar = async (id: string, aprobar: boolean) => {
    if (!aprobar && !motivo.trim()) {
      addToast("Indica el motivo del rechazo", "error")
      return
    }
    setProcesando(id)
    try {
      const { error } = await supabase.rpc("revisar_normativa", {
        p_id: id,
        p_aprobar: aprobar,
        p_motivo: aprobar ? null : motivo.trim(),
      })
      if (error) {
        addToast(error.message, "error")
        return
      }
      addToast(aprobar ? "Normativa aprobada y publicada" : "Normativa rechazada", "success")
      setRechazando(null)
      setMotivo("")
      await cargar()
    } finally {
      setProcesando(null)
    }
  }

  if (userLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
  }

  if (!puedeVerAprobaciones(user?.rol)) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Aprobaciones</h1>
        <p className="text-sm text-muted-foreground">Solo un administrador puede revisar y aprobar normativa.</p>
      </div>
    )
  }

  const tabActual = TABS.find((t) => t.key === tab) ?? TABS[0]
  const TabIcon = tabActual.icon

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Aprobaciones</h1>
          <p className="text-sm text-muted-foreground">Normativa cargada por los funcionarios, pendiente de su aprobación.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Clock className="h-4 w-4" />
          {counts.pendiente} pendiente{counts.pendiente === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-xs font-semibold",
              tab === key ? "bg-muted text-foreground" : "bg-muted/70 text-muted-foreground"
            )}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
      ) : filas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <TabIcon className="h-8 w-8 text-green-600" />
            <p className="font-medium">{VACIO[tab].titulo}</p>
            <p className="text-sm text-muted-foreground">{VACIO[tab].desc}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filas.map((f) => (
            <Card key={f.id}>
              <CardContent className="space-y-3 py-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">N.º {f.numero}</p>
                    <Link href={`/admin/normativa/${f.id}`} className="text-base font-semibold hover:text-primary">
                      {f.titulo}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tab === "pendiente" && (
                        f.created_by && nombres[f.created_by] ? `Subida por ${nombres[f.created_by]}` : "Sin autor registrado"
                      )}
                      {tab === "rechazado" && (
                        <>
                          {f.aprobado_por && nombres[f.aprobado_por] ? `Rechazada por ${nombres[f.aprobado_por]}` : "Rechazada"}
                          {f.aprobado_en ? ` · ${formatDate(f.aprobado_en, "short")}` : ""}
                        </>
                      )}
                      {tab === "aprobado" && (
                        <>
                          {f.aprobado_por && nombres[f.aprobado_por] ? `Aprobada por ${nombres[f.aprobado_por]}` : "Aprobada"}
                          {f.aprobado_en ? ` · ${formatDate(f.aprobado_en, "short")}` : ""}
                        </>
                      )}
                      {tab === "pendiente" && (
                        <>{" · "}{formatDate(f.created_at, "short")}</>
                      )}
                    </p>
                    {tab === "rechazado" && f.motivo_rechazo && (
                      <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                        {f.motivo_rechazo}
                      </p>
                    )}
                    {tab !== "rechazado" && f.resumen && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{f.resumen}</p>
                    )}
                  </div>
                  {f.archivo_pdf && (
                    <a
                      href={f.archivo_pdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1 text-sm text-primary hover:underline"
                    >
                      PDF <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>

                {tab === "pendiente" && (rechazando === f.id ? (
                  <div className="space-y-3 rounded-lg border border-input p-3">
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      rows={2}
                      placeholder="Motivo del rechazo (lo verá quien subió la normativa)"
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button variant="destructive" size="sm" loading={procesando === f.id} onClick={() => revisar(f.id, false)}>
                        Confirmar rechazo
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => { setRechazando(null); setMotivo("") }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" loading={procesando === f.id} onClick={() => revisar(f.id, true)}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Aprobar y publicar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setRechazando(f.id); setMotivo("") }}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                    <Link href={`/admin/normativa/${f.id}`}>
                      <Button variant="ghost" size="sm">Revisar ficha</Button>
                    </Link>
                  </div>
                ))}

                {tab !== "pendiente" && (
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/normativa/${f.id}`}>
                      <Button variant="outline" size="sm">Revisar ficha</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
