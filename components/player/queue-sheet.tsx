"use client"

import { Trash2, X } from "lucide-react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { Equalizer } from "@/components/equalizer"
import { TrackImage } from "@/components/track-image"
import { usePlayer } from "@/components/player/player-context"

interface QueueSheetProps {
  open: boolean
  onClose: () => void
}

export function QueueSheet({ open, onClose }: QueueSheetProps) {
  const { queue, currentIndex, current, isPlaying, playAt, removeAt, clearQueue } = usePlayer()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  const upcoming = queue.length - currentIndex - 1

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/60 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Play queue"
        aria-modal="true"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-4">
          <div>
            <h2 className="text-base font-semibold">Play Queue</h2>
            <p className="text-xs text-muted-foreground">
              {queue.length} tracks{upcoming > 0 ? ` · ${upcoming} up next` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {queue.length > 0 ? (
              <button
                type="button"
                onClick={clearQueue}
                aria-label="Clear queue"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close queue"
              className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="scrollbar-thin flex-1 overflow-y-auto p-2">
          {queue.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              Your queue is empty. Play a song or add tracks to get started.
            </div>
          ) : (
            <ul className="space-y-1">
              {queue.map((song, i) => {
                const isCurrent = i === currentIndex
                return (
                  <li
                    key={`${song.id}-${i}`}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-secondary/60",
                      isCurrent && "bg-secondary/50",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => playAt(i)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="relative shrink-0">
                        <TrackImage src={song.image} alt={song.title} className="h-11 w-11" />
                        {isCurrent ? (
                          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/50">
                            <Equalizer playing={isPlaying} />
                          </div>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={cn("truncate text-sm font-medium", isCurrent && "text-primary")}>
                          {song.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{song.artists}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeAt(i)}
                      aria-label={`Remove ${song.title} from queue`}
                      className="shrink-0 rounded-full p-2 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  )
}
