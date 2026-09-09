import { NextResponse } from "next/server"
import { requireVerModulo, type PermisosUsuario } from "@/lib/permisos-server"
import { esUrlFacebookCanonico } from "@/lib/utils"

const HOSTS = new Set([
  "facebook.com",
  "www.facebook.com",
  "m.facebook.com",
  "fb.watch",
  "www.fb.watch",
])

export async function GET(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("noticias")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const raw = (searchParams.get("url") || "").trim()
  if (!raw) {
    return NextResponse.json({ error: "Falta el parámetro url" }, { status: 400 })
  }

  let inicial: URL
  try {
    inicial = new URL(raw)
  } catch {
    return NextResponse.json({ error: "La URL no es válida" }, { status: 400 })
  }
  if (!HOSTS.has(inicial.hostname.toLowerCase())) {
    return NextResponse.json({ error: "Solo se aceptan enlaces de facebook.com" }, { status: 400 })
  }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    const res = await fetch(inicial.toString(), {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "es-BO,es;q=0.9",
      },
    })
    clearTimeout(timer)
    const final = res.url || inicial.toString()

    if (!esUrlFacebookCanonico(final)) {
      return NextResponse.json(
        {
          error:
            "No se pudo obtener la URL directa del post. Abrí la publicación en Facebook y copiá la URL de la barra del navegador.",
        },
        { status: 422 }
      )
    }

    return NextResponse.json({ ok: true, url: final, titulo: null })
  } catch {
    return NextResponse.json(
      { error: "No se pudo contactar a Facebook. Verificá tu conexión e intentá de nuevo." },
      { status: 502 }
    )
  }
}
