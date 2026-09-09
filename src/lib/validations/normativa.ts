import { z } from "zod"

const emptyToNull = (v: unknown) => (v === "" ? null : v)

const nullableString = z.preprocess(emptyToNull, z.string().nullable().optional())

const nullableId = z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional())

const nullableDate = z.preprocess(emptyToNull, z.string().nullable().optional())

const nullablePdf = z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional())

const numeroPaginas = z.preprocess((v: unknown) => {
  if (v === undefined) return undefined
  if (v === "") return null
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isNaN(n) ? v : n
  }
  return v
}, z.number().int().positive().nullable().optional())

export const normativaEstado = z.enum(["vigente", "derogada", "modificada", "suspendida", "abrogada"])

export const normativaInsertSchema = z.object({
  numero: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  titulo: z.string().trim().min(1),
  resumen: nullableString,
  contenido_texto: nullableString,
  categoria_id: nullableId,
  dependencia_id: nullableId,
  estado: normativaEstado.optional(),
  fecha_aprobacion: nullableDate,
  fecha_publicacion: nullableDate,
  fecha_vigencia: nullableDate,
  numero_paginas: numeroPaginas,
  archivo_pdf: nullablePdf,
  publicada: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
})

export const normativaUpdateSchema = normativaInsertSchema.partial()

export type NormativaInsertInput = z.infer<typeof normativaInsertSchema>
export type NormativaUpdateInput = z.infer<typeof normativaUpdateSchema>
