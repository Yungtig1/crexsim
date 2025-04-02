import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
})

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    balance: {
      type: Number,
      default: 0,
    },
    holdings: [{
      symbol: String,
      amount: Number,
      averagePrice: Number
    }],
    transactions: [TransactionSchema],
    endConversationToken: {
      type: String,
    },
  },
  { timestamps: true },
)

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

export default mongoose.models.User || mongoose.model("User", UserSchema)