"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { useCurrentUser } from "@/hooks/use-current-user"
import { createClient } from "@/lib/supabase/client"
import { puedeVerAprobaciones } from "@/lib/roles"
import { cn, formatDate } from "@/lib/utils"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

interface Pendiente {
  id: string
  numero: string
  titulo: string
  created_at: string
  created_by: string | null
}

export function AprobacionesPendientes({ max = 5 }: { max?: number }) {
  const { user, loading: userLoading } = useCurrentUser()
  const supabase = createClient()
  const { addToast } = useToast()

  const [pendientes, setPendientes] = useState<Pendiente[]>([])
  const [total, setTotal] = useState(0)
  const [autores, setAutores] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [rechazando, setRechazando] = useState<string | null>(null)
  const [motivo, setMotivo] = useState("")
  const [procesando, setProcesando] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const { data, error, count } = await supabase
      .from("normativa")
      .select("id,numero,titulo,created_at,created_by", { count: "exact" })
      .eq("estado_aprobacion", "pendiente")
      .order("created_at", { ascending: true })
      .limit(max)

    if (error) {
      addToast(error.message, "error")
      setLoading(false)
      return
    }

    const filas = (data as Pendiente[]) ?? []
    setPendientes(filas)
    setTotal(count ?? filas.length)

    const ids = [...new Set(filas.map((f) => f.created_by).filter(Boolean))] as string[]
    if (ids.length > 0) {
      const { data: usuarios } = await supabase.from("usuarios").select("id,nombre").in("id", ids)
      const mapa: Record<string, string> = {}
      ;(usuarios as { id: string; nombre: string }[] | null)?.forEach((u) => { mapa[u.id] = u.nombre })
      setAutores(mapa)
    } else {
      setAutores({})
    }
    setLoading(false)
  }, [supabase, addToast, max])

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

  if (userLoading || !puedeVerAprobaciones(user?.rol)) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <Clock className="h-5 w-5 text-amber-600" />
          Aprobaciones pendientes
          <span className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-medium",
            total > 0
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
              : "bg-muted text-muted-foreground"
          )}>
            {total}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : pendientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay normativa pendiente de aprobación.</p>
        ) : (
          <ul className="divide-y rounded-lg border border-border">
            {pendientes.map((p) => (
              <li key={p.id} className="space-y-2 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">N.º {p.numero}</p>
                    <Link href={`/admin/normativa/${p.id}`} className="text-sm font-semibold hover:text-primary">
                      {p.titulo}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.created_by && autores[p.created_by] ? `Subida por ${autores[p.created_by]}` : "Sin autor registrado"}
                      {" · "}
                      {formatDate(p.created_at, "short")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" loading={procesando === p.id} onClick={() => revisar(p.id, true)}>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setRechazando(rechazando === p.id ? null : p.id); setMotivo("") }}>
                      <XCircle className="mr-1.5 h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </div>
                {rechazando === p.id && (
                  <div className="space-y-2 rounded-lg border border-input p-2">
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      rows={2}
                      placeholder="Motivo del rechazo"
                      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" loading={procesando === p.id} onClick={() => revisar(p.id, false)}>
                        Confirmar rechazo
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { setRechazando(null); setMotivo("") }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin/aprobaciones" className="inline-block text-sm font-medium text-primary hover:underline">
          Ver todas las aprobaciones
        </Link>
      </CardContent>
    </Card>
  )
}
