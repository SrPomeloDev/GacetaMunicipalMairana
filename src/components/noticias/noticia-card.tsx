"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { NoticiaPlaceholder } from "@/components/noticias/noticia-placeholder"

interface NoticiaCardProps {
  noticia: {
    titulo: string
    slug: string
    resumen?: string | null
    imagen_principal?: string | null
    fecha_publicacion: string
    categoria?: string | null
  }
}

const categoriaColores: Record<string, string> = {
  noticias: "bg-primary/10 text-primary-foreground border-primary/20",
  eventos: "bg-primary/10 text-primary-foreground border-primary/20",
  comunicados: "bg-primary/10 text-primary-foreground border-primary/20",
  convocatorias: "bg-primary/10 text-primary-foreground border-primary/20",
  transparencia: "bg-primary/10 text-primary-foreground border-primary/20",
}

export function NoticiaCard({ noticia }: NoticiaCardProps) {
  return (
    <div className="group rounded-xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
      <Link href={`/noticias/${noticia.slug}`}>
        <div
          className={cn(
            "relative h-48 w-full overflow-hidden",
            !noticia.imagen_principal && "bg-gradient-to-br from-primary/40 to-primary/80"
          )}
        >
          {noticia.imagen_principal ? (
            <img
              src={noticia.imagen_principal}
              alt={noticia.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <NoticiaPlaceholder className="absolute inset-0 h-full w-full" />
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {noticia.categoria && (
            <Badge className={categoriaColores[noticia.categoria.toLowerCase()] || "bg-muted text-muted-foreground"}>
              {noticia.categoria}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDate(noticia.fecha_publicacion)}
          </span>
        </div>
        <Link href={`/noticias/${noticia.slug}`}>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {noticia.titulo}
          </h3>
        </Link>
        {noticia.resumen && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {noticia.resumen}
          </p>
        )}
      </div>
    </div>
  )
}
