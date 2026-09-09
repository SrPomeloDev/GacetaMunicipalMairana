import { z } from "zod"

const emptyToNull = (v: unknown) => (v === "" ? null : v)

const nullableText = z.preprocess(emptyToNull, z.string().nullable().optional())

const nullablePdf = z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional())

const nullableDate = z.preprocess(emptyToNull, z.string().nullable().optional())

export const noticiaCategoria = z.enum(["institucional", "evento", "programa", "comunicado", "cultura"])

export const noticiaInsertSchema = z.object({
  titulo: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  resumen: nullableText,
  contenido: nullableText,
  categoria: noticiaCategoria.optional(),
  destacada: z.boolean().optional(),
  publicada: z.boolean().optional(),
  fecha_publicacion: nullableDate,
  imagen_principal: nullablePdf,
})

export const noticiaUpdateSchema = noticiaInsertSchema.partial()

export type NoticiaInsertInput = z.infer<typeof noticiaInsertSchema>
export type NoticiaUpdateInput = z.infer<typeof noticiaUpdateSchema>
