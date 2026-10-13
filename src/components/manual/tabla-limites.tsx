import { BUCKETS, STORAGE_QUOTA_BYTES, STORAGE_AVISO_BYTES, formatearMB } from "@/lib/storage-limits"

export function TablaLimites() {
  const bucketsArray = [
    { id: "Fotos de noticias", config: BUCKETS["noticias-imagenes"], uso: "Noticias, foto de autoridades y foto del alcalde" },
    { id: "Fotos de galería", config: BUCKETS["galeria"], uso: "Álbumes de eventos y obras públicas" },
    { id: "PDF de normativa", config: BUCKETS["normativa-pdf"], uso: "Leyes, decretos, ordenanzas y resoluciones escaneadas" },
    { id: "Documentos", config: BUCKETS["documentos"], uso: "Actas de concejo, rendición de cuentas, trámites y contrataciones" },
  ]

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3.5">Tipo de archivo</th>
                <th className="px-4 py-3.5">Tamaño máximo</th>
                <th className="px-4 py-3.5">Formatos</th>
                <th className="px-4 py-3.5">Optimización automática</th>
                <th className="px-4 py-3.5">Dónde se usa</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-card-foreground">
            {bucketsArray.map((b) => (
              <tr key={b.id} className="transition-colors hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground text-xs">
                  {b.id}
                </td>
                <td className="px-4 py-3 font-medium">
                  {b.config.mb} MB ({formatearMB(b.config.bytes)})
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {b.config.mime === "image"
                    ? "JPG, PNG, WebP"
                    : b.config.mime === "pdf"
                    ? "PDF"
                    : "PDF, DOC, DOCX, XLS, XLSX"}
                </td>
                <td className="px-4 py-3">
                  {b.config.comprimir ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Sí, el portal las optimiza solas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      No, súbalos ya optimizados
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
            Espacio del portal
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-foreground">
            {formatearMB(STORAGE_QUOTA_BYTES)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Espacio total para todos los archivos del municipio. Si se llena, avise al encargado de sistemas.
          </p>
        </div>

        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-400">
            Aviso de poco espacio
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-yellow-800 dark:text-yellow-300">
            {formatearMB(STORAGE_AVISO_BYTES)}
          </p>
          <p className="mt-1 text-xs text-yellow-700/80 dark:text-yellow-400/80">
            Al acercarse al tope, el encargado de sistemas libera lugar eliminando archivos antiguos.
          </p>
        </div>
      </div>
    </div>
  )
}
