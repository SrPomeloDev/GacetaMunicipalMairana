"use client"

import { useCountUp } from "@/hooks/use-count-up"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
}

export function AnimatedCounter({ value, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const { count, ref } = useCountUp(value, 1500)

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {prefix}
      {count.toLocaleString("es-BO")}
      {suffix}
    </span>
  )
}
