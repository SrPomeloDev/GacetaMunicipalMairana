"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageNumbers(currentPage: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = []

  if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push("...")
    pages.push(totalPages)
  } else if (currentPage >= totalPages - 3) {
    pages.push(1)
    pages.push("...")
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    pages.push("...")
    for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
    pages.push("...")
    pages.push(totalPages)
  }

  return pages
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ currentPage, totalPages, onPageChange, className }, ref) => {
    const pages = getPageNumbers(currentPage, totalPages)

    if (totalPages <= 1) return null

    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
      >
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-sm text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                page === currentPage
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    )
  }
)
Pagination.displayName = "Pagination"

export { Pagination }
