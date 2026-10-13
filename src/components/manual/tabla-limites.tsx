import { BUCKETS, STORAGE_QUOTA_BYTES, STORAGE_AVISO_BYTES, formatearMB } from "@/lib/storage-limits"

export function TablaLimites() {
  const bucketsArray = [
    { id: "noticias-imagenes", config: BUCKETS["noticias-imagenes"], uso: "Noticias, logos, fondo de portal y autoridades" },
    { id: "galeria", config: BUCKETS["galeria"], uso: "Álbumes fotográficos de eventos y obras públicas" },
    { id: "normativa-pdf", config: BUCKETS["normativa-pdf"], uso: "Leyes, decretos, ordenanzas y resoluciones escaneadas" },
    { id: "documentos", config: BUCKETS["documentos"], uso: "Actas de concejo, rendición de cuentas, trámites y DBC" },
  ]

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3.5">Bucket</th>
              <th className="px-4 py-3.5">Límite</th>
              <th className="px-4 py-3.5">Formatos Admitidos</th>
              <th className="px-4 py-3.5">Compresión WebP</th>
              <th className="px-4 py-3.5">Uso en el Sistema</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-card-foreground">
            {bucketsArray.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-mono font-medium text-primary text-xs">
                  {b.id}
                </td>
                <td className="px-4 py-3 font-medium">
                  {b.config.mb} MB ({formatearMB(b.config.bytes)})
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                  {b.config.mime === "image"
                    ? "JPG, PNG, WebP"
                    : b.config.mime === "pdf"
                    ? "PDF"
                    : "PDF, DOC, DOCX, XLS, XLSX"}
                </td>
                <td className="px-4 py-3">
                  {b.config.comprimir ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Automática (1600px)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      Sin compresión
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {b.uso}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Capacidad Global del Portal
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-foreground">
            {formatearMB(STORAGE_QUOTA_BYTES)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cuota global asignada en Supabase Storage para todos los archivos del municipio.
          </p>
        </div>

        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-400">
            Umbral de Alerta Preventiva
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            {formatearMB(STORAGE_AVISO_BYTES)}
          </p>
          <p className="mt-1 text-xs text-yellow-700/80 dark:text-yellow-400/80">
            Al alcanzar 150 MB se notifica a los administradores para depurar archivos antiguos.
          </p>
        </div>
      </div>
    </div>
  )
}
