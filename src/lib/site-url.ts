import { headers } from "next/headers"

export async function getSiteUrl(): Promise<string> {
  const configurada = process.env.NEXT_PUBLIC_SITE_URL
  if (configurada) return configurada.replace(/\/+$/, "")
  const h = await headers()
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000"
  const proto = (h.get("x-forwarded-proto") || "https").split(",")[0].trim()
  return `${proto}://${host}`
}