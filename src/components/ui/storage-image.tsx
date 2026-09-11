"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

interface StorageImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  className?: string
  loading?: "eager" | "lazy"
  fetchPriority?: "high" | "low" | "auto"
  fallback?: React.ReactNode
}

export function StorageImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  loading,
  fetchPriority,
  fallback,
}: StorageImageProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    if (fallback) return <>{fallback}</>
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5",
          className
        )}
      >
        <ImageIcon className="h-10 w-10 text-muted-foreground/50" />
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      loading={loading}
      fetchPriority={fetchPriority}
      unoptimized
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
