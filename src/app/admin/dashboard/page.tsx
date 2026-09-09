"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import { FileText, Newspaper, Users, ArrowRight, PlusCircle, BarChart3, Eye, Image as ImageIcon, ScrollText, BadgeCheck, PieChart, Inbox, Gavel, UserX } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
import { useCurrentUser, can, canView } from "@/hooks/use-current-user"
import type { Modulo } from "@/lib/roles"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts"

interface Stats {
  normativas: number
  noticias: number
  usuarios: number
  autoridades: number
  galeria: number
  tramites: number
  visitas: number
}

interface Pendientes {
  mensajes: number
  noticias: number
  normativa: number
  transparencia: number
  contrataciones: number
  usuarios: number
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(diff) || diff < 0) return "hace un momento"
  const min = Math.floor(diff / 60000)
  if (min < 1) return "hace un momento"
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `hace ${d} d`
  const m = Math.floor(d / 30)
  if (m < 12) return `hace ${m} me`
  return `hace ${Math.floor(m / 12)} a`
}

const ESTADO_COLORS: Record<string, string> = {
  vigente: "#16a34a",
  derogada: "#dc2626",
  modificada: "#ca8a04",
  suspendida: "#f97316",
  abrogada: "#64748b",
}

const ESTADO_LABEL: Record<string, string> = {
  vigente: "Vigente",
  derogada: "Derogada",
  modificada: "Modificada",
  suspendida: "Suspendida",
  abrogada: "Abrogada",
}

const quickActions = [
  { label: "Nueva Normativa", href: "/admin/normativa/nueva", icon: FileText, variant: "default" as const, modulo: "normativa" as Modulo },
  { label: "Nueva Noticia", href: "/admin/noticias/nueva", icon: Newspaper, variant: "outline" as const, modulo: "noticias" as Modulo },
  { label: "Nueva Autoridad", href: "/admin/autoridades/nueva", icon: Users, variant: "outline" as const, modulo: "autoridades" as Modulo },
]

const accesosRapidos = [
  { label: "Galería", href: "/admin/galeria", modulo: "galeria" as Modulo },
  { label: "Trámites", href: "/admin/tramites", modulo: "tramites" as Modulo },
  { label: "Transparencia", href: "/admin/transparencia", modulo: "transparencia" as Modulo },
  { label: "Usuarios", href: "/admin/usuarios", modulo: "usuarios" as Modulo },
  { label: "Configuración", href: "/admin/configuracion", modulo: "configuracion" as Modulo },
]

interface ActivityItem {
  action: string
  item: string
  time: string
  iso: string
  href: string
  type: string
}

export default function AdminDashboardPage() {
  const { addToast } = useToast()
  const supabase = createClient()
  const { user } = useCurrentUser()

  const [stats, setStats] = useState<Stats | null>(null)
  const [statsError, setStatsError] = useState(false)
  const [pendientes, setPendientes] = useState<Pendientes | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [estadoData, setEstadoData] = useState<{ estado: string; cantidad: number }[]>([])
  const [currentDate] = useState(() => {
    return new Date().toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  })

  const fetchStats = useCallback(async () => {
    const [normativa, noticias, usuarios, autoridades, galeria, tramites] = await Promise.all([
      supabase.from("normativa").select("id", { count: "exact", head: true }),
      supabase.from("noticias").select("id", { count: "exact", head: true }),
      supabase.from("usuarios").select("id", { count: "exact", head: true }),
      supabase.from("autoridades").select("id", { count: "exact", head: true }),
      supabase.from("galeria").select("id", { count: "exact", head: true }),
      supabase.from("tramites").select("id", { count: "exact", head: true }),
    ])

    const errores = [normativa, noticias, usuarios, autoridades, galeria, tramites].filter((r) => r.error)
    if (errores.length > 0) {
      setStatsError(true)
      addToast(errores[0].error?.message || "Error al cargar estadísticas", "error")
    } else {
      setStatsError(false)
      const totalFilas = normativa.count ?? 0
      let totalVisitas = 0
      if (totalFilas > 0) {
        const tamanoLote = 1000
        const numLotes = Math.ceil(totalFilas / tamanoLote)
        const lotes = await Promise.all(
          Array.from({ length: numLotes }, (_, i) =>
            supabase.from("normativa").select("visitas").range(i * tamanoLote, (i + 1) * tamanoLote - 1)
          )
        )
        totalVisitas = lotes.reduce(
          (acc, r) => acc + (r.data || []).reduce((a, n) => a + (n.visitas || 0), 0),
          0
        )
      }
      setStats({
        normativas: normativa.count || 0,
        noticias: noticias.count || 0,
        usuarios: usuarios.count || 0,
        autoridades: autoridades.count || 0,
        galeria: galeria.count || 0,
        tramites: tramites.count || 0,
        visitas: totalVisitas,
      })
    }

    const [mensajesPend, noticiasPend, normativaPend, transparenciaPend, contratacionesPend, usuariosPend] = await Promise.all([
      supabase.from("contacto_mensajes").select("id", { count: "exact", head: true }).eq("leido", false),
      supabase.from("noticias").select("id", { count: "exact", head: true }).eq("publicada", false),
      supabase.from("normativa").select("id", { count: "exact", head: true }).eq("publicada", false),
      supabase.from("transparencia").select("id", { count: "exact", head: true }).eq("publicada", false),
      supabase.from("contrataciones").select("id", { count: "exact", head: true }).eq("estado", "publicada"),
      supabase.from("usuarios").select("id", { count: "exact", head: true }).eq("activo", false),
    ])
    setPendientes({
      mensajes: mensajesPend.error ? 0 : mensajesPend.count ?? 0,
      noticias: noticiasPend.error ? 0 : noticiasPend.count ?? 0,
      normativa: normativaPend.error ? 0 : normativaPend.count ?? 0,
      transparencia: transparenciaPend.error ? 0 : transparenciaPend.count ?? 0,
      contrataciones: contratacionesPend.error ? 0 : contratacionesPend.count ?? 0,
      usuarios: usuariosPend.error ? 0 : usuariosPend.count ?? 0,
    })

    const [ultimasNoticias, ultimasNormativas, ultimosMensajes] = await Promise.all([
      supabase.from("noticias").select("id,titulo,updated_at,created_at").order("created_at", { ascending: false }).limit(3),
      supabase.from("normativa").select("id,titulo,updated_at,created_at").order("created_at", { ascending: false }).limit(3),
      supabase.from("contacto_mensajes").select("id,nombre,asunto,mensaje,created_at").eq("leido", false).order("created_at", { ascending: false }).limit(3),
    ])

    const items: ActivityItem[] = [
      ...(ultimasNoticias.data || []).map((n) => {
        const iso = n.updated_at || n.created_at
        return {
          action: "Noticia",
          item: n.titulo,
          time: timeAgo(iso),
          iso,
          href: `/admin/noticias/${n.id}`,
          type: "noticia",
        }
      }),
      ...(ultimasNormativas.data || []).map((n) => {
        const iso = n.updated_at || n.created_at
        return {
          action: "Normativa",
          item: n.titulo,
          time: timeAgo(iso),
          iso,
          href: `/admin/normativa/${n.id}`,
          type: "normativa",
        }
      }),
      ...(ultimosMensajes.data || []).map((m) => {
        const iso = m.created_at
        return {
          action: "Mensaje",
          item: m.asunto || (m.mensaje || "").slice(0, 80),
          time: timeAgo(iso),
          iso,
          href: "/admin/mensajes",
          type: "mensaje",
        }
      }),
    ]
    setActivity(items.sort((a, b) => new Date(b.iso).getTime() - new Date(a.iso).getTime()).slice(0, 6))

    const { data: estados } = await supabase.from("normativa").select("estado").limit(1000)
    if (!estados) return
    const counts = new Map<string, number>()
    estados.forEach((e) => counts.set(e.estado, (counts.get(e.estado) || 0) + 1))
    const sorted = Array.from(counts.entries())
      .map(([estado, cantidad]) => ({ estado: ESTADO_LABEL[estado] || estado, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
    setEstadoData(sorted)
  }, [supabase, addToast])

  useEffect(() => {
    // fetchStats es async: los setState ocurren tras await, nunca sincrónicamente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats()
  }, [fetchStats])

  const kpiCards = stats
    ? [
        { icon: FileText, label: "Normativas", value: String(stats.normativas), bg: "bg-primary", desc: "Documentos publicados" },
        { icon: Newspaper, label: "Noticias", value: String(stats.noticias), bg: "bg-blue-500", desc: "Artículos publicados" },
        { icon: Users, label: "Usuarios", value: String(stats.usuarios), bg: "bg-green-500", desc: "Cuentas del panel" },
        { icon: Eye, label: "Visitas totales", value: String(stats.visitas), bg: "bg-purple-500", desc: "Lecturas de normativa" },
      ]
    : []

  const pendientesItems = [
    { key: "mensajes", label: "Mensajes sin leer", desc: "Revisar bandeja", value: pendientes?.mensajes ?? 0, href: "/admin/mensajes?no_leidos=true", icon: Inbox, bg: "bg-amber-500" },
    { key: "noticias", label: "Noticias sin publicar", desc: "Borradores pendientes", value: pendientes?.noticias ?? 0, href: "/admin/noticias?publicada=false", icon: Newspaper, bg: "bg-blue-500" },
    { key: "normativa", label: "Normativas sin publicar", desc: "Borradores pendientes", value: pendientes?.normativa ?? 0, href: "/admin/normativa?publicada=false", icon: FileText, bg: "bg-orange-600" },
    { key: "transparencia", label: "Transparencia sin publicar", desc: "Documentos pendientes", value: pendientes?.transparencia ?? 0, href: "/admin/transparencia?publicada=false", icon: ScrollText, bg: "bg-purple-500" },
    { key: "contrataciones", label: "Contrataciones activas", desc: "Convocatorias publicadas", value: pendientes?.contrataciones ?? 0, href: "/admin/contrataciones?estado=publicada", icon: Gavel, bg: "bg-cyan-600" },
    { key: "usuarios", label: "Usuarios inactivos", desc: "Cuentas por revisar", value: pendientes?.usuarios ?? 0, href: "/admin/usuarios?activo=false", icon: UserX, bg: "bg-red-500" },
  ]

  const visibleQuickActions = quickActions.filter((a) => can(user, a.modulo, "crear"))
  const visibleAccesos = accesosRapidos.filter((l) => canView(user, l.modulo))

  const typeColors: Record<string, string> = {
    normativa: "bg-primary text-primary-foreground border border-primary",
    noticia: "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900",
    mensaje: "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
    autoridad: "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900",
    transparencia: "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-900",
    tramite: "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900",
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="heading-kicker">Panel de Control</span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Bienvenido al Panel de Administración</h1>
          <p className="mt-1 text-sm text-muted-foreground capitalize">{currentDate}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label}>
              <CardContent className="flex items-start justify-between gap-3 p-5">
                <div>
                  <p className="text-sm font-medium text-foreground">{kpi.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{kpi.desc}</p>
                </div>
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm", kpi.bg)}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
              <div className="flex items-end justify-between border-t border-border/50 bg-muted/30 px-5 py-3">
                <span className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">{kpi.value}</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total registrado</span>
              </div>
            </Card>
          )
        }) : statsError ? (
          <Card className="sm:col-span-2 lg:col-span-4">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm font-medium text-foreground">Error al cargar estadísticas</p>
              <p className="text-sm text-muted-foreground">No se pudieron obtener los datos del panel. Intenta de nuevo.</p>
              <Button variant="outline" onClick={() => fetchStats()}>Reintentar</Button>
            </CardContent>
          </Card>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Pendientes</h2>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Requieren atención</span>
        </div>
        {pendientes ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendientesItems.map((p) => {
              const Icon = p.icon
              return (
                <Link key={p.key} href={p.href} className="group">
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm", p.bg)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">{p.value}</span>
                      </div>
                      <p className="mt-3 font-medium text-foreground">{p.label}</p>
                      <p className="text-sm text-muted-foreground">{p.desc} →</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/galeria" className="group">
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500 text-white">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">{stats?.galeria ?? "-"}</span>
              </div>
              <p className="mt-3 font-medium">Imágenes en galería</p>
              <p className="text-sm text-muted-foreground">Administrar galería →</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/tramites" className="group">
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500 text-white">
                  <ScrollText className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">{stats?.tramites ?? "-"}</span>
              </div>
              <p className="mt-3 font-medium">Trámites</p>
              <p className="text-sm text-muted-foreground">Administrar trámites →</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/autoridades" className="group">
          <Card className="transition-colors hover:border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white">
                  <BadgeCheck className="h-6 w-6" />
                </div>
                <span className="text-2xl font-bold">{stats?.autoridades ?? "-"}</span>
              </div>
              <p className="mt-3 font-medium">Autoridades</p>
              <p className="text-sm text-muted-foreground">Administrar autoridades →</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Normativas por Estado
            </CardTitle>
            <Link href="/admin/normativa" className="text-sm font-medium text-primary hover:underline">
              Ver normativa →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {estadoData.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No hay normativas registradas todavía.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadoData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="estado"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={{ stroke: "var(--border)" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)" }}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Bar dataKey="cantidad" name="Documentos" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {estadoData.map((entry) => (
                      <Cell key={entry.estado} fill={ESTADO_COLORS[entry.estado.toLowerCase()] || "#EA580C"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Actividad Reciente
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Aún no hay actividad. Crea tu primera noticia o normativa.
                </p>
              ) : (
                <div className="space-y-1">
                  {activity.map((item, i) => (
                    <Link key={`${item.href}-${item.iso}-${i}`} href={item.href} className="flex items-start gap-4 rounded-xl border border-transparent p-3 transition-colors hover:border-border/60 hover:bg-muted/40">
                      <div className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary ring-1 ring-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{item.action}</p>
                        <p className="truncate text-sm text-muted-foreground">{item.item}</p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium uppercase", typeColors[item.type])}>
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground" title={formatDate(item.iso, "full")}>{item.time}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-6">
          {visibleQuickActions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleQuickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <Button variant={action.variant} className="w-full justify-start">
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
          )}

          {visibleAccesos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Accesos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleAccesos.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  )
}
