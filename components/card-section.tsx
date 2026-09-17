import type { AlbumBrief, ArtistBrief, PlaylistBrief } from "@/lib/types"
import { MediaCard } from "@/components/media-card"

interface CardSectionProps {
  title: string
  items: (AlbumBrief | PlaylistBrief | ArtistBrief)[]
}

export function CardSection({ title, items }: CardSectionProps) {
  if (!items.length) return null
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-bold tracking-tight">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {items.map((item) => (
          <MediaCard key={`${item.type}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  )
}
