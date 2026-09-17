import { NextResponse } from "next/server"
import { getSongSuggestions } from "@/lib/jiosaavn"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ songs: [] })
  }

  try {
    const songs = await getSongSuggestions(id)
    return NextResponse.json({ songs })
  } catch (error) {
    console.log("[v0] suggestions error:", (error as Error).message)
    return NextResponse.json({ songs: [] })
  }
}
