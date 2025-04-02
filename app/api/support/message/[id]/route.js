import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import SupportMessage from "@/models/SupportMessage"
import User from "@/models/User"

export async function GET(request, { params }) {
  await dbConnect()

  try {
    const { id } = params
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    // Find the message
    const message = await SupportMessage.findById(id)

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Verify token
    if (message.responseToken !== token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get user details
    const user = await User.findById(message.userId).select("name email")

    // Get conversation history for this user
    const userMessages = await SupportMessage.find({
      userId: message.userId,
      status: { $ne: "closed" },
    }).sort({ createdAt: 1 })

    // Update the conversation history formatting to handle adminResponses array

    // Format conversation history
    const conversationHistory = userMessages.flatMap((msg) => {
      const baseMessage = {
        id: msg._id.toString(),
        userName: msg.userName,
        userEmail: msg.userEmail,
        timestamp: msg.createdAt,
        text: msg.message,
        isAdmin: false,
      }

      // If there are admin responses, add them as separate messages
      const messages = [baseMessage]

      if (msg.adminResponses && msg.adminResponses.length > 0) {
        msg.adminResponses.forEach((response, index) => {
          messages.push({
            id: `admin-${msg._id.toString()}-${index}`,
            userName: "Bella",
            timestamp: response.timestamp || msg.updatedAt,
            text: response.text,
            isAdmin: true,
          })
        })
      }

      return messages
    })

    return NextResponse.json({
      message,
      conversationHistory,
    })
  } catch (error) {
    console.error("Error fetching message:", error)
    return NextResponse.json({ error: "An error occurred while fetching the message" }, { status: 500 })
  }
}

