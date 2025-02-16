import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Cryptocurrency from "@/models/Cryptocurrency"

export async function GET(request, { params }) {
  await dbConnect()

  try {
    const symbol = (await params).symbol
    const crypto = await Cryptocurrency.findOne({ symbol })

    if (!crypto) {
      return NextResponse.json({ error: "Cryptocurrency not found" }, { status: 404 })
    }

    // Generate OHLC data for the chart
    const chartData = crypto.chartData.map((price, index) => {
      const basePrice = price
      const randomVariation = basePrice * 0.02 // 2% variation

      return {
        date: new Date(Date.now() - (crypto.chartData.length - index) * 3600000).toISOString(),
        open: basePrice - (Math.random() * randomVariation),
        high: basePrice + (Math.random() * randomVariation),
        low: basePrice - (Math.random() * randomVariation),
        close: basePrice,
        volume: Math.floor(Math.random() * 1000000)
      }
    })

    return NextResponse.json({
      ...crypto.toObject(),
      chartData
    })
  } catch (error) {
    console.error("Error fetching cryptocurrency:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}