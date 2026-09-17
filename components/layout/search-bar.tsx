"use client"

import { Search, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"

export function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlQuery = searchParams.get("q") ?? ""

  const [value, setValue] = useState(urlQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keep the field in sync when the URL changes (e.g. back/forward).
  useEffect(() => {
    setValue(urlQuery)
  }, [urlQuery])

  // Debounced live navigation while on the search page.
  useEffect(() => {
    if (pathname !== "/search") return
    const handle = setTimeout(() => {
      const trimmed = value.trim()
      if (trimmed === urlQuery) return
      router.replace(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search")
    }, 350)
    return () => clearTimeout(handle)
  }, [value, pathname, urlQuery, router])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    inputRef.current?.blur()
  }

  return (
    <form onSubmit={submit} className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search songs, albums, artists…"
        aria-label="Search"
        className="h-11 w-full rounded-full border border-border bg-secondary/60 pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/50 focus:bg-secondary [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("")
            inputRef.current?.focus()
            if (pathname === "/search") router.replace("/search")
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </form>
  )
}
