"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn, formatDate } from "@/lib/utils"
import { FileText, Newspaper, Users, ArrowRight, PlusCircle, BarChart3, Eye, Image as ImageIcon, ScrollText, BadgeCheck, PieChart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/toast"
import { createClient } from "@/lib/supabase/client"
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
  { label: "Nueva Normativa", href: "/admin/normativa/nueva", icon: FileText, variant: "default" as const },
  { label: "Nueva Noticia", href: "/admin/noticias/nueva", icon: Newspaper, variant: "outline" as const },
  { label: "Nueva Autoridad", href: "/admin/autoridades/nueva", icon: Users, variant: "outline" as const },
]

interface ActivityItem {
  action: string
  item: string
  time: string
  type: string
}

export default function AdminDashboardPage() {
  const { addToast } = useToast()
  const supabase = createClient()

  const [stats, setStats] = useState<Stats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [estadoData, setEstadoData] = useState<{ estado: string; cantidad: number }[]>([])
  const [currentDate] = useState(() => {
    return new Date().toLocaleDateString("es-BO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  })

  useEffect(() => {
    const load = async () => {
      const [normativa, noticias, usuarios, autoridades, galeria, tramites, visitas] = await Promise.all([
        supabase.from("normativa").select("id", { count: "exact", head: true }),
        supabase.from("noticias").select("id", { count: "exact", head: true }),
        supabase.from("usuarios").select("id", { count: "exact", head: true }),
        supabase.from("autoridades").select("id", { count: "exact", head: true }),
        supabase.from("galeria").select("id", { count: "exact", head: true }),
        supabase.from("tramites").select("id", { count: "exact", head: true }),
        supabase.from("normativa").select("visitas").limit(100),
      ])

      const errores = [normativa, noticias, usuarios, autoridades, galeria, tramites].filter((r) => r.error)
      if (errores.length > 0) {
        addToast(errores[0].error?.message || "Error al cargar estadísticas", "error")
        return
      }

      const totalVisitas = (visitas.data || []).reduce((acc: number, n: { visitas: number }) => acc + (n.visitas || 0), 0)

      setStats({
        normativas: normativa.count || 0,
        noticias: noticias.count || 0,
        usuarios: usuarios.count || 0,
        autoridades: autoridades.count || 0,
        galeria: galeria.count || 0,
        tramites: tramites.count || 0,
        visitas: totalVisitas,
      })

      const [ultimasNoticias, ultimasNormativas] = await Promise.all([
        supabase.from("noticias").select("titulo,updated_at,created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("normativa").select("titulo,updated_at,created_at").order("created_at", { ascending: false }).limit(3),
      ])

      const items: ActivityItem[] = [
        ...(ultimasNoticias.data || []).map((n) => ({
          action: "Noticia",
          item: n.titulo,
          time: formatDate(n.updated_at || n.created_at, "full"),
          type: "noticia",
        })),
        ...(ultimasNormativas.data || []).map((n) => ({
          action: "Normativa",
          item: n.titulo,
          time: formatDate(n.updated_at || n.created_at, "full"),
          type: "normativa",
        })),
      ]
      setActivity(items.sort((a, b) => (a.time < b.time ? 1 : -1)).slice(0, 6))

      const { data: estados } = await supabase.from("normativa").select("estado").limit(1000)
      if (!estados) return
      const counts = new Map<string, number>()
      estados.forEach((e) => counts.set(e.estado, (counts.get(e.estado) || 0) + 1))
      const sorted = Array.from(counts.entries())
        .map(([estado, cantidad]) => ({ estado: ESTADO_LABEL[estado] || estado, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
      setEstadoData(sorted)
    }
    load()
  }, [supabase, addToast])

  const kpiCards = stats
    ? [
        { icon: FileText, label: "Normativas", value: String(stats.normativas), bg: "bg-primary", desc: "Documentos publicados" },
        { icon: Newspaper, label: "Noticias", value: String(stats.noticias), bg: "bg-blue-500", desc: "Artículos publicados" },
        { icon: Users, label: "Usuarios", value: String(stats.usuarios), bg: "bg-green-500", desc: "Cuentas del panel" },
        { icon: Eye, label: "Visitas totales", value: String(stats.visitas), bg: "bg-purple-500", desc: "Lecturas de normativa" },
      ]
    : []

  const typeColors: Record<string, string> = {
    normativa: "bg-primary/10 text-primary-foreground",
    noticia: "bg-blue-100 text-blue-700",
    autoridad: "bg-green-100 text-green-700",
    transparencia: "bg-purple-100 text-purple-700",
    tramite: "bg-rose-100 text-rose-700",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Bienvenido al Panel de Administración</h1>
        <p className="mt-1 text-muted-foreground capitalize">{currentDate}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats ? kpiCards.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl text-white", kpi.bg)}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-bold text-foreground">{kpi.value}</span>
                </div>
                <p className="mt-3 font-medium text-foreground">{kpi.label}</p>
                <p className="text-sm text-muted-foreground">{kpi.desc}</p>
              </CardContent>
            </Card>
          )
        }) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
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
        <div className="lg:col-span-2 space-y-6">
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
                    <div key={i} className="flex items-start gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50">
                      <div className="flex h-2 w-2 mt-2 shrink-0 rounded-full bg-primary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{item.action}</p>
                        <p className="text-sm text-muted-foreground truncate">{item.item}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium uppercase", typeColors[item.type])}>
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => {
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-primary" />
                Accesos Rápidos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Galería", href: "/admin/galeria" },
                { label: "Trámites", href: "/admin/tramites" },
                { label: "Transparencia", href: "/admin/transparencia" },
                { label: "Usuarios", href: "/admin/usuarios" },
                { label: "Configuración", href: "/admin/configuracion" },
              ].map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                    {link.label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
