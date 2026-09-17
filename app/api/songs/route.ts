import { NextResponse } from "next/server"
import { searchSongs } from "@/lib/jiosaavn"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim()
  const page = Number(searchParams.get("page") ?? "1")
  const limit = Number(searchParams.get("limit") ?? "30")

  if (!query) {
    return NextResponse.json({ songs: [] })
  }

  try {
    const songs = await searchSongs(query, page, limit)
    return NextResponse.json({ songs })
  } catch (error) {
    console.log("[v0] songs search error:", (error as Error).message)
    return NextResponse.json({ error: "Search failed" }, { status: 502 })
  }
}
