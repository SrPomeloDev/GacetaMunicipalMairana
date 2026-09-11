const DANGEROUS_TAGS = /<\/?(script|style|iframe|object|embed|form|input|button|link|meta|base|title|textarea|select|option|noscript|template|slot|shadow|canvas|applet)\b[^>]*>/gi

const EVENT_HANDLER_ATTR = /\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi

const DANGEROUS_HREF = /(href|src|xlink:href|action|formaction)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi

function isDangerousUrl(url: string): boolean {
  const normalized = url.trim().replace(/[\u0000-\u0020]+/g, "").toLowerCase()
  return (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("vbscript:") ||
    normalized.startsWith("data:text/html") ||
    normalized.startsWith("data:application/xhtml") ||
    normalized.startsWith("file:")
  )
}

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty || typeof dirty !== "string") return ""
  let clean = dirty.replace(/<!--[\s\S]*?-->/g, "")
  clean = clean.replace(DANGEROUS_TAGS, "")
  clean = clean.replace(EVENT_HANDLER_ATTR, "")
  clean = clean.replace(DANGEROUS_HREF, (match, attr, _quoted, d1, d2, d3) => {
    const url = (d1 ?? d2 ?? d3 ?? "") as string
    if (isDangerousUrl(url)) return `${attr}="#"`.replace(attr, attr)
    return match
  })
  clean = clean.replace(/\s+(href|src)\s*=\s*(?!["'])/gi, ' $1="')
  return clean
}

export function isSafeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false
  const trimmed = url.trim()
  if (trimmed === "" || trimmed === "#") return true
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    if (/^https?:\/\//i.test(trimmed)) return !isDangerousUrl(trimmed)
    if (/^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return true
    return false
  }
  return !isDangerousUrl(trimmed)
}
