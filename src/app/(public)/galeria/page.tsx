"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import PageHeader from "@/components/layout/page-header"
import { Image as ImageIcon, Camera, Images } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Galeria } from "@/types"

export default function GaleriaPage() {
  const [images, setImages] = useState<Galeria[]>([])
  const [loading, setLoading] = useState(true)
  const [activeAlbum, setActiveAlbum] = useState("Todas")
  const supabase = createClient()

  const fetchImages = useCallback(async () => {
    const { data, error } = await supabase
      .from("galeria")
      .select("*")
      .order("orden")
      .order("created_at", { ascending: false })
    if (!error && data) setImages(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const run = async () => {
      await fetchImages()
    }
    run()
  }, [fetchImages])

  const albums = useMemo(() => {
    const set = new Set<string>()
    images.forEach((img) => { if (img.album) set.add(img.album) })
    return ["Todas", ...Array.from(set)]
  }, [images])

  const filtered = activeAlbum === "Todas" ? images : images.filter(img => img.album === activeAlbum)

  const heights = ["h-64", "h-80", "h-72", "h-96", "h-60", "h-72", "h-64", "h-80", "h-72", "h-96", "h-64", "h-80"]

  return (
    <div className="pb-16">
      <PageHeader
        title="Galería Municipal"
        description="Imágenes institucionales del municipio de Mairana: actividades, eventos y paisajes de nuestra tierra."
        crumbs={[{ label: "Galería" }]}
        icon={<Camera className="hidden h-8 w-8 text-primary sm:block" />}
      >
        <div className="flex items-center gap-2 rounded-xl border border-primary/15 bg-card/80 px-4 py-2 backdrop-blur">
          <Images className="h-4 w-4 text-primary" />
          <span className="text-2xl font-extrabold font-serif text-foreground">{images.length}</span>
          <span className="text-xs text-muted-foreground">imágenes publicadas</span>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap gap-2 pt-8">
        {albums.map((album) => (
          <button
            key={album}
            onClick={() => setActiveAlbum(album)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeAlbum === album
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {album}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="mb-4 break-inside-avoid">
              <div className={cn("rounded-xl bg-muted animate-pulse", heights[i % heights.length])} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center">
          <Camera className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">No hay imágenes en la galería</p>
          <p className="text-sm text-muted-foreground mt-1">Las imágenes subidas desde el panel de administración aparecerán aquí.</p>
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {filtered.map((item, i) => (
            <div key={item.id} className="mb-4 break-inside-avoid">
              <div className={cn("group relative overflow-hidden rounded-xl cursor-pointer", heights[i % heights.length])}>
                {item.imagen ? (
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-white font-medium">{item.titulo}</p>
                  {item.album && <p className="text-xs text-white/70">{item.album}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
