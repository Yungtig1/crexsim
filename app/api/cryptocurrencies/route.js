import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import Cryptocurrency from "@/models/Cryptocurrency"
import { generateNewCrypto, updateCryptoPrices } from "@/lib/cryptoManager"

export async function GET() {
  try {
    await dbConnect()

    const startTime = Date.now() // Debug: Start time

    await generateNewCrypto()
    await updateCryptoPrices()

    const cryptocurrencies = await Cryptocurrency.find()
      .sort({ price: -1 })
      .select("name symbol price change apy chartData createdAt isWatched")
      .lean()

    const updatedCryptocurrencies = cryptocurrencies.map((crypto) => {
      const lastPrice = crypto.chartData[crypto.chartData.length - 2] || crypto.price
      const change24h = ((crypto.price - lastPrice) / lastPrice) * 100
      return {
        ...crypto,
        change24h: Number(change24h.toFixed(2)),
      }
    })

    const endTime = Date.now() // Debug: End time
    console.log(`API response time: ${endTime - startTime}ms`) // Debug: Log response time

    return NextResponse.json(updatedCryptocurrencies)
  } catch (error) {
    console.error("Error fetching cryptocurrencies:", error)

    // Determine the appropriate status code
    const statusCode = error.code === 11000 ? 409 : 500

    // Prepare a user-friendly error message
    const errorMessage =
      error.code === 11000
        ? "Duplicate cryptocurrency detected. Please try again."
        : "An error occurred while fetching cryptocurrencies. Please try again later."

    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

