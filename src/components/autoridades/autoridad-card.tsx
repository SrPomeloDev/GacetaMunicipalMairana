"use client"

import { Card } from "@/components/ui/card"
import { Mail, Phone } from "lucide-react"

interface AutoridadCardProps {
  autoridad: {
    id: string
    nombre_completo: string
    cargo: string
    foto?: string | null
    tipo_autoridad: string
    correo?: string | null
    telefono?: string | null
    comisiones?: string[] | null
  }
}

export function AutoridadCard({ autoridad }: AutoridadCardProps) {
  const initials = autoridad.nombre_completo
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)

  return (
    <Card className="p-6 flex flex-col items-center text-center gap-3">
      {autoridad.foto ? (
        <img
          src={autoridad.foto}
          alt={autoridad.nombre_completo}
          className="h-24 w-24 rounded-full object-cover border-4 border-orange-200"
        />
      ) : autoridad.tipo_autoridad === "alcalde" ? (
        <img
          src="/images/AlcaldeMairana.png"
          alt={autoridad.nombre_completo}
          className="h-24 w-24 rounded-full object-cover border-4 border-orange-200"
        />
      ) : (
        <div className="h-24 w-24 rounded-full bg-orange-500 flex items-center justify-center border-4 border-orange-200">
          <span className="text-2xl font-bold text-white">{initials}</span>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-lg text-foreground">{autoridad.nombre_completo}</h3>
        <p className="text-sm text-muted-foreground">{autoridad.cargo}</p>
      </div>

      <div className="flex flex-col gap-1.5 w-full">
        {autoridad.correo && (
          <a
            href={`mailto:${autoridad.correo}`}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="h-4 w-4" />
            {autoridad.correo}
          </a>
        )}
        {autoridad.telefono && (
          <a
            href={`tel:${autoridad.telefono}`}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4" />
            {autoridad.telefono}
          </a>
        )}
      </div>

      {autoridad.comisiones && autoridad.comisiones.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5 mt-2">
          {autoridad.comisiones.map((comision) => (
            <span
              key={comision}
              className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full"
            >
              {comision}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
