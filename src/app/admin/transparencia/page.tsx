"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Pencil, Trash2, FileText } from "lucide-react"
import type { Transparencia } from "@/types"

const categorias: Record<string, { label: string; color: string }> = {
  presupuesto: { label: "Presupuesto", color: "bg-blue-100 text-blue-700" },
  poa: { label: "POA", color: "bg-purple-100 text-purple-700" },
  pei: { label: "PEI", color: "bg-indigo-100 text-indigo-700" },
  contratacion: { label: "Contratación", color: "bg-primary/10 text-primary" },
  auditoria: { label: "Auditoría", color: "bg-red-100 text-red-700" },
  financiero: { label: "Financiero", color: "bg-green-100 text-green-700" },
  declaracion: { label: "Declaración", color: "bg-teal-100 text-teal-700" },
  informe: { label: "Informe", color: "bg-muted text-muted-foreground" },
}

export default function AdminTransparenciaPage() {
  const [docs, setDocs] = useState<Transparencia[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Transparencia | null>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  const fetchDocs = useCallback(async () => {
    const { data, error } = await supabase.from("transparencia").select("*").order("fecha", { ascending: false })
    if (error) {
      addToast(error.message, "error")
    } else {
      setDocs(data || [])
    }
    setLoading(false)
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchDocs()
    }
    run()
  }, [fetchDocs])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from("transparencia").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Documento eliminado", "success")
      setDeleteTarget(null)
      fetchDocs()
    }
  }

  const togglePublicada = async (doc: Transparencia) => {
    const { error } = await supabase.from("transparencia").update({ publicada: !doc.publicada }).eq("id", doc.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      fetchDocs()
    }
  }

  const filtered = docs.filter((d) => d.titulo.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transparencia</h1>
          <p className="text-sm text-muted-foreground">Gestión de documentos de transparencia</p>
        </div>
        <Link href="/admin/transparencia/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Documento
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar documentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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
                    <th className="pb-3 font-medium">Categoría</th>
                    <th className="pb-3 font-medium">Fecha</th>
                    <th className="pb-3 font-medium">Publicado</th>
                    <th className="pb-3 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{doc.titulo}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${categorias[doc.categoria]?.color || "bg-muted text-muted-foreground"}`}>
                          {categorias[doc.categoria]?.label || doc.categoria}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">{doc.fecha ? formatDate(doc.fecha, "short") : "-"}</td>
                      <td className="py-3">
                        <button
                          onClick={() => togglePublicada(doc)}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                            doc.publicada ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-muted text-muted-foreground hover:bg-border"
                          }`}
                          title="Clic para cambiar"
                        >
                          {doc.publicada ? "Sí" : "No"}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/transparencia/${doc.id}`}>
                            <Button variant="ghost" size="icon-sm" title="Editar">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button variant="ghost" size="icon-sm" className="text-destructive" title="Eliminar" onClick={() => setDeleteTarget(doc)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">No se encontraron documentos</td>
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
        title="Eliminar documento"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
