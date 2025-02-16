import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

export async function POST(request) {
  await dbConnect()

  const { email, password } = await request.json()

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 })
    }

    if (!user.isVerified) {
      return NextResponse.json({ error: "Please verify your email before logging in" }, { status: 400 })
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" })

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}

