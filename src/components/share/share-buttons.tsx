"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url })
        return
      } catch {
        return
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en Facebook"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-xs font-bold shadow-sm transition-colors hover:bg-accent"
      >
        F
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en X"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-xs font-bold shadow-sm transition-colors hover:bg-accent"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Compartir en LinkedIn"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background text-xs font-bold shadow-sm transition-colors hover:bg-accent"
      >
        in
      </a>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="rounded-full"
        onClick={handleNativeShare}
        aria-label="Copiar enlace"
        title="Copiar enlace"
      >
        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Share2 className="h-4 w-4" />}
      </Button>
    </div>
  )
}
