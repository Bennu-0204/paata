"use client"

import { Music } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface TrackImageProps {
  src: string
  alt: string
  className?: string
  rounded?: string
}

export function TrackImage({ src, alt, className, rounded = "rounded-md" }: TrackImageProps) {
  const [error, setError] = useState(false)

  if (!src || error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-secondary text-muted-foreground",
          rounded,
          className,
        )}
        aria-label={alt}
      >
        <Music className="h-1/3 w-1/3" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={cn("object-cover", rounded, className)}
    />
  )
}
