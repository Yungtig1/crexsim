import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import SupportMessage from "@/models/SupportMessage"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  await dbConnect()

  try {
    // Verify user token
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)
    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get all messages for this user, sorted by creation date
    const messages = await SupportMessage.find({ userId })
      .sort({ createdAt: 1 })
      .select("message adminResponses status createdAt updatedAt")

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching user support messages:", error)
    return NextResponse.json({ error: "An error occurred while fetching your messages" }, { status: 500 })
  }
}

