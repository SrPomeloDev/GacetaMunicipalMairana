"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Skeleton } from "./skeleton"

export interface Column<T = unknown> {
  key: string
  label: string
  // El valor llega indexado dinámicamente (row[key]); quien define la columna conoce su tipo real.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T = unknown> {
  columns: Column<T>[]
  data: T[]
  onSort?: (column: string) => void
  sortColumn?: string
  sortDirection?: "asc" | "desc"
  loading?: boolean
  className?: string
  emptyMessage?: string
  ref?: React.Ref<HTMLDivElement>
}

export function DataTable<T>({
  columns,
  data,
  onSort,
  sortColumn,
  sortDirection,
  loading,
  className,
  emptyMessage = "No se encontraron registros",
  ref,
}: DataTableProps<T>) {
  const renderSortIcon = (column: Column<T>) => {
    if (!column.sortable || !onSort) return null
    const isActive = sortColumn === column.key
    if (!isActive) return <ChevronUp className="ml-1 h-3.5 w-3.5 opacity-30" />
    return sortDirection === "asc" ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5" />
    )
  }

  const renderSkeletonRows = () => (
    <>
      {Array.from({ length: 5 }).map((_, rowIdx) => (
        <tr key={`skeleton-${rowIdx}`}>
          {columns.map((col) => (
            <td key={col.key} className="px-4 py-3">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )

  return (
    <div ref={ref} className={cn("w-full overflow-auto rounded-xl border border-border/60 shadow-sm", className)}>
      <table className="w-full min-w-[640px] caption-bottom text-sm">
        <thead>
          <tr className="border-b bg-muted/70 backdrop-blur-sm">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "h-11 px-4 text-left align-middle text-[11px] font-bold uppercase tracking-wider text-muted-foreground",
                  col.sortable && onSort && "cursor-pointer select-none hover:text-foreground",
                  col.className
                )}
                onClick={() => {
                  if (col.sortable && onSort) onSort(col.key)
                }}
              >
                <div className="inline-flex items-center">
                  {col.label}
                  {renderSortIcon(col)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeletonRows()
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-1 py-4">
                  <svg className="h-8 w-8 text-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="9" />
                    <line x1="3" y1="21" x2="9.5" y2="14.5" />
                  </svg>
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const rowRecord = row as Record<string, unknown>
              return (
                <tr
                  key={(rowRecord.id as string | undefined) ?? rowIdx}
                  className="border-b border-border/60 last:border-0 transition-colors hover:bg-accent/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 align-middle", col.className)}>
                      {col.render
                        ? col.render(rowRecord[col.key], row)
                        : ((rowRecord[col.key] ?? "-") as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

DataTable.displayName = "DataTable"
