import { z } from "zod"

const emptyToNull = (v: unknown) => (v === "" ? null : v)
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v)

const ordenField = z.coerce.number().int().min(0).optional()

export const categoriaInsertSchema = z.object({
  nombre: z.string().trim().min(1),
  slug: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  descripcion: z.preprocess(emptyToNull, z.string().nullable().optional()),
  color: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  icono: z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional()),
  orden: ordenField,
})

export const categoriaUpdateSchema = categoriaInsertSchema.partial()

export type CategoriaInsertInput = z.infer<typeof categoriaInsertSchema>
export type CategoriaUpdateInput = z.infer<typeof categoriaUpdateSchema>
