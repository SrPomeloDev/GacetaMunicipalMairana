import type { ReactNode } from "react"

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  once?: boolean
}

export function Reveal({ children, className }: RevealProps) {
  if (!className) return <>{children}</>
  return <div className={className}>{children}</div>
}
