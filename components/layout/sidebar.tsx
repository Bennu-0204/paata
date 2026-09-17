"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AudioLines, Home, Library, ListMusic, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePlayer } from "@/components/player/player-context"
import { TrackImage } from "@/components/track-image"

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
]

export function Sidebar() {
  const pathname = usePathname()
  const { queue, current } = usePlayer()

  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-4 bg-sidebar p-3 md:flex">
      <Link href="/" className="flex items-center gap-2 px-3 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <AudioLines className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold tracking-tight">Resonate</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-2 flex min-h-0 flex-1 flex-col rounded-xl bg-background/40 p-3">
        <div className="flex items-center gap-2 px-1 pb-3 text-sm font-medium text-muted-foreground">
          <ListMusic className="h-4 w-4" />
          Up Next
        </div>
        {queue.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center text-xs text-muted-foreground">
            <Library className="h-8 w-8 opacity-40" />
            <p>Nothing queued yet. Search and play something.</p>
          </div>
        ) : (
          <ul className="scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-1">
            {queue.slice(0, 20).map((song, i) => (
              <li key={`${song.id}-${i}`} className="flex items-center gap-2">
                <TrackImage src={song.image} alt={song.title} className="h-9 w-9 shrink-0" />
                <div className="min-w-0">
                  <p
                    className={cn(
                      "truncate text-xs font-medium",
                      current?.id === song.id && "text-primary",
                    )}
                  >
                    {song.title}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{song.artists}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
