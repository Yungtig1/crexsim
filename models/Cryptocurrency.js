import mongoose from "mongoose"

const CryptocurrencySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      unique: true,
    },
    symbol: {
      type: String,
      required: [true, "Please provide a symbol"],
      unique: true,
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
    },
    change: {
      type: Number,
      required: [true, "Please provide a change percentage"],
    },
    apy: {
      type: Number,
      default: null,
    },
    chartData: {
      type: [Number],
      default: [],
    },
    volatility: {
      type: Number,
      default: 0.05,
    },
    isWatched: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

export default mongoose.models.Cryptocurrency || mongoose.model("Cryptocurrency", CryptocurrencySchema)

