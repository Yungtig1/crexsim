import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Cryptocurrency from "@/models/Cryptocurrency"

export async function POST(request, { params }) {
  await dbConnect()

  const symbol = (await params).symbol

  try {
    const crypto = await Cryptocurrency.findOne({ symbol })

    if (!crypto) {
      return NextResponse.json({ error: "Cryptocurrency not found" }, { status: 404 })
    }

    crypto.isWatched = !crypto.isWatched
    await crypto.save()

    return NextResponse.json({ message: "Watchlist status updated successfully" })
  } catch (error) {
    console.error("Error updating watchlist status:", error)
    return NextResponse.json({ error: "An error occurred while updating watchlist status" }, { status: 500 })
  }
}

