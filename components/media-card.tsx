import Link from "next/link"
import type { AlbumBrief, ArtistBrief, PlaylistBrief } from "@/lib/types"
import { TrackImage } from "@/components/track-image"

interface MediaCardProps {
  item: AlbumBrief | PlaylistBrief | ArtistBrief
}

export function MediaCard({ item }: MediaCardProps) {
  const isArtist = item.type === "artist"
  const title = isArtist ? (item as ArtistBrief).name : (item as AlbumBrief | PlaylistBrief).title
  const href =
    item.type === "album"
      ? `/album/${item.id}`
      : item.type === "playlist"
        ? `/playlist/${item.id}`
        : `/search?q=${encodeURIComponent(title)}`

  let subtitle = ""
  if (item.type === "album") subtitle = (item as AlbumBrief).subtitle || (item as AlbumBrief).year || "Album"
  else if (item.type === "playlist") {
    const p = item as PlaylistBrief
    subtitle = p.songCount ? `${p.songCount} songs` : p.subtitle || "Playlist"
  } else subtitle = "Artist"

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-xl bg-card/40 p-3 transition-colors hover:bg-card"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        <TrackImage
          src={item.image}
          alt={title}
          rounded={isArtist ? "rounded-full" : "rounded-lg"}
          className="h-full w-full transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </Link>
  )
}
