"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { Plus, Trash2, FolderOpen, ImageOff } from "lucide-react"
import type { Galeria } from "@/types"

export default function AdminGaleriaPage() {
  const [imagenes, setImagenes] = useState<Galeria[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Galeria | null>(null)
  const { addToast } = useToast()
  const supabase = createClient()

  const fetchImagenes = useCallback(async () => {
    const { data, error } = await supabase.from("galeria").select("*").order("fecha", { ascending: false })
    if (error) {
      addToast(error.message, "error")
    } else {
      setImagenes(data || [])
    }
    setLoading(false)
  }, [supabase, addToast])

  useEffect(() => {
    const run = async () => {
      await fetchImagenes()
    }
    run()
  }, [fetchImagenes])

  const handleDelete = async () => {
    if (!deleteTarget) return
    const { error } = await supabase.from("galeria").delete().eq("id", deleteTarget.id)
    if (error) {
      addToast(error.message, "error")
    } else {
      addToast("Imagen eliminada", "success")
      setDeleteTarget(null)
      fetchImagenes()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Galería</h1>
          <p className="text-sm text-muted-foreground">Gestión de imágenes municipales</p>
        </div>
        <Link href="/admin/galeria/nueva">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Imagen
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 w-full" />)}
        </div>
      ) : imagenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center">
          <ImageOff className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-semibold">No hay imágenes</p>
          <p className="text-sm text-muted-foreground mt-1">Haz clic en &quot;Nueva Imagen&quot; para subir la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {imagenes.map((img) => (
            <Card key={img.id} className="overflow-hidden group">
              <Link href={`/admin/galeria/${img.id}`} className="block relative aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imagen}
                  alt={img.titulo}
                  className="h-full w-full object-cover"
                />
              </Link>
              <CardContent className="p-3">
                <Link href={`/admin/galeria/${img.id}`}>
                  <h3 className="font-medium text-sm truncate hover:text-primary transition-colors">{img.titulo}</h3>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary-foreground px-2 py-0.5 text-xs font-medium">
                    <FolderOpen className="h-3 w-3" />
                    {img.album}
                  </span>
                  <span className="text-xs text-muted-foreground">{img.fecha ? formatDate(img.fecha, "short") : "-"}</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteTarget(img)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar imagen"
        description={`¿Seguro que deseas eliminar "${deleteTarget?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
