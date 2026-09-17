"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { AudioLines, Home, Search } from "lucide-react"
import { Suspense } from "react"
import { cn } from "@/lib/utils"
import { Sidebar } from "@/components/layout/sidebar"
import { SearchBar } from "@/components/layout/search-bar"
import { PlayerBar } from "@/components/player/player-bar"

const MOBILE_NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/search", label: "Search", icon: Search },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6">
          <Link href="/" className="flex items-center gap-2 md:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <AudioLines className="h-4 w-4" />
            </span>
          </Link>
          <Suspense fallback={<div className="h-11 w-full max-w-md rounded-full bg-secondary/60" />}>
            <SearchBar />
          </Suspense>
        </header>

        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 pb-40 pt-4 md:px-6 md:pb-28">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border bg-background/95 backdrop-blur md:hidden">
          {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-6 py-1 text-[11px]",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <PlayerBar />
    </div>
  )
}
