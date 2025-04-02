import mongoose from "mongoose"

const SupportMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "responded", "closed"],
    default: "pending",
  },
  adminResponses: [
    {
      text: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  responseToken: {
    type: String,
    // We'll use mongoose's built-in index instead of the imported 'unique'
    index: { unique: true, sparse: true },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Make sure we're not redefining models
const SupportMessage = mongoose.models.SupportMessage || mongoose.model("SupportMessage", SupportMessageSchema)

export default SupportMessage

