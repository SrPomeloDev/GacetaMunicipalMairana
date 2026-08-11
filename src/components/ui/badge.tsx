"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "border-border text-foreground",
        success: "border-transparent bg-green-600 text-white hover:bg-green-600/80",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-500/80",
        "soft-primary": "border-primary/20 bg-primary/10 text-primary",
        "soft-success": "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        "soft-destructive": "border-red-500/25 bg-red-500/10 text-red-600 dark:text-red-400",
        "soft-warning": "border-yellow-500/25 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        "soft-neutral": "border-border bg-muted/60 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
