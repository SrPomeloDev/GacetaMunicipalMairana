import { z } from "zod"

const emptyToNull = (v: unknown) => (v === "" ? null : v)

const dependenciaId = z.preprocess(emptyToNull, z.string().trim().min(1).nullable().optional())

export const usuarioRol = z.enum(["admin", "editor", "publicador"])

export const usuarioCrearSchema = z.object({
  nombre: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  rol: usuarioRol,
  dependencia_id: dependenciaId,
  activo: z.boolean().optional(),
})

export const usuarioEditarSchema = z.object({
  nombre: z.string().trim().min(1).optional(),
  rol: usuarioRol.optional(),
  dependencia_id: dependenciaId,
  activo: z.boolean().optional(),
  permisos: z.record(z.array(z.string())).optional(),
  password: z.string().min(8).optional(),
})

export type UsuarioCrearInput = z.infer<typeof usuarioCrearSchema>
export type UsuarioEditarInput = z.infer<typeof usuarioEditarSchema>
