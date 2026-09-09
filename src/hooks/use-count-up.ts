import { useEffect, useState, useRef } from "react"

export function useCountUp(end: number, duration: number = 1200) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const currentRef = ref.current
    if (!currentRef || hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.unobserve(currentRef)
          
          let startTimestamp: number | null = null
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp
            const progress = Math.min((timestamp - startTimestamp) / duration, 1)
            // easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
            setCount(Math.floor(easeProgress * end))
            if (progress < 1) {
              window.requestAnimationFrame(step)
            }
          }
          window.requestAnimationFrame(step)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(currentRef)
    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return { count, ref }
}
