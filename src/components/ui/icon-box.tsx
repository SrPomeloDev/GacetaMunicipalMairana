import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconBoxVariants = cva(
  "flex shrink-0 items-center justify-center",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
      },
      tone: {
        primary: "bg-primary text-primary-foreground",
        muted: "bg-muted text-primary",
        destructive: "bg-destructive text-white",
      },
      shape: {
        rounded: "rounded-xl",
        full: "rounded-full",
      },
    },
    compoundVariants: [
      { size: "sm", shape: "rounded", className: "rounded-lg" },
      { size: "xl", shape: "rounded", className: "rounded-2xl" },
    ],
    defaultVariants: {
      size: "md",
      tone: "primary",
      shape: "rounded",
    },
  }
)

export interface IconBoxProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof iconBoxVariants> {}

const IconBox = React.forwardRef<HTMLDivElement, IconBoxProps>(
  ({ className, size, tone, shape, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(iconBoxVariants({ size, tone, shape }), className)}
        {...props}
      />
    )
  }
)
IconBox.displayName = "IconBox"

export { IconBox, iconBoxVariants }
