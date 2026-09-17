import { CollectionView } from "@/components/detail/collection-view"

export default async function PlaylistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CollectionView type="playlist" id={id} />
}
