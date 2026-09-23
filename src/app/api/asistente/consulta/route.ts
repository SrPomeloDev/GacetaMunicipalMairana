import type { SupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { checkRateLimit, getClientIp, rateLimitExceededResponse } from "@/lib/rate-limit"
import { createServerSupabaseClient } from "@/lib/supabase/server"

type Referencia = { titulo: string; url: string }
type NormativaEstado = "vigente" | "derogada" | "suspendida" | "modificada"
type Resultado = {
  respuesta: string
  referencias: Referencia[]
}

const respuestasFallback: Record<string, Resultado> = {
  predeterminada: {
    respuesta:
      "Soy el asistente virtual de la Gaceta Municipal de Mairana. Puedo ayudarte a consultar normativas, noticias, trámites y transparencia municipal. ¿Sobre qué tema deseas información?",
    referencias: [
      { titulo: "Gaceta Municipal de Mairana", url: "/gaceta" },
      { titulo: "Normativa Municipal", url: "/gaceta" },
      { titulo: "Trámites", url: "/tramites" },
    ],
  },
  tramite: {
    respuesta:
      "La Municipalidad de Mairana ofrece diversos trámites como solicitud de factibilidad, licencia de construcción, patente municipal, y más. Visita la sección de Trámites para ver requisitos, costos y pasos a seguir.",
    referencias: [
      { titulo: "Trámites Municipales", url: "/tramites" },
      { titulo: "Licencia de Construcción", url: "/tramites/licencia-de-construccion" },
    ],
  },
  transparencia: {
    respuesta:
      "La gestión transparente es prioridad en Mairana. Puedes acceder a información presupuestaria, POA, PEI, contrataciones y auditorías en la sección de Transparencia.",
    referencias: [
      { titulo: "Transparencia", url: "/transparencia" },
      { titulo: "Presupuesto Municipal", url: "/transparencia?categoria=presupuesto" },
    ],
  },
}

const STOPWORDS = new Set([
  "que", "cual", "cuales", "como", "donde", "cuando", "quien", "quienes", "esta", "estan", "este",
  "estos", "estas", "existe", "existen", "hay", "son", "son", "sobre", "para", "por", "con", "sin",
  "desde", "hasta", "entre", "hacia", "una", "unos", "unas", "unos", "del", "los", "las", "unos",
  "mira", "dime", "quiero", "necesito", "puedo", "puede", "pueden", "hola", "gracias", "info",
  "informacion", "información", "mairana", "municipal", "municipio", "gam", "gaceta", "normativa",
  "ley", "leyes", "decreto", "decretos", "ordenanza", "ordenanzas", "resolucion", "resoluciones",
  "acuerdo", "acuerdos", "normas", "documento",
  "documentos", "cual", "cuanto", "cuantos", "cualquier", "otro", "otros", "todas", "todos",
  "vigente", "vigentes", "derogada", "derogado", "derogadas", "derogados", "suspendida",
  "suspendido", "modificada", "modificado", "aplica", "aplican", "dice", "habla", "trata",
])

const ESTADOS_PATRON: [RegExp, NormativaEstado][] = [
  [/derogad/i, "derogada"],
  [/suspendid/i, "suspendida"],
  [/modificad/i, "modificada"],
  [/vigent/i, "vigente"],
]

const CATEGORIAS_PATRON: [RegExp, string][] = [
  [/ordenanza/i, "ordenanza-municipal"],
  [/decreto/i, "decreto-municipal"],
  [/resoluci[oó]n/i, "resolucion-municipal"],
  [/acuerdo/i, "acuerdo-municipal"],
]

function detectarIntencion(pregunta: string): string {
  const p = pregunta.toLowerCase()
  const mencionaNormativa =
    p.includes("normativa") ||
    p.includes("ley") ||
    p.includes("decreto") ||
    p.includes("ordenanza") ||
    p.includes("resolución") ||
    p.includes("resolucion") ||
    p.includes("acuerdo") ||
    CATEGORIAS_PATRON.some(([patron]) => patron.test(p))
  if (mencionaNormativa) return "normativa"
  if (
    p.includes("trámite") ||
    p.includes("tramite") ||
    p.includes("requisito") ||
    p.includes("licencia") ||
    p.includes("patente") ||
    p.includes("permiso")
  )
    return "tramite"
  if (
    p.includes("transparencia") ||
    p.includes("presupuesto") ||
    p.includes("contratación") ||
    p.includes("contratacion") ||
    p.includes("auditoría") ||
    p.includes("auditoria") ||
    p.includes("poa") ||
    p.includes("pei")
  )
    return "transparencia"
  return "predeterminada"
}

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

function terminosSignificativos(pregunta: string): string[] {
  const limpio = normalizar(pregunta).replace(/[¿?¡!.,;:()"']/g, " ")
  return limpio
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
}

function detectarEstado(pregunta: string): NormativaEstado | null {
  for (const [patron, estado] of ESTADOS_PATRON) {
    if (patron.test(pregunta)) return estado
  }
  return null
}

function escapeIlike(texto: string): string {
  return texto.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_").replace(/[,()]/g, " ")
}

function buscarPosicion(norm: string, termino: string): number {
  let from = 0
  let first = -1
  while (true) {
    const pos = norm.indexOf(termino, from)
    if (pos === -1) return first
    if (first === -1) first = pos
    const lineStart = norm.lastIndexOf("\n", pos) + 1
    let lineEnd = norm.indexOf("\n", pos)
    if (lineEnd === -1) lineEnd = norm.length
    const line = norm.slice(lineStart, lineEnd)
    const esIndice = /\.{3,}/.test(line) || /^\s*\d{1,3}\s*$/.test(line)
    if (!esIndice) return pos
    from = pos + termino.length
  }
}

function extraerFragmento(texto: string, terminos: string[], fraseCompleta: string): string | null {
  if (!texto || terminos.length === 0) return null
  const norm = normalizar(texto)
  const frase = fraseCompleta.trim()
  const candidatos = (frase.length >= 4 && norm.includes(normalizar(frase)) ? [frase] : []).concat(
    terminos.filter((t) => t.length >= 4).sort((a, b) => b.length - a.length)
  )
  let idx = -1
  for (const t of candidatos) {
    const pos = buscarPosicion(norm, normalizar(t))
    if (pos !== -1) {
      idx = pos
      break
    }
  }
  if (idx === -1) return null
  const start = Math.max(0, idx - 120)
  const end = Math.min(texto.length, idx + 240)
  let frag = texto.slice(start, end).replace(/\s+/g, " ").trim()
  if (start > 0) {
    const sp = frag.indexOf(" ")
    if (sp !== -1 && sp < 60) frag = frag.slice(sp + 1)
  }
  if (end < texto.length) {
    const sp = frag.lastIndexOf(" ")
    if (sp !== -1 && frag.length - sp < 60) frag = frag.slice(0, sp)
  }
  if (start > 0) frag = `…${frag}`
  if (end < texto.length) frag = `${frag}…`
  return frag
}

function listarResultados(hits: Array<{ numero: string; titulo: string; estado: string }>): string {
  return hits
    .map((h) => `• ${h.numero} — ${h.titulo} (${h.estado})`)
    .join("\n")
}

async function rpcConReintento(
  supabase: SupabaseClient,
  args: { p_query: string; p_categoria_id?: string; p_estado?: NormativaEstado; p_limit: number }
) {
  const primero = await supabase.rpc("buscar_normativa", args)
  if (!primero.error) return primero
  await new Promise((r) => setTimeout(r, 350))
  return supabase.rpc("buscar_normativa", args)
}

export async function POST(request: Request) {
  try {
    const rl = checkRateLimit(`asistente:${getClientIp(request)}`, { limit: 20, windowMs: 60000 })
    if (!rl.ok) return rateLimitExceededResponse(rl.retryAfter)

    const { pregunta } = await request.json()

    if (!pregunta || typeof pregunta !== "string") {
      return NextResponse.json({ error: "El campo 'pregunta' es requerido" }, { status: 400 })
    }

    const intencion = detectarIntencion(pregunta)

    if (intencion === "tramite" || intencion === "transparencia") {
      return NextResponse.json(respuestasFallback[intencion])
    }

    const supabase = await createServerSupabaseClient()
    const terminos = terminosSignificativos(pregunta)
    const estado = detectarEstado(pregunta)

    if (intencion === "predeterminada" && terminos.length === 0 && !estado) {
      return NextResponse.json(respuestasFallback.predeterminada)
    }

    let categoriaId: string | undefined
    for (const [patron, slug] of CATEGORIAS_PATRON) {
      if (patron.test(pregunta)) {
        const { data: cat } = await supabase
          .from("categorias_normativa")
          .select("id")
          .eq("slug", slug)
          .maybeSingle()
        if (cat) categoriaId = cat.id
        break
      }
    }

    const queryTexto = terminos.join(" ")

    let hits: Array<{
      id: string
      numero: string
      titulo: string
      resumen: string | null
      slug: string
      estado: string
      fecha_publicacion: string | null
      rank?: number
    }> = []
    let total = 0

    if (queryTexto || estado || categoriaId) {
      const { data, error } = await rpcConReintento(supabase, {
        p_query: queryTexto,
        p_categoria_id: categoriaId,
        p_estado: estado ?? undefined,
        p_limit: 6,
      })

      if (!error && data && data.length > 0) {
        hits = data
        const primero = data[0] as { total_count?: number }
        total = primero.total_count ?? data.length
      } else {
        const terminosFallback = terminos.length > 0 ? terminos : queryTexto ? [queryTexto] : []
        if (terminosFallback.length > 0) {
          const condiciones = terminosFallback
            .map((t) => {
              const safe = escapeIlike(t)
              return `titulo.ilike.%${safe}%,numero.ilike.%${safe}%,resumen.ilike.%${safe}%,contenido_texto.ilike.%${safe}%`
            })
            .join(",")
          let fb = supabase
            .from("normativa")
            .select("id, numero, titulo, resumen, slug, estado, fecha_publicacion")
            .eq("publicada", true)
            .or(condiciones)
            .order("fecha_publicacion", { ascending: false, nullsFirst: false })
            .limit(6)
          if (estado) fb = fb.eq("estado", estado)
          if (categoriaId) fb = fb.eq("categoria_id", categoriaId)
          const res = await fb
          if (!res.error && res.data) {
            hits = res.data
            total = res.data.length
          }
        }
      }
    }

    if (hits.length === 0) {
      if (estado || terminos.length > 0) {
        return NextResponse.json({
          respuesta: `No encontré normativas publicadas que coincidan con tu consulta${estado ? ` (estado: ${estado})` : ""}. Puedes usar el buscador de la Gaceta para ampliar la búsqueda.`,
          referencias: [{ titulo: "Buscar en la Gaceta Oficial", url: "/gaceta" }],
        })
      }
      return NextResponse.json(respuestasFallback.predeterminada)
    }

    const referencias: Referencia[] = hits.slice(0, 5).map((h) => ({
      titulo: `${h.numero} — ${h.titulo}`,
      url: `/normativa/${h.slug}`,
    }))
    referencias.push({ titulo: "Ver toda la Gaceta Oficial", url: "/gaceta" })

    let respuesta = `Encontré ${total === 1 ? "1 normativa" : `${total} normativas`} relacionada${total === 1 ? "" : "s"}:\n${listarResultados(hits)}`

    const { data: primero } = await supabase
      .from("normativa")
      .select("contenido_texto")
      .eq("id", hits[0].id)
      .maybeSingle()

    const fragmento = primero?.contenido_texto ? extraerFragmento(primero.contenido_texto, terminos, queryTexto) : null
    if (fragmento) {
      respuesta += `\n\nDe "${hits[0].titulo}": "${fragmento}"`
    }

    return NextResponse.json({ respuesta, referencias })
  } catch {
    return NextResponse.json({ error: "Error al procesar la consulta" }, { status: 500 })
  }
}