import { NextResponse } from "next/server"
import { searchAll } from "@/lib/jiosaavn"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()

  if (!query) {
    return NextResponse.json({ songs: [], albums: [], playlists: [], artists: [] })
  }

  try {
    const results = await searchAll(query)
    return NextResponse.json(results)
  } catch (error) {
    console.log("[v0] search error:", (error as Error).message)
    return NextResponse.json({ error: "Search failed" }, { status: 502 })
  }
}
