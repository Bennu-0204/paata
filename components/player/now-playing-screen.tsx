"use client"

import {
  ChevronDown,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react"
import { useState } from "react"
import { cn, formatTime } from "@/lib/utils"
import { RangeSlider } from "@/components/ui/range-slider"
import { TrackImage } from "@/components/track-image"
import { usePlayer } from "@/components/player/player-context"

interface NowPlayingScreenProps {
  onClose: () => void
  onOpenQueue: () => void
}

export function NowPlayingScreen({ onClose, onOpenQueue }: NowPlayingScreenProps) {
  const {
    current,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    shuffle,
    repeat,
    toggle,
    next,
    prev,
    seek,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer()

  const [scrubTime, setScrubTime] = useState<number | null>(null)

  if (!current) return null
  const displayTime = scrubTime ?? currentTime

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background md:hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: current.image ? `url(${current.image})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(60px) saturate(1.2)",
          transform: "scale(1.3)",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute inset-0 bg-background/70" aria-hidden="true" />

      <div className="relative flex items-center justify-between px-5 py-4">
        <button type="button" onClick={onClose} aria-label="Minimize player" className="p-1">
          <ChevronDown className="h-6 w-6" />
        </button>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Now Playing
        </span>
        <button type="button" onClick={onOpenQueue} aria-label="Open queue" className="p-1">
          <ListMusic className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-8 px-8">
        <TrackImage
          src={current.image}
          alt={current.title}
          rounded="rounded-2xl"
          className="mx-auto aspect-square w-full max-w-sm shadow-2xl"
        />

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">{current.title}</h1>
          <p className="truncate text-base text-muted-foreground">{current.artists}</p>
        </div>

        <div>
          <RangeSlider
            ariaLabel="Seek"
            value={displayTime}
            max={duration || current.duration || 0}
            onValueChange={setScrubTime}
            onCommit={(v) => {
              seek(v)
              setScrubTime(null)
            }}
          />
          <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-muted-foreground">
            <span>{formatTime(displayTime)}</span>
            <span>{formatTime(duration || current.duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-label="Shuffle"
            className={cn("text-muted-foreground", shuffle && "text-primary")}
          >
            <Shuffle className="h-5 w-5" />
          </button>
          <button type="button" onClick={prev} aria-label="Previous">
            <SkipBack className="h-7 w-7 fill-current" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-7 w-7 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-7 w-7 fill-current" />
            ) : (
              <Play className="h-7 w-7 translate-x-[2px] fill-current" />
            )}
          </button>
          <button type="button" onClick={next} aria-label="Next">
            <SkipForward className="h-7 w-7 fill-current" />
          </button>
          <button
            type="button"
            onClick={cycleRepeat}
            aria-label="Repeat"
            className={cn("text-muted-foreground", repeat !== "off" && "text-primary")}
          >
            {repeat === "one" ? <Repeat1 className="h-5 w-5" /> : <Repeat className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
