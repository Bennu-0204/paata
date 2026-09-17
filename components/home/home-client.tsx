"use client"

import useSWR from "swr"
import { AlertCircle } from "lucide-react"
import type { HomeData } from "@/lib/types"
import { fetcher } from "@/lib/fetcher"
import { CardSection } from "@/components/card-section"

function SkeletonSection() {
  return (
    <section className="mb-8">
      <div className="mb-3 h-6 w-40 rounded bg-secondary/60" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3 rounded-xl bg-card/40 p-3">
            <div className="aspect-square w-full animate-pulse rounded-lg bg-secondary/60" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-secondary/60" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-secondary/50" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function HomeClient() {
  const { data, error, isLoading } = useSWR<HomeData>("/api/home", fetcher, {
    revalidateOnFocus: false,
  })

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 18) return "Good afternoon"
    return "Good evening"
  })()

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{greeting}</h1>
        <p className="text-sm text-muted-foreground">Discover trending music, albums, and playlists.</p>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/40 px-4 py-6 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Couldn&apos;t load recommendations. Try searching for a song instead.
        </div>
      ) : null}

      {isLoading ? (
        <>
          <SkeletonSection />
          <SkeletonSection />
        </>
      ) : (
        <>
          <CardSection title="Trending Now" items={data?.trending ?? []} />
          <CardSection title="Top Charts" items={data?.charts ?? []} />
          <CardSection title="New Albums" items={data?.albums ?? []} />
          <CardSection title="Featured Playlists" items={data?.playlists ?? []} />
        </>
      )}
    </div>
  )
}
