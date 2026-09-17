import { SearchClient } from "@/components/search/search-client"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <SearchClient query={q?.trim() ?? ""} />
}
