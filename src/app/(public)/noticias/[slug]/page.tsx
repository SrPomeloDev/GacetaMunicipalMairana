import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import PageHeader from "@/components/layout/page-header"
import { ShareButtons } from "@/components/share/share-buttons"
import { Calendar, ArrowLeft, ImageIcon, Newspaper } from "@/lib/icons"
import { createAdminClient } from "@/lib/supabase/admin"
import { sanitizeHtml } from "@/lib/sanitize"
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

  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? (process.env.NODE_ENV === "production" ? "https" : "http")
  const pageUrl = `${proto}://${host}/noticias/${n.slug}`

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
        <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl">
          <Image src={n.imagen_principal} alt={n.titulo} fill sizes="(min-width: 896px) 896px, 100vw" className="object-cover" />
        </div>
      ) : !n.facebook_url ? (
        <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-8">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="mx-auto h-12 w-12 mb-2" />
            <p>Imagen destacada</p>
          </div>
        </div>
      ) : null}

      <article className="max-w-none pt-8">
        {n.resumen && (
          <div className="mt-6 border-l-4 border-primary pl-4">
            <p className="text-lg text-muted-foreground italic leading-relaxed">{n.resumen}</p>
          </div>
        )}

        {n.contenido && (
          <div
            className="mt-8 space-y-4 text-foreground leading-relaxed [&_a]:text-primary [&_a]:underline [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(n.contenido) }}
          />
        )}
      </article>

      {n.facebook_url && (
        <div className="mt-8">
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card p-4">
            <iframe
              src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(n.facebook_url)}&show_text=true&width=500`}
              width="500"
              height="640"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              title={`Publicación de Facebook: ${n.titulo}`}
              className="mx-auto w-full max-w-[500px]"
            />
          </div>
          <div className="mt-3 text-center">
            <a
              href={n.facebook_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver original en Facebook
            </a>
          </div>
        </div>
      )}

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
            href={`https://wa.me/?text=${encodeURIComponent(`${n.titulo} ${pageUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-input bg-background shadow-sm hover:bg-accent transition-colors"
            aria-label="Compartir en WhatsApp"
          >
            <span className="text-xs font-bold">W</span>
          </a>
          <ShareButtons url={pageUrl} title={n.titulo} />
        </div>
      </div>
      </div>
    </div>
  )
}
