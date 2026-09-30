const PUBLIC_PREFIX = "/storage/v1/object/public/"
const SIGN_PREFIX = "/storage/v1/object/sign/"

export function storageRefDesdeUrl(url: string | null | undefined): { bucket: string; path: string } | null {
  if (!url || !url.includes("supabase.co")) return null

  let resto: string | null = null
  const idxPublic = url.indexOf(PUBLIC_PREFIX)
  if (idxPublic >= 0) resto = url.slice(idxPublic + PUBLIC_PREFIX.length)
  else {
    const idxSign = url.indexOf(SIGN_PREFIX)
    if (idxSign >= 0) resto = url.slice(idxSign + SIGN_PREFIX.length)
  }
  if (resto === null) return null

  const sinQuery = resto.split("?")[0]
  const slash = sinQuery.indexOf("/")
  if (slash <= 0) return null

  const bucket = sinQuery.slice(0, slash)
  const path = sinQuery.slice(slash + 1)
  if (!path) return null
  return { bucket, path }
}

export function esUrlDelProyecto(url: string): boolean {
  try {
    const host = new URL(url).hostname
    return host === "supabase.co" || host.endsWith(".supabase.co")
  } catch {
    return false
  }
}
