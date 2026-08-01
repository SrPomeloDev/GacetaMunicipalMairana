import { NextResponse } from "next/server"

const respuestas: Record<string, { respuesta: string; referencias: { titulo: string; url: string }[] }> = {
  predeterminada: {
    respuesta:
      "Soy el asistente virtual de la Gaceta Municipal de Mairana. Puedo ayudarte a consultar normativas, noticias, trámites y transparencia municipal. ¿Sobre qué tema deseas información?",
    referencias: [
      { titulo: "Gaceta Municipal de Mairana", url: "/" },
      { titulo: "Normativa Municipal", url: "/normativa" },
      { titulo: "Trámites", url: "/tramites" },
    ],
  },
  normativa: {
    respuesta:
      "La normativa municipal de Mairana está disponible en nuestra sección de Normativa. Puedes consultar Leyes Municipales, Decretos, Resoluciones, Ordenanzas y Acuerdos. Utiliza el buscador para filtrar por categoría o estado.",
    referencias: [
      { titulo: "Normativa Municipal", url: "/normativa" },
      { titulo: "Categorías de Normativa", url: "/normativa?categoria=ordenanza" },
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

function detectarIntencion(pregunta: string): string {
  const p = pregunta.toLowerCase()
  if (
    p.includes("normativa") ||
    p.includes("ley") ||
    p.includes("decreto") ||
    p.includes("ordenanza") ||
    p.includes("resolución") ||
    p.includes("acuerdo")
  )
    return "normativa"
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
    p.includes("auditoría") ||
    p.includes("poa") ||
    p.includes("pei")
  )
    return "transparencia"
  return "predeterminada"
}

export async function POST(request: Request) {
  try {
    const { pregunta } = await request.json()

    if (!pregunta || typeof pregunta !== "string") {
      return NextResponse.json({ error: "El campo 'pregunta' es requerido" }, { status: 400 })
    }

    const intencion = detectarIntencion(pregunta)
    const resultado = respuestas[intencion] || respuestas.predeterminada

    return NextResponse.json(resultado)
  } catch {
    return NextResponse.json({ error: "Error al procesar la consulta" }, { status: 500 })
  }
}
