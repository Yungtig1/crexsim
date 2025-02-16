import dbConnect from "./mongoose"
import Cryptocurrency from "@/models/Cryptocurrency"
import CryptoMeta from "@/models/CryptoMeta"

const CRYPTO_GENERATION_INTERVAL = 10 * 60 * 1000 // 10 minutes in milliseconds
const CRYPTO_UPDATE_INTERVAL = 1 * 60 * 1000 // 1 minute in milliseconds

const prefixes = ["Quantum", "Cyber", "Neo", "Meta", "Digi", "Tech", "Flux", "Nova", "Byte", "Data"]
const suffixes = ["Coin", "Chain", "Token", "Protocol", "Network", "Link", "Node", "Base", "Hub", "Core"]

function generateRandomName() {
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]
  return `${prefix}${suffix}`
}

function generateRandomSymbol(name) {
  return name.match(/[A-Z]/g).join("").padEnd(3, "X").slice(0, 4)
}

function generateChartData() {
  return Array.from({ length: 12 }, () => Math.random() * 100)
}

function generateRandomPrice() {
  const magnitude = Math.floor(Math.random() * 4) // 0-3
  const basePrice = Math.random() * 100
  return Number((basePrice * Math.pow(10, magnitude)).toFixed(2))
}

export async function generateNewCrypto() {
  await dbConnect()

  const lastGeneration = await CryptoMeta.findOne({ key: "lastGeneration" })
  const currentTime = new Date().getTime()

  if (!lastGeneration || currentTime - lastGeneration.value >= CRYPTO_GENERATION_INTERVAL) {
    console.log("Generating new cryptocurrency...") // Debug log
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      try {
        const name = generateRandomName()
        const symbol = generateRandomSymbol(name)
        const price = generateRandomPrice()
        const change = Number((Math.random() * 15 - 7.5).toFixed(2)) // -7.5% to +7.5%
        const apy = Math.random() < 0.7 ? Number((Math.random() * 8 + 1).toFixed(2)) : null
        const chartData = generateChartData()
        const volatility = Number((Math.random() * 0.1 + 0.02).toFixed(4)) // 2% to 12% volatility

        const newCrypto = new Cryptocurrency({
          name,
          symbol,
          price,
          change,
          apy,
          chartData,
          volatility,
        })

        await newCrypto.save()
        console.log(`New cryptocurrency generated: ${newCrypto.name} (${newCrypto.symbol})`) // Debug log
        await CryptoMeta.findOneAndUpdate({ key: "lastGeneration" }, { value: currentTime }, { upsert: true })
        break // Successfully created a new cryptocurrency, exit the loop
      } catch (error) {
        if (error.code === 11000) {
          console.log("Duplicate key error, retrying...") // Debug log
          attempts++
        } else {
          throw error // If it's not a duplicate key error, rethrow it
        }
      }
    }

    if (attempts === maxAttempts) {
      console.log("Failed to generate a unique cryptocurrency after maximum attempts") // Debug log
    }
  }
}

export async function updateCryptoPrices() {
  await dbConnect()

  const lastUpdate = await CryptoMeta.findOne({ key: "lastUpdate" })
  const currentTime = new Date().getTime()

  if (!lastUpdate || currentTime - lastUpdate.value >= CRYPTO_UPDATE_INTERVAL) {
    console.log("Updating cryptocurrency prices...") // Debug log

    const cryptocurrencies = await Cryptocurrency.find()

    for (const crypto of cryptocurrencies) {
      const change = (Math.random() - 0.3) * crypto.volatility // Biased towards positive change (70% profitable)
      const newPrice = Number((crypto.price * (1 + change)).toFixed(2))
      const newChange = Number((((newPrice - crypto.price) / crypto.price) * 100).toFixed(2))

      crypto.price = newPrice
      crypto.change = newChange
      crypto.chartData.push(newPrice)
      crypto.chartData = crypto.chartData.slice(-12) // Keep only the last 12 data points

      await crypto.save()
    }

    await CryptoMeta.findOneAndUpdate({ key: "lastUpdate" }, { value: currentTime }, { upsert: true })

    console.log("Cryptocurrency prices updated") // Debug log
  }
}

