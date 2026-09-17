import { NextResponse } from "next/server"
import { getHome } from "@/lib/jiosaavn"

export async function GET() {
  try {
    const home = await getHome()
    return NextResponse.json(home)
  } catch (error) {
    console.log("[v0] home error:", (error as Error).message)
    return NextResponse.json({ error: "Failed to load home" }, { status: 502 })
  }
}
