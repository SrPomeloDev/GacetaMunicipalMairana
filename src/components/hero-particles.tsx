type DotTone = "bright" | "amber" | "deep" | "spark"

interface Dot {
  left: string
  top: string
  size: number
  duration: string
  delay: string
  opacity: number
  reverse?: boolean
  tone?: DotTone
}

const DOTS: Dot[] = [
  { left: "2%", top: "28%", size: 8, duration: "12s", delay: "0.4s", opacity: 0.9, reverse: true },
  { left: "4%", top: "20%", size: 9, duration: "11s", delay: "0s", opacity: 0.95 },
  { left: "6%", top: "62%", size: 5, duration: "14s", delay: "1s", opacity: 0.75 },
  { left: "9%", top: "72%", size: 7, duration: "13s", delay: "1.4s", opacity: 0.85, reverse: true },
  { left: "11%", top: "44%", size: 4, duration: "10s", delay: "0.2s", opacity: 0.9, tone: "spark" },
  { left: "14%", top: "36%", size: 9, duration: "10s", delay: "2.2s", opacity: 0.8, tone: "deep" },
  { left: "17%", top: "40%", size: 10, duration: "10s", delay: "0.6s", opacity: 0.9 },
  { left: "20%", top: "78%", size: 5, duration: "15s", delay: "0.8s", opacity: 0.7, reverse: true },
  { left: "23%", top: "18%", size: 6, duration: "12s", delay: "1.5s", opacity: 0.85, tone: "amber" },
  { left: "25%", top: "84%", size: 7, duration: "14s", delay: "2.1s", opacity: 0.75, tone: "deep" },
  { left: "28%", top: "58%", size: 4, duration: "11s", delay: "0.1s", opacity: 0.9, tone: "spark" },
  { left: "30%", top: "12%", size: 8, duration: "12s", delay: "1.3s", opacity: 0.85 },
  { left: "33%", top: "16%", size: 8, duration: "12s", delay: "0.3s", opacity: 0.9, reverse: true },
  { left: "36%", top: "66%", size: 6, duration: "13s", delay: "2s", opacity: 0.8, tone: "amber" },
  { left: "39%", top: "44%", size: 5, duration: "13s", delay: "2.7s", opacity: 0.75 },
  { left: "42%", top: "30%", size: 4, duration: "10s", delay: "0.7s", opacity: 0.9, tone: "spark" },
  { left: "44%", top: "58%", size: 9, duration: "11s", delay: "1.8s", opacity: 0.85 },
  { left: "47%", top: "88%", size: 6, duration: "16s", delay: "0.5s", opacity: 0.7, reverse: true },
  { left: "50%", top: "24%", size: 7, duration: "12s", delay: "1.2s", opacity: 0.85, tone: "amber" },
  { left: "52%", top: "82%", size: 6, duration: "15s", delay: "2.6s", opacity: 0.7, tone: "deep" },
  { left: "55%", top: "52%", size: 4, duration: "11s", delay: "0.9s", opacity: 0.9, tone: "spark" },
  { left: "57%", top: "36%", size: 5, duration: "12s", delay: "1.9s", opacity: 0.75 },
  { left: "59%", top: "28%", size: 10, duration: "10s", delay: "0.9s", opacity: 0.9, reverse: true },
  { left: "62%", top: "70%", size: 5, duration: "12s", delay: "2.5s", opacity: 0.9, tone: "spark" },
  { left: "63%", top: "76%", size: 7, duration: "14s", delay: "0.7s", opacity: 0.75, tone: "deep" },
  { left: "66%", top: "40%", size: 8, duration: "11s", delay: "1.6s", opacity: 0.85, tone: "amber" },
  { left: "68%", top: "68%", size: 8, duration: "13s", delay: "1.1s", opacity: 0.85 },
  { left: "71%", top: "48%", size: 5, duration: "11s", delay: "2.4s", opacity: 0.8, reverse: true },
  { left: "73%", top: "22%", size: 6, duration: "12s", delay: "2.3s", opacity: 0.85, reverse: true },
  { left: "75%", top: "60%", size: 4, duration: "10s", delay: "0.4s", opacity: 0.9, tone: "spark" },
  { left: "78%", top: "34%", size: 9, duration: "11s", delay: "1s", opacity: 0.9, tone: "amber" },
  { left: "80%", top: "64%", size: 8, duration: "13s", delay: "1.6s", opacity: 0.8, tone: "deep" },
  { left: "82%", top: "50%", size: 9, duration: "11s", delay: "0.2s", opacity: 0.9 },
  { left: "85%", top: "26%", size: 5, duration: "12s", delay: "2.8s", opacity: 0.85, tone: "spark" },
  { left: "87%", top: "76%", size: 7, duration: "14s", delay: "1.7s", opacity: 0.75, tone: "deep" },
  { left: "90%", top: "46%", size: 8, duration: "12s", delay: "0.6s", opacity: 0.9 },
  { left: "93%", top: "34%", size: 8, duration: "12s", delay: "2.9s", opacity: 0.85, reverse: true },
  { left: "95%", top: "62%", size: 5, duration: "13s", delay: "1.4s", opacity: 0.8, tone: "amber" },
  { left: "30%", top: "55%", size: 6, duration: "13s", delay: "3.2s", opacity: 0.7 },
  { left: "48%", top: "66%", size: 5, duration: "12s", delay: "3.5s", opacity: 0.75, tone: "spark" },
]

const TONE_STYLE: Record<DotTone, { bg: string; glow: string }> = {
  bright: { bg: "#f97316", glow: "0 0 10px 3px rgba(249, 115, 22, 0.45)" },
  amber: { bg: "#fbbf24", glow: "0 0 10px 3px rgba(251, 191, 36, 0.45)" },
  deep: { bg: "#c2410c", glow: "0 0 10px 3px rgba(194, 65, 12, 0.4)" },
  spark: { bg: "#ffffff", glow: "0 0 9px 3px rgba(255, 255, 255, 0.55)" },
}

export function HeroParticles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {DOTS.map((dot, i) => {
        const tone = TONE_STYLE[dot.tone ?? "bright"]
        return (
          <span
            key={i}
            className="absolute rounded-full motion-safe:animate-[float_ease-in-out_infinite]"
            style={{
              left: dot.left,
              top: dot.top,
              width: dot.size * 0.7,
              height: dot.size * 0.7,
              opacity: dot.opacity * 0.7,
              animationDuration: dot.duration,
              animationDelay: dot.delay,
              animationDirection: dot.reverse ? "reverse" : "normal",
              backgroundColor: tone.bg,
              boxShadow: tone.glow,
            }}
          />
        )
      })}
    </div>
  )
}
