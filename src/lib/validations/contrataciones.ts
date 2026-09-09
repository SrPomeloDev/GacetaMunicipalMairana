import { z } from "zod"

const emptyToNull = (v: unknown) => (v === "" ? null : v)
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v)

const nullableText = z.preprocess(emptyToNull, z.string().nullable().optional())

const nullablePdf = z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional())

const nullableDate = z.preprocess(emptyToNull, z.string().nullable().optional())

const montoField = z.preprocess((v: unknown) => {
  if (v === undefined) return undefined
  if (v === "") return null
  if (typeof v === "string") {
    const n = Number(v)
    return Number.isNaN(n) ? v : n
  }
  return v
}, z.number().min(0).nullable().optional())

export const contratacionTipo = z.enum(["licitacion", "apoyo_nacional", "compras_menores", "contratacion_directa", "emergencia"])

export const contratacionEstado = z.enum(["borrador", "publicada", "adjudicada", "desierta", "concluida"])

export const contratacionInsertSchema = z.object({
  titulo: z.string().trim().min(1),
  slug: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  tipo: contratacionTipo,
  modalidad: nullableText,
  objeto: nullableText,
  monto: montoField,
  empresa_adjudicada: nullableText,
  fecha_publicacion: nullableDate,
  fecha_presentacion: nullableDate,
  fecha_adjudicacion: nullableDate,
  archivo_pdf: nullablePdf,
  estado: contratacionEstado.optional(),
  publicada: z.boolean().optional(),
})

export const contratacionUpdateSchema = contratacionInsertSchema.partial()

export type ContratacionInsertInput = z.infer<typeof contratacionInsertSchema>
export type ContratacionUpdateInput = z.infer<typeof contratacionUpdateSchema>
