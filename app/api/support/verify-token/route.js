import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import SupportMessage from "@/models/SupportMessage"

export async function POST(request) {
  await dbConnect()

  try {
    const { messageId, token } = await request.json()

    if (!messageId || !token) {
      return NextResponse.json({ valid: false, error: "Missing required parameters" }, { status: 400 })
    }

    const message = await SupportMessage.findById(messageId)

    if (!message) {
      console.log(`Message not found: ${messageId}`)
      return NextResponse.json({ valid: false, error: "Message not found" }, { status: 404 })
    }

    // Debug logs to help identify the issue
    console.log(`Verifying token for message ${messageId}`)
    console.log(`Token from request: ${token}`)
    console.log(`Token in database: ${message.responseToken}`)

    const isValid = message.responseToken === token
    console.log(`Token valid: ${isValid}`)

    return NextResponse.json({ valid: isValid })
  } catch (error) {
    console.error("Error verifying token:", error)
    return NextResponse.json({ valid: false, error: "An error occurred while verifying the token" }, { status: 500 })
  }
}

