import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { Calendar, Share2, ArrowLeft, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Noticia } from "@/types"

const CATEGORIA_LABEL: Record<string, string> = {
  institucional: "Institucional", evento: "Evento", programa: "Programa",
  comunicado: "Comunicado", cultura: "Cultura",
}

async function getNoticia(slug: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("noticias")
    .select("*")
    .eq("slug", slug)
    .eq("publicada", true)
    .single()
  if (error || !data) return null
  return data as Noticia
}

export default async function NoticiaDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const n = await getNoticia(slug)
  if (!n) notFound()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Inicio</Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/noticias" className="hover:text-primary transition-colors">Noticias</Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground truncate max-w-[250px]">{n.titulo}</span>
      </nav>

      {n.imagen_principal ? (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img src={n.imagen_principal} alt={n.titulo} className="w-full aspect-video object-cover" />
        </div>
      ) : (
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12 mb-2" />
            <p>Imagen destacada</p>
          </div>
        </div>
      )}

      <article className="max-w-none">
        <div className="mb-3">
          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {CATEGORIA_LABEL[n.categoria] || n.categoria}
          </span>
        </div>

        <h1 className="text-3xl font-bold font-serif text-foreground sm:text-4xl leading-tight">
          {n.titulo}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {n.fecha_publicacion ? formatDate(n.fecha_publicacion, "long") : formatDate(n.created_at, "long")}
          </span>
        </div>

        {n.resumen && (
          <div className="mt-6 border-l-4 border-primary pl-4">
            <p className="text-lg text-muted-foreground italic leading-relaxed">{n.resumen}</p>
          </div>
        )}

        {n.contenido && (
          <div className="mt-8 space-y-4 text-foreground leading-relaxed whitespace-pre-wrap">
            {n.contenido}
          </div>
        )}
      </article>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/noticias"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Noticias
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Compartir:</span>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(n.titulo)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background shadow-sm hover:bg-accent transition-colors"
            aria-label="Compartir en WhatsApp"
          >
            <span className="text-xs font-bold">W</span>
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`/noticias/${n.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background shadow-sm hover:bg-accent transition-colors"
            aria-label="Compartir en Facebook"
          >
            <span className="text-xs font-bold">F</span>
          </a>
          <Button variant="outline" size="icon-sm" className="rounded-full">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
