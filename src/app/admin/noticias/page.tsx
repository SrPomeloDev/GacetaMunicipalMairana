"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import type { Column } from "@/components/ui/data-table"
import type { Noticia } from "@/types"

const CATEGORIA_LABEL: Record<string, string> = {
  institucional: "Institucional", evento: "Evento", programa: "Programa",
  comunicado: "Comunicado", cultura: "Cultura",
}

export default function NoticiasListPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Noticia | null>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  const fetchNoticias = useCallback(async () => {
    const { data, error } = await supabase
      .from("noticias")
      .select("*")
      .order("fecha_publicacion", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
    if (error) {
      addToast(error.message, "error")
    } else {
      setNoticias(data || [])
    }
    setLoading(false)
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchNoticias()
    }
    run()
  }, [fetchNoticias])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from("noticias").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Noticia eliminada", "success")
      setDeleteTarget(null)
      fetchNoticias()
    }
  }

  const togglePublicada = async (noticia: Noticia) => {
    const { error } = await supabase
      .from("noticias")
      .update({ publicada: !noticia.publicada })
      .eq("id", noticia.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast(noticia.publicada ? "Noticia despublicada" : "Noticia publicada", "success")
      fetchNoticias()
    }
  }

  const toggleDestacada = async (noticia: Noticia) => {
    const { error } = await supabase
      .from("noticias")
      .update({ destacada: !noticia.destacada })
      .eq("id", noticia.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast(noticia.destacada ? "Quitada de destacadas" : "Marcada como destacada", "success")
      fetchNoticias()
    }
  }

  const filtered = noticias.filter((n) => {
    const q = search.toLowerCase()
    return (
      !q ||
      n.titulo.toLowerCase().includes(q) ||
      (n.resumen || "").toLowerCase().includes(q) ||
      (CATEGORIA_LABEL[n.categoria] || n.categoria).toLowerCase().includes(q)
    )
  })

  const columns: Column<Noticia>[] = [
    { key: "titulo", label: "Título", render: (val) => (
      <span className="font-medium truncate max-w-xs block">{val}</span>
    )},
    { key: "categoria", label: "Categoría", render: (val) => (
      <Badge variant="outline">{CATEGORIA_LABEL[val] || val}</Badge>
    )},
    { key: "publicada", label: "Estado", render: (_val, row) => (
      <Button
        variant={row.publicada ? "success" : "secondary"}
        size="sm"
        onClick={() => togglePublicada(row)}
        title={row.publicada ? "Hacer clic para despublicar" : "Hacer clic para publicar"}
      >
        {row.publicada ? "Publicada" : "Borrador"}
      </Button>
    )},
    { key: "destacada", label: "Destacada", render: (_val, row) => (
      <Button
        variant={row.destacada ? "success" : "secondary"}
        size="sm"
        onClick={() => toggleDestacada(row)}
        title={row.destacada ? "Quitar de destacadas" : "Marcar como destacada"}
      >
        {row.destacada ? "Destacada" : "No"}
      </Button>
    )},
    { key: "fecha_publicacion", label: "Fecha", render: (val) => val ? formatDate(val, "short") : "-" },
    { key: "acciones", label: "Acciones", render: (_val, row) => (
      <div className="flex gap-2">
        <Link href={`/noticias/${(row as Noticia).slug}`} target="_blank">
          <Button variant="ghost" size="sm">Ver</Button>
        </Link>
        <Link href={`/admin/noticias/${(row as Noticia).id}`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(row as Noticia)}>Eliminar</Button>
      </div>
    )},
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Noticias</h1>
        <Link href="/admin/noticias/nueva">
          <Button>Nueva Noticia</Button>
        </Link>
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Buscar noticia..." />
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} />
      )}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar noticia"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
