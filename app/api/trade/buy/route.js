import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import Cryptocurrency from "@/models/Cryptocurrency"
import { verifyToken } from "@/lib/auth"

export async function POST(request) {
  await dbConnect()

  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    console.log("Received token:", token) 

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { symbol, amount } = await request.json()

    const user = await User.findById(userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const coin = await Cryptocurrency.findOne({ symbol })
    if (!coin) {
      return NextResponse.json({ error: "Coin not found" }, { status: 404 })
    }

    const totalCost = coin.price * amount
    if (user.balance < totalCost) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    user.balance -= totalCost

    const existingHolding = user.holdings.find(h => h.symbol === symbol)
    if (existingHolding) {
      const totalAmount = existingHolding.amount + amount
      existingHolding.averagePrice = 
        (existingHolding.averagePrice * existingHolding.amount + totalCost) / totalAmount
      existingHolding.amount = totalAmount
    } else {
      user.holdings.push({
        symbol,
        amount,
        averagePrice: coin.price
      })
    }

    user.transactions.push({
      type: 'buy',
      symbol,
      amount,
      price: coin.price
    })

    await user.save()

    return NextResponse.json({ message: "Purchase successful" })
  } catch (error) {
    console.error("Error processing purchase:", error)
    return NextResponse.json({ error: "An error occurred while processing the purchase" }, { status: 500 })
  }
}