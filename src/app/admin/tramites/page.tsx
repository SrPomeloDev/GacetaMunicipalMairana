"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import type { Tramite } from "@/types"

export default function AdminTramitesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [dependencias, setDependencias] = useState<Record<string, string>>({})
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Tramite | null>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  const fetchTramites = useCallback(async () => {
    const [trRes, depRes] = await Promise.all([
      supabase.from("tramites").select("*").order("created_at", { ascending: false }),
      supabase.from("dependencias").select("id,nombre"),
    ])
    if (trRes.error) {
      addToast(trRes.error.message, "error")
    } else {
      setTramites(trRes.data || [])
    }
    if (depRes.error) {
      addToast(depRes.error.message, "error")
    } else {
      const map: Record<string, string> = {}
      depRes.data?.forEach((d) => { map[d.id] = d.nombre })
      setDependencias(map)
    }
    setLoading(false)
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchTramites()
    }
    run()
  }, [fetchTramites])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from("tramites").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Trámite eliminado", "success")
      setDeleteTarget(null)
      fetchTramites()
    }
  }

  const toggleActivo = async (t: Tramite) => {
    const { error } = await supabase.from("tramites").update({ activo: !t.activo }).eq("id", t.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      fetchTramites()
    }
  }

  const filtered = tramites.filter((t) => t.titulo.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Trámites</h1>
          <p className="text-sm text-muted-foreground">Gestión de trámites municipales</p>
        </div>
        <Link href="/admin/tramites/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Trámite
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                placeholder="Buscar trámites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Título</th>
                    <th className="pb-3 font-medium">Dependencia</th>
                    <th className="pb-3 font-medium">Costo</th>
                    <th className="pb-3 font-medium">Tiempo</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tramite) => (
                    <tr key={tramite.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{tramite.titulo}</td>
                      <td className="py-3 text-muted-foreground">{tramite.dependencia_id ? dependencias[tramite.dependencia_id] || "-" : "-"}</td>
                      <td className="py-3">{tramite.costo || "-"}</td>
                      <td className="py-3 text-muted-foreground">{tramite.tiempo_estimado || "-"}</td>
                      <td className="py-3">
                        <button
                          onClick={() => toggleActivo(tramite)}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            tramite.activo ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-border"
                          }`}
                          title="Clic para cambiar estado"
                        >
                          {tramite.activo ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                          {tramite.activo ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/tramites/${tramite.id}`}>
                            <Button variant="ghost" size="icon-sm" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon-sm" className="text-destructive" title="Eliminar" onClick={() => setDeleteTarget(tramite)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No se encontraron trámites</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar trámite"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
