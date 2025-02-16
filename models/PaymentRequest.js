import mongoose from "mongoose"

const PaymentRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  method: {
    type: String,
    enum: ["plaid", "manual"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  details: {
    type: Object,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.PaymentRequest || mongoose.model("PaymentRequest", PaymentRequestSchema)

