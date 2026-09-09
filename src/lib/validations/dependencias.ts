import { z } from "zod"

const emptyToNull = (v: unknown) => (v === "" ? null : v)
const emptyToUndefined = (v: unknown) => (v === "" || v === null ? undefined : v)

const nullableText = z.preprocess(emptyToNull, z.string().nullable().optional())

const ordenField = z.coerce.number().int().min(0).optional()

export const dependenciaTipo = z.enum(["ejecutivo", "legislativo", "administrativo"])

export const dependenciaInsertSchema = z.object({
  nombre: z.string().trim().min(1),
  slug: z.preprocess(emptyToUndefined, z.string().trim().min(1).optional()),
  tipo: dependenciaTipo,
  descripcion: nullableText,
  telefono: nullableText,
  correo: nullableText,
  horario: nullableText,
  orden: ordenField,
})

export const dependenciaUpdateSchema = dependenciaInsertSchema.partial()

export type DependenciaInsertInput = z.infer<typeof dependenciaInsertSchema>
export type DependenciaUpdateInput = z.infer<typeof dependenciaUpdateSchema>
