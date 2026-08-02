import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import PageHeader from "@/components/layout/page-header"
import { Calendar, Share2, ArrowLeft, Image as ImageIcon, Newspaper } from "lucide-react"
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
    <div className="pb-16">
      <PageHeader
        title={n.titulo}
        crumbs={[{ label: "Noticias", href: "/noticias" }, { label: n.titulo }]}
        icon={<Newspaper className="hidden h-8 w-8 shrink-0 text-primary sm:block" />}
      >
        <span className="inline-block rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
          {CATEGORIA_LABEL[n.categoria] || n.categoria}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          {n.fecha_publicacion ? formatDate(n.fecha_publicacion, "long") : formatDate(n.created_at, "long")}
        </span>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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

      <article className="max-w-none pt-8">
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
    </div>
  )
}
