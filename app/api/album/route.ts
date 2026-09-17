import { NextResponse } from "next/server"
import { getAlbum } from "@/lib/jiosaavn"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    const album = await getAlbum(id)
    return NextResponse.json(album)
  } catch (error) {
    console.log("[v0] album error:", (error as Error).message)
    return NextResponse.json({ error: "Failed to load album" }, { status: 502 })
  }
}
