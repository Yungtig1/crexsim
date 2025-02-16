import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request) {
  await dbConnect()

  const { email, password, name } = await request.json()

  try {
    // Check if user already exists
    let user = await User.findOne({ email })
    if (user) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // OTP valid for 10 minutes

    // Create new user
    user = new User({
      email,
      password,
      name,
      otp: {
        code: otp,
        expiresAt: otpExpiry,
      },
    })

    await user.save()

    // Send verification email For Production
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Verify your email",
      html: `Your OTP is: ${otp}. It will expire in 10 minutes.`,
    })


    return NextResponse.json({ message: "User registered successfully. Use the OTP below to verify your email", otp })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}

