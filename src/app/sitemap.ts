import type { MetadataRoute } from "next"
import { NAV_LINKS } from "@/lib/constants"
import { getSiteUrl } from "@/lib/site-url"
import { createAdminClient } from "@/lib/supabase/admin"

const RUTAS_ADICIONALES = [
  "/gaceta",
  "/normativa",
  "/asistente",
  "/concejo-municipal",
  "/organo-ejecutivo",
  "/contrataciones",
  "/ayuda",
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl()
  const supabase = createAdminClient()

  const [normativa, noticias] = await Promise.all([
    supabase.from("normativa").select("slug, updated_at, fecha_publicacion").eq("publicada", true),
    supabase.from("noticias").select("slug, updated_at, fecha_publicacion").eq("publicada", true),
  ])

  const basicas: MetadataRoute.Sitemap = [
    ...NAV_LINKS.map((l) => ({ url: `${siteUrl}${l.href}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...RUTAS_ADICIONALES.map((p) => ({ url: `${siteUrl}${p}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ]

  const normativas: MetadataRoute.Sitemap = (normativa.data ?? []).map((n) => ({
    url: `${siteUrl}/normativa/${n.slug}`,
    lastModified: n.updated_at ?? n.fecha_publicacion ?? undefined,
    changeFrequency: "monthly",
    priority: 0.9,
  }))

  const noticiasMap: MetadataRoute.Sitemap = (noticias.data ?? []).map((n) => ({
    url: `${siteUrl}/noticias/${n.slug}`,
    lastModified: n.updated_at ?? n.fecha_publicacion ?? undefined,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...normativas, ...noticiasMap, ...basicas]
}