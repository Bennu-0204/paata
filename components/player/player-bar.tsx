"use client"

import Link from "next/link"
import {
  ListMusic,
  Loader2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useState } from "react"
import { cn, formatTime } from "@/lib/utils"
import { RangeSlider } from "@/components/ui/range-slider"
import { TrackImage } from "@/components/track-image"
import { usePlayer } from "@/components/player/player-context"
import { QueueSheet } from "@/components/player/queue-sheet"
import { NowPlayingScreen } from "@/components/player/now-playing-screen"

export function PlayerBar() {
  const {
    current,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer()

  const [queueOpen, setQueueOpen] = useState(false)
  const [fullScreen, setFullScreen] = useState(false)
  const [scrubTime, setScrubTime] = useState<number | null>(null)

  if (!current) return null

  const displayTime = scrubTime ?? currentTime
  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <>
      <footer className="fixed inset-x-0 bottom-14 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:bottom-0">
        {/* Mobile progress line */}
        <div className="h-0.5 w-full bg-secondary md:hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="mx-auto flex h-16 items-center gap-3 px-3 md:h-20 md:px-4">
          {/* Track info */}
          <div className="flex min-w-0 flex-1 items-center gap-3 md:w-[30%] md:flex-none">
            <button
              type="button"
              onClick={() => setFullScreen(true)}
              className="shrink-0 md:cursor-default"
              aria-label="Open now playing"
            >
              <TrackImage src={current.image} alt={current.title} className="h-12 w-12 md:h-14 md:w-14" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{current.title}</p>
              {current.albumId ? (
                <Link
                  href={`/album/${current.albumId}`}
                  className="truncate text-xs text-muted-foreground hover:text-foreground hover:underline"
                >
                  {current.artists}
                </Link>
              ) : (
                <p className="truncate text-xs text-muted-foreground">{current.artists}</p>
              )}
            </div>
          </div>

          {/* Mobile quick controls */}
          <div className="flex items-center gap-1 md:hidden">
            <button type="button" onClick={prev} aria-label="Previous" className="p-2 text-foreground">
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 translate-x-[1px] fill-current" />
              )}
            </button>
            <button type="button" onClick={next} aria-label="Next" className="p-2 text-foreground">
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
          </div>

          {/* Center controls (desktop) */}
          <div className="hidden flex-1 flex-col items-center gap-1.5 md:flex">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label="Shuffle"
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  shuffle && "text-primary hover:text-primary",
                )}
              >
                <Shuffle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous"
                className="text-foreground/90 transition-colors hover:text-foreground"
              >
                <SkipBack className="h-5 w-5 fill-current" />
              </button>
              <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? "Pause" : "Play"}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-transform hover:scale-105"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" />
                ) : (
                  <Play className="h-4 w-4 translate-x-[1px] fill-current" />
                )}
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="text-foreground/90 transition-colors hover:text-foreground"
              >
                <SkipForward className="h-5 w-5 fill-current" />
              </button>
              <button
                type="button"
                onClick={cycleRepeat}
                aria-label="Repeat"
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  repeat !== "off" && "text-primary hover:text-primary",
                )}
              >
                {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex w-full max-w-xl items-center gap-2">
              <span className="w-10 text-right text-[11px] tabular-nums text-muted-foreground">
                {formatTime(displayTime)}
              </span>
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
              <span className="w-10 text-[11px] tabular-nums text-muted-foreground">
                {formatTime(duration || current.duration)}
              </span>
            </div>
          </div>

          {/* Right controls (desktop) */}
          <div className="hidden items-center justify-end gap-2 md:flex md:w-[30%]">
            <button
              type="button"
              onClick={() => setQueueOpen(true)}
              aria-label="Open queue"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <ListMusic className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <VolumeIcon className="h-5 w-5" />
            </button>
            <div className="w-24">
              <RangeSlider
                ariaLabel="Volume"
                value={muted ? 0 : volume}
                max={1}
                step={0.01}
                onValueChange={setVolume}
              />
            </div>
          </div>

          {/* Mobile queue button */}
          <button
            type="button"
            onClick={() => setQueueOpen(true)}
            aria-label="Open queue"
            className="p-2 text-muted-foreground md:hidden"
          >
            <ListMusic className="h-5 w-5" />
          </button>
        </div>
      </footer>

      <QueueSheet open={queueOpen} onClose={() => setQueueOpen(false)} />
      {fullScreen ? <NowPlayingScreen onClose={() => setFullScreen(false)} onOpenQueue={() => { setFullScreen(false); setQueueOpen(true) }} /> : null}
    </>
  )
}
