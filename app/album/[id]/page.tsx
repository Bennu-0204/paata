import { CollectionView } from "@/components/detail/collection-view"

export default async function AlbumPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CollectionView type="album" id={id} />
}
