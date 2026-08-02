import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PageCrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  crumbs?: PageCrumb[]
  children?: React.ReactNode
  className?: string
  icon?: React.ReactNode
}

export default function PageHeader({
  title,
  description,
  crumbs,
  children,
  className,
  icon,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden liquid-glass",
        className
      )}
    >
      <div className="absolute inset-0 bg-pattern-dots opacity-15" aria-hidden />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.06),transparent_70%)] dark:hidden" aria-hidden />
      <div className="absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(234,88,12,0.06),transparent_70%)] dark:hidden" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link href="/" className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors hover:text-primary hover:bg-primary/5">
              <Home className="h-3.5 w-3.5" />
              Inicio
            </Link>
            {crumbs.map((crumb) => (
              <span key={crumb.label} className="inline-flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />
                {crumb.href ? (
                  <Link href={crumb.href} className="rounded-md px-1.5 py-0.5 transition-colors hover:text-primary hover:bg-primary/5">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="flex items-center gap-3 font-serif text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {icon}
              {title}
            </h1>
            <div className="section-heading-line" />
            {description && (
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
            )}
          </div>
          {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
        </div>
      </div>
    </section>
  )
}
