import { NextResponse } from "next/server"
import { searchAll } from "@/lib/jiosaavn"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q) {
    return NextResponse.json({ songs: [], albums: [], playlists: [] })
  }

  try {
    const results = await searchAll(q)
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
