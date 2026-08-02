import { cn } from "@/lib/utils"

export function NoticiaPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-primary/5 to-amber-500/10",
        className
      )}
    >
      <div className="absolute inset-0 bg-pattern-dots opacity-[0.05] pointer-events-none" />
      <img
        src="/images/escudo-mairana.jpg"
        alt=""
        className="h-14 w-auto rounded-lg bg-white/80 object-contain p-1 shadow-sm ring-1 ring-primary/20"
      />
      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Gaceta Municipal</span>
    </div>
  )
}
