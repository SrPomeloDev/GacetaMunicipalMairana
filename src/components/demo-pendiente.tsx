import { Lock, Mail, Phone } from "lucide-react";
import { DEV_CREDIT, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function DemoPendiente() {
  return (
    <div className="fixed inset-0 z-[9999] flex min-h-dvh w-full items-center justify-center overflow-y-auto bg-slate-950 p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,88,12,0.12),transparent_60%)]" />
      <div className="relative w-full max-w-2xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
          <div className="bg-primary px-6 py-5 text-center sm:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/80">
              Versión de demostración
            </p>
            <h1 className="mt-1 font-serif text-2xl font-extrabold text-primary-foreground sm:text-3xl">
              Prueba Demo Finalizada
            </h1>
          </div>

          <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
            <img
              src="/images/escudo-mairana.jpg"
              alt="Escudo de Mairana"
              className="mx-auto mb-6 h-24 w-24 rounded-2xl border border-gray-100 bg-white object-contain p-1.5 shadow-sm sm:h-28 sm:w-28"
            />

            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
              <Lock className="h-3.5 w-3.5" />
              Plataforma bloqueada temporalmente
            </div>

            <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              El período de prueba de{" "}
              <span className="font-semibold text-slate-900">{SITE_NAME}</span> ha
              finalizado. Para desbloquear el sitio completo y continuar con la
              entrega, contacta al desarrollador:
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <a
                href={DEV_CREDIT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                )}
              >
                <Phone className="h-4 w-4" />
                WhatsApp {DEV_CREDIT.telefono}
              </a>
              <a
                href={`mailto:${DEV_CREDIT.email}`}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
                )}
              >
                <Mail className="h-4 w-4" />
                {DEV_CREDIT.email}
              </a>
            </div>

            <div className="mt-8 border-t border-dashed border-slate-200 pt-6">
              <p className="text-xs text-slate-400">
                Desarrollado por <span className="font-semibold text-slate-600">{DEV_CREDIT.nombre}</span> — {DEV_CREDIT.rol} • CI {DEV_CREDIT.ci}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Esta pantalla se desactiva automáticamente tras la entrega/liberación del sistema.
        </p>
      </div>
    </div>
  );
}