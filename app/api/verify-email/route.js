import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"

export async function POST(request) {
  await dbConnect()

  const { email, otp } = await request.json()

  if (!email || !otp) {
    return NextResponse.json({ error: "Missing email or OTP" }, { status: 400 })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Email already verified" })
    }

    if (user.otp.code !== otp || new Date() > user.otp.expiresAt) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    user.isVerified = true
    user.otp = undefined
    await user.save()

    return NextResponse.json({ message: "Email verified successfully" })
  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.json({ error: "An error occurred during verification" }, { status: 500 })
  }
}

