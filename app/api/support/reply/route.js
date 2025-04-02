import { NextResponse } from "next/server"
import { Resend } from "resend"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import SupportMessage from "@/models/SupportMessage"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  await dbConnect()

  try {
    // Verify the request is authorized
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]

    // Get the message ID and reply from the request
    const { messageId, reply } = await request.json()
    if (!messageId || !reply) {
      return NextResponse.json({ error: "Message ID and reply are required" }, { status: 400 })
    }

    // Find the support message
    const supportMessage = await SupportMessage.findById(messageId)
    if (!supportMessage) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    // Verify token - either admin secret or response token
    const isAdminToken = token === process.env.ADMIN_SECRET
    const isResponseToken = supportMessage.responseToken && token === supportMessage.responseToken

    if (!isAdminToken && !isResponseToken) {
      return NextResponse.json({ error: "Invalid authorization token" }, { status: 401 })
    }

    // Update message status and add response
    supportMessage.status = "responded"
    supportMessage.adminResponses = supportMessage.adminResponses || []
    supportMessage.adminResponses.push({
      text: reply,
      timestamp: new Date()
    })
    supportMessage.updatedAt = new Date()
    await supportMessage.save()

    // Find the user
    const user = await User.findById(supportMessage.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Format all responses for email
    const responsesHtml = supportMessage.adminResponses.map(response => `
      <div style="background-color: #27272A; padding: 15px; border-radius: 5px; border-left: 4px solid #FF69B4; margin-top: 15px;">
        <p style="font-style: italic; color: #A1A1AA;">Our response (${new Date(response.timestamp).toLocaleString()}):</p>
        <p>${response.text}</p>
      </div>
    `).join("")

    // Send email to user with all responses using Resend
    const { data, error } = await resend.emails.send({
      from: `Bella from Crexsim <support@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
      to: user.email,
      subject: "Response to Your Support Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090B; color: #FFFFFF;">
          <h2 style="color: #FFFFFF;">Support Response</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for contacting Crexsim Support. Here are our responses to your inquiry:</p>
          
          <div style="background-color: #27272A; padding: 15px; border-radius: 5px; border-left: 4px solid #FF69B4;">
            <p style="font-style: italic; color: #A1A1AA;">Your original message:</p>
            <p>${supportMessage.message}</p>
          </div>
          
          ${responsesHtml}
          
          <p style="margin-top: 20px;">If you have any further questions, please don't hesitate to reply to this email or open the support chat in the app.</p>
          
          <p style="margin-top: 30px;">Best regards,<br>Bella<br>Crexsim Support Team</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email with Resend:", error)
      return NextResponse.json({ error: "Failed to send email reply" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Reply sent successfully",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("Error sending reply:", error)
    return NextResponse.json({ error: "An error occurred while sending the reply" }, { status: 500 })
  }
}