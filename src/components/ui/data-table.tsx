"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronUp, ChevronDown, Search } from "lucide-react"
import { Skeleton } from "./skeleton"
import { Pagination } from "./pagination"

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
  ariaLabel?: string
  ref?: React.Ref<HTMLDivElement>
  pageSize?: number
  pageSizeOptions?: number[]
  dense?: boolean
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
  ariaLabel = "Tabla de registros",
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  dense,
  ref,
}: DataTableProps<T>) {
  const paginated = typeof pageSize === "number" && pageSize > 0
  const [page, setPage] = React.useState(1)
  const [pageSizeState, setPageSizeState] = React.useState(pageSize ?? 10)
  const effectivePageSize = paginated ? pageSize : null

  const [prevData, setPrevData] = React.useState(data)
  if (prevData !== data) {
    setPrevData(data)
    setPage(1)
  }

  const [prevPageSize, setPrevPageSize] = React.useState(effectivePageSize)
  if (prevPageSize !== effectivePageSize) {
    setPrevPageSize(effectivePageSize)
    if (effectivePageSize) {
      setPageSizeState(effectivePageSize)
    }
    setPage(1)
  }

  const totalItems = data.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSizeState))
  const currentPage = Math.min(page, totalPages)
  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSizeState + 1
  const rangeEnd = Math.min(currentPage * pageSizeState, totalItems)
  const visibleData = paginated
    ? data.slice((currentPage - 1) * pageSizeState, currentPage * pageSizeState)
    : data

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
            <td key={col.key} className={cn("px-4", dense ? "py-2" : "py-3")}>
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )

  const renderRows = (rows: T[]) => {
    return rows.map((row, rowIdx) => {
      const rowRecord = row as Record<string, unknown>
      return (
        <tr
          key={(rowRecord.id as string | undefined) ?? rowIdx}
          className="border-b border-border/60 last:border-0 transition-colors hover:bg-accent/50"
        >
          {columns.map((col) => (
            <td key={col.key} className={cn("px-4 align-middle", dense ? "py-2" : "py-3", col.className)}>
              {col.render
                ? col.render(rowRecord[col.key], row)
                : ((rowRecord[col.key] ?? "-") as React.ReactNode)}
            </td>
          ))}
        </tr>
      )
    })
  }

  const showFooter = !loading && paginated && data.length > 0

  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-x-auto rounded-xl border border-border/60 shadow-sm",
        paginated && "overflow-y-auto",
        paginated && "max-h-[28rem]",
        className
      )}
      aria-busy={loading}
    >
      <table className={cn("w-full min-w-[640px] caption-bottom text-sm", paginated && "relative")} aria-label={ariaLabel}>
        <thead className={cn("sticky top-0 z-10", paginated && "border-b border-border/60")}>
          <tr className="bg-muted/95 backdrop-blur-sm">
            {columns.map((col) => {
              const sortable = col.sortable && onSort
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    cn("h-11 px-4 text-left align-middle text-[11px] font-bold uppercase tracking-wider text-muted-foreground", dense && "h-10"),
                    col.className
                  )}
                  aria-sort={
                    sortColumn === col.key
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {sortable ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.key)}
                      className="inline-flex cursor-pointer items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground"
                    >
                      {col.label}
                      {renderSortIcon(col)}
                    </button>
                  ) : (
                    <div className="inline-flex items-center">{col.label}</div>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            renderSkeletonRows()
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-28 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-1 py-4">
                  <Search className="h-8 w-8 text-muted-foreground/40" aria-hidden />
                  {emptyMessage}
                </div>
              </td>
            </tr>
          ) : (
            renderRows(visibleData)
          )}
        </tbody>
      </table>

      {showFooter && (
        <div className="sticky bottom-0 flex flex-col gap-3 border-t border-border/60 bg-muted/95 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{rangeStart}–{rangeEnd}</span> de{" "}
            <span className="font-semibold text-foreground">{totalItems}</span> registros
          </p>
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="sr-only">Resultados por página</span>
              <select
                value={pageSizeState}
                onChange={(e) => {
                  setPageSizeState(Number(e.target.value))
                  setPage(1)
                }}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt} por página</option>
                ))}
              </select>
            </label>
            {totalPages > 1 && (
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

DataTable.displayName = "DataTable"