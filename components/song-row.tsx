"use client"

import { ListPlus, Pause, Play } from "lucide-react"
import type { Song } from "@/lib/types"
import { cn, formatTime } from "@/lib/utils"
import { Equalizer } from "@/components/equalizer"
import { TrackImage } from "@/components/track-image"
import { usePlayer } from "@/components/player/player-context"

interface SongRowProps {
  song: Song
  index?: number
  context?: Song[]
  showIndex?: boolean
}

export function SongRow({ song, index, context, showIndex = false }: SongRowProps) {
  const { current, isPlaying, playNow, toggle, addToQueue } = usePlayer()
  const isCurrent = current?.id === song.id
  const isActive = isCurrent && isPlaying
  const disabled = !song.streamUrls?.length

  const handlePlay = () => {
    if (disabled) return
    if (isCurrent) {
      toggle()
    } else {
      playNow(song, context)
    }
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary/60",
        isCurrent && "bg-secondary/40",
        disabled && "opacity-50",
      )}
    >
      <div className="flex w-6 shrink-0 items-center justify-center">
        {showIndex && !isCurrent ? (
          <span className="text-sm text-muted-foreground group-hover:hidden">
            {(index ?? 0) + 1}
          </span>
        ) : null}
        {isCurrent ? (
          <div className={cn(showIndex && "group-hover:hidden")}>
            <Equalizer playing={isActive} />
          </div>
        ) : null}
        <button
          type="button"
          onClick={handlePlay}
          disabled={disabled}
          aria-label={isActive ? `Pause ${song.title}` : `Play ${song.title}`}
          className={cn(
            "hidden text-foreground",
            !disabled && "group-hover:block",
            showIndex ? "" : !isCurrent && "block",
          )}
        >
          {isActive ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current" />}
        </button>
      </div>

      <button
        type="button"
        onClick={handlePlay}
        disabled={disabled}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <TrackImage src={song.image} alt={song.title} className="h-11 w-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={cn("truncate text-sm font-medium", isCurrent && "text-primary")}>
            {song.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">{song.artists}</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => addToQueue(song)}
        disabled={disabled}
        aria-label={`Add ${song.title} to queue`}
        className="hidden shrink-0 rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground group-hover:block"
      >
        <ListPlus className="h-4 w-4" />
      </button>

      <span className="w-12 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        {formatTime(song.duration)}
      </span>
    </div>
  )
}
