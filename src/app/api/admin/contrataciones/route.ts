import { NextResponse } from "next/server"
import { requireVerModulo, requirePermiso, type PermisosUsuario } from "@/lib/permisos-server"
import { createAdminClient } from "@/lib/supabase/admin"
import { slugify } from "@/lib/utils"

export async function GET() {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requireVerModulo("contrataciones")
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data, error } = await permiso.supabase
    .from("contrataciones")
    .select("*")
    .order("fecha_publicacion", { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  let permiso: PermisosUsuario | null
  try {
    permiso = await requirePermiso("contrataciones", "crear")
  } catch {
    return NextResponse.json({ error: "No tienes permiso para crear contrataciones" }, { status: 403 })
  }
  if (!permiso) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const admin = createAdminClient()

  const slug = slugify(body.titulo || "contratacion")

  const { data, error } = await admin
    .from("contrataciones")
    .insert({
      titulo: body.titulo,
      slug,
      tipo: body.tipo,
      modalidad: body.modalidad || null,
      objeto: body.objeto || null,
      monto: body.monto ?? null,
      empresa_adjudicada: body.empresa_adjudicada || null,
      fecha_publicacion: body.fecha_publicacion,
      fecha_presentacion: body.fecha_presentacion || null,
      fecha_adjudicacion: body.fecha_adjudicacion || null,
      archivo_pdf: body.archivo_pdf || null,
      estado: body.estado || "publicada",
      publicada: body.publicada ?? true,
    } as never)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
