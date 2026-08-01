"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

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
  noticias: "bg-blue-100 text-blue-800 border-blue-200",
  eventos: "bg-purple-100 text-purple-800 border-purple-200",
  comunicados: "bg-orange-100 text-orange-800 border-orange-200",
  convocatorias: "bg-green-100 text-green-800 border-green-200",
  transparencia: "bg-gray-100 text-gray-800 border-gray-200",
}

export function NoticiaCard({ noticia }: NoticiaCardProps) {
  return (
    <div className="group rounded-xl border bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
      <Link href={`/noticias/${noticia.slug}`}>
        <div
          className={cn(
            "relative h-48 w-full overflow-hidden",
            !noticia.imagen_principal && "bg-gradient-to-br from-orange-200 to-orange-400"
          )}
        >
          {noticia.imagen_principal ? (
            <img
              src={noticia.imagen_principal}
              alt={noticia.titulo}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <img
                src="/images/escudo-mairana.jpg"
                alt=""
                className="h-16 w-auto rounded-xl bg-white/85 object-contain p-1.5 opacity-80 shadow-lg"
              />
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          {noticia.categoria && (
            <Badge className={categoriaColores[noticia.categoria.toLowerCase()] || "bg-gray-100 text-gray-800"}>
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
