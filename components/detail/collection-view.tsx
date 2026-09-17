"use client"

import useSWR from "swr"
import { AlertCircle, Clock, Pause, Play, Shuffle } from "lucide-react"
import type { AlbumDetail, PlaylistDetail } from "@/lib/types"
import { fetcher } from "@/lib/fetcher"
import { formatTime } from "@/lib/utils"
import { TrackImage } from "@/components/track-image"
import { SongRow } from "@/components/song-row"
import { usePlayer } from "@/components/player/player-context"

interface CollectionViewProps {
  type: "album" | "playlist"
  id: string
}

function HeaderSkeleton() {
  return (
    <div className="mb-8 flex flex-col items-center gap-5 md:flex-row md:items-end">
      <div className="h-48 w-48 animate-pulse rounded-xl bg-secondary/60 md:h-56 md:w-56" />
      <div className="w-full space-y-3">
        <div className="h-4 w-16 animate-pulse rounded bg-secondary/60" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-secondary/60" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-secondary/50" />
      </div>
    </div>
  )
}

export function CollectionView({ type, id }: CollectionViewProps) {
  const { data, error, isLoading } = useSWR<AlbumDetail | PlaylistDetail>(
    `/api/${type}?id=${encodeURIComponent(id)}`,
    fetcher,
    { revalidateOnFocus: false },
  )

  const { current, isPlaying, toggle, playQueue } = usePlayer()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <HeaderSkeleton />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="mx-auto flex max-w-5xl items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground">
        <AlertCircle className="h-5 w-5 text-destructive" />
        Couldn&apos;t load this {type}. It may be unavailable.
      </div>
    )
  }

  const songs = data.songs ?? []
  const playable = songs.filter((s) => s.streamUrls?.length)
  const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0)
  const isThisPlaying = current && playable.some((s) => s.id === current.id) && isPlaying

  const subtitle =
    type === "album"
      ? (data as AlbumDetail).subtitle
      : (data as PlaylistDetail).subtitle

  const handlePlay = () => {
    if (isThisPlaying) {
      toggle()
    } else {
      playQueue(playable, 0)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:text-left">
        <TrackImage
          src={data.image}
          alt={data.title}
          rounded="rounded-xl"
          className="h-48 w-48 shrink-0 shadow-2xl md:h-56 md:w-56"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {type}
          </p>
          <h1 className="mt-1 text-balance text-3xl font-bold tracking-tight md:text-4xl">
            {data.title}
          </h1>
          {subtitle ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
          <p className="mt-3 text-xs text-muted-foreground">
            {songs.length} songs
            {totalDuration > 0 ? ` · ${formatTime(totalDuration)}` : ""}
          </p>
        </div>
      </div>

      {playable.length ? (
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handlePlay}
            className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
          >
            {isThisPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current" />
            )}
            {isThisPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={() => {
              const shuffled = [...playable].sort(() => Math.random() - 0.5)
              playQueue(shuffled, 0)
            }}
            className="flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </button>
        </div>
      ) : null}

      <div className="mb-2 hidden items-center gap-3 border-b border-border px-2 pb-2 text-xs uppercase tracking-wider text-muted-foreground sm:flex">
        <span className="w-6 text-center">#</span>
        <span className="flex-1">Title</span>
        <Clock className="mr-1 h-3.5 w-3.5" />
      </div>

      <div className="space-y-1">
        {songs.map((song, i) => (
          <SongRow key={`${song.id}-${i}`} song={song} index={i} context={playable} showIndex />
        ))}
      </div>
    </div>
  )
}
