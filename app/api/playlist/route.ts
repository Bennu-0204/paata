import { NextResponse } from "next/server"
import { getPlaylist } from "@/lib/jiosaavn"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 })
  }

  try {
    const playlist = await getPlaylist(id)
    return NextResponse.json(playlist)
  } catch (error) {
    console.log("[v0] playlist error:", (error as Error).message)
    return NextResponse.json({ error: "Failed to load playlist" }, { status: 502 })
  }
}
