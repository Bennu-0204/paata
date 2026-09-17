"use client"

import useSWR from "swr"
import { Play, SearchX } from "lucide-react"
import type { SearchResults } from "@/lib/types"
import { fetcher } from "@/lib/fetcher"
import { CardSection } from "@/components/card-section"
import { SongRow } from "@/components/song-row"
import { usePlayer } from "@/components/player/player-context"

const SUGGESTIONS = ["Arijit Singh", "Weeknd", "Lo-Fi", "Punjabi Hits", "90s Bollywood", "Taylor Swift"]

function SongsSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-2 py-2">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-md bg-secondary/60" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-secondary/60" />
            <div className="h-2.5 w-1/4 animate-pulse rounded bg-secondary/50" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SearchClient({ query }: { query: string }) {
  const { playQueue } = usePlayer()
  const { data, isLoading } = useSWR<SearchResults>(
    query ? `/api/search?q=${encodeURIComponent(query)}` : null,
    fetcher,
    { revalidateOnFocus: false, keepPreviousData: true },
  )

  if (!query) {
    return (
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-2xl font-bold tracking-tight">Search</h1>
        <p className="mb-4 text-sm text-muted-foreground">Try one of these to get started:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <a
              key={s}
              href={`/search?q=${encodeURIComponent(s)}`}
              className="rounded-full border border-border bg-card/40 px-4 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-card"
            >
              {s}
            </a>
          ))}
        </div>
      </div>
    )
  }

  const songs = data?.songs ?? []
  const hasResults =
    songs.length || data?.albums?.length || data?.playlists?.length || data?.artists?.length

  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="mb-6 text-xl font-semibold text-muted-foreground">
        Results for <span className="text-foreground">&ldquo;{query}&rdquo;</span>
      </h1>

      {isLoading && !data ? (
        <SongsSkeleton />
      ) : !hasResults ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
          <SearchX className="h-10 w-10 opacity-50" />
          <p>No results found for &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <div className="space-y-10">
          {songs.length ? (
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">Songs</h2>
                <button
                  type="button"
                  onClick={() => playQueue(songs, 0)}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Play all
                </button>
              </div>
              <div className="space-y-1">
                {songs.map((song, i) => (
                  <SongRow key={song.id} song={song} index={i} context={songs} />
                ))}
              </div>
            </section>
          ) : null}

          <CardSection title="Albums" items={data?.albums ?? []} />
          <CardSection title="Playlists" items={data?.playlists ?? []} />
          <CardSection title="Artists" items={data?.artists ?? []} />
        </div>
      )}
    </div>
  )
}
