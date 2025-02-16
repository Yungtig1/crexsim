import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import Cryptocurrency from "@/models/Cryptocurrency"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
    await dbConnect()

    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return NextResponse.json({ error: "No token provided" }, { status: 401 })
        }
    
        const token = authHeader.split(' ')[1]
        console.log("Received token:", token) // Debug log
    
        const userId = verifyToken(token)
        console.log("Verified userId:", userId) // Debug log
    
        if (!userId) {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 })
        }
    
        const user = await User.findById(userId)
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Fetch current prices for all held cryptocurrencies
        const symbols = user.holdings.map(holding => holding.symbol)
        const currentPrices = await Cryptocurrency.find({ symbol: { $in: symbols } }).select('symbol currentPrice')
        const priceMap = Object.fromEntries(currentPrices.map(crypto => [crypto.symbol, crypto.currentPrice]))

        const holdingCoins = await Promise.all(user.holdings.map(async holding => {
            const currentPrice = priceMap[holding.symbol] || 0
            const unrealizedPnL = (currentPrice - holding.averagePrice) * holding.amount
            const unrealizedPnLPercentage = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100

            return {
                symbol: holding.symbol,
                amount: holding.amount,
                averagePrice: holding.averagePrice,
                currentPrice: currentPrice,
                unrealizedPnL: unrealizedPnL,
                unrealizedPnLPercentage: unrealizedPnLPercentage
            }
        }))

        const tradedCoins = user.transactions.reduce((acc, transaction) => {
            const existingCoin = acc.find(coin => coin.symbol === transaction.symbol)
            if (existingCoin) {
                if (transaction.type === 'sell') {
                    existingCoin.realizedPnL += (transaction.price - existingCoin.averagePrice) * transaction.amount
                    existingCoin.totalSold += transaction.amount
                } else {
                    // Update average price for buys
                    const totalAmount = existingCoin.totalBought + transaction.amount
                    existingCoin.averagePrice =
                        (existingCoin.averagePrice * existingCoin.totalBought + transaction.price * transaction.amount) / totalAmount
                    existingCoin.totalBought += transaction.amount
                }
            } else {
                acc.push({
                    symbol: transaction.symbol,
                    realizedPnL: transaction.type === 'sell' ? (transaction.price - transaction.amount) * transaction.amount : 0,
                    averagePrice: transaction.price,
                    totalBought: transaction.type === 'buy' ? transaction.amount : 0,
                    totalSold: transaction.type === 'sell' ? transaction.amount : 0
                })
            }
            return acc
        }, [])

        // Calculate realized PnL percentage
        tradedCoins.forEach(coin => {
            if (coin.totalSold > 0) {
                coin.realizedPnLPercentage = (coin.realizedPnL / (coin.averagePrice * coin.totalSold)) * 100
            } else {
                coin.realizedPnLPercentage = 0
            }
        })

        return NextResponse.json({
            balance: user.balance,
            holdingCoins,
            tradedCoins
        })
    } catch (error) {
        console.error("Error fetching wallet data:", error)
        return NextResponse.json({ error: "An error occurred while fetching wallet data" }, { status: 500 })
    }
}