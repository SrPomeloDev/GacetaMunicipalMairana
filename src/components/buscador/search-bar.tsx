"use client"

import { useState } from "react"
import { SearchInput } from "@/components/ui/search-input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, X, SlidersHorizontal, Search, RotateCcw } from "lucide-react"

export interface SearchFilters {
  q: string
  categoria: string
  estado: string
  fecha_desde: string
  fecha_hasta: string
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void
}

const defaultFilters: SearchFilters = {
  q: "",
  categoria: "",
  estado: "",
  fecha_desde: "",
  fecha_hasta: "",
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)

  const activeFilterCount = Object.entries(filters).filter(([_, v]) => Boolean(v)).length

  const handleChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    setFilters(defaultFilters)
    onSearch(defaultFilters)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput
            value={filters.q}
            onChange={(v) => handleChange("q", v)}
            onClear={() => handleChange("q", "")}
            placeholder="Buscar por Ley, palabra clave, temática o número de norma..."
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button onClick={handleSearch} className="gap-1.5 font-bold shadow-xs">
          <Search className="h-4 w-4" />
          <span>Buscar</span>
        </Button>
        <Button
          variant={showAdvanced ? "default" : "outline"}
          size="icon"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="relative shrink-0"
          title="Filtros Avanzados"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[10px] font-bold text-white shadow-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl border border-primary/20 bg-card/90 backdrop-blur-xl shadow-lg animate-in fade-in duration-200">
          <Select
            label="Tipo de Normativa"
            placeholder="Todas las categorías"
            value={filters.categoria}
            onChange={(e) => handleChange("categoria", e.target.value)}
            options={[
              { value: "ley", label: "Ley Autonómica Municipal" },
              { value: "decreto", label: "Decreto Edil" },
              { value: "resolucion", label: "Resolución del Concejo" },
              { value: "ordenanza", label: "Ordenanza Municipal" },
              { value: "convocatoria", label: "Licitaciones & ANPE" },
            ]}
          />
          <Select
            label="Estado Jurídico"
            placeholder="Todos los estados"
            value={filters.estado}
            onChange={(e) => handleChange("estado", e.target.value)}
            options={[
              { value: "vigente", label: "Vigente (En aplicación)" },
              { value: "modificada", label: "Modificada" },
              { value: "derogada", label: "Derogada" },
              { value: "suspendida", label: "Suspendida" },
              { value: "abrogada", label: "Abrogada" },
            ]}
          />
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Promulgada Desde</label>
            <Input
              type="date"
              value={filters.fecha_desde}
              onChange={(e) => handleChange("fecha_desde", e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground">Promulgada Hasta</label>
            <Input
              type="date"
              value={filters.fecha_hasta}
              onChange={(e) => handleChange("fecha_hasta", e.target.value)}
              className="text-xs"
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {activeFilterCount > 0 ? `${activeFilterCount} filtros aplicados` : "Sin filtros aplicados"}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                <RotateCcw className="h-3.5 w-3.5" />
                Limpiar Filtros
              </Button>
              <Button size="sm" onClick={handleSearch} className="text-xs font-bold gap-1">
                <Search className="h-3.5 w-3.5" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

