import { NextResponse } from "next/server"
import { Resend } from "resend"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import SupportMessage from "@/models/SupportMessage"
import { verifyToken } from "@/lib/auth"
import crypto from "crypto"

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
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

        // Get user details
        const user = await User.findById(userId).select("name email")
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Get message content
        const { message } = await request.json()
        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        // Generate a unique response token
        const responseToken = crypto.randomBytes(32).toString("hex")
        console.log(`Generated response token: ${responseToken}`)

        // Save message to database with the response token
        const supportMessage = new SupportMessage({
            userId,
            message,
            userEmail: user.email,
            userName: user.name,
            status: "pending",
            responseToken: responseToken, // Save the response token
        })

        // Save the message and wait for it to complete
        const savedMessage = await supportMessage.save()

        // Verify the token was saved correctly
        console.log(`Saved message ID: ${savedMessage._id}`)
        console.log(`Saved response token: ${savedMessage.responseToken}`)

        // Double-check by fetching the message from the database
        const verifyMessage = await SupportMessage.findById(savedMessage._id)
        console.log(`Verified response token: ${verifyMessage.responseToken}`)

        // Get conversation history for this user
        const userMessages = await SupportMessage.find({
            userId: userId,
            status: { $ne: "closed" },
        }).sort({ createdAt: 1 })

        // Format conversation history for email
        let conversationHtml = ""
        userMessages.forEach((msg, index) => {
            const isCurrentMessage = msg._id.toString() === savedMessage._id.toString()
            const messageStyle = isCurrentMessage
                ? "border-left: 4px solid #0070f3; background-color: #27272A;"
                : "background-color: #18181B;"

            conversationHtml += `
        <div style="padding: 15px; border-radius: 5px; margin: 15px 0; ${messageStyle}">
          <p style="font-style: italic; color: #A1A1AA; margin-bottom: 5px;">
            <strong>${user.name}</strong> - ${new Date(msg.createdAt).toLocaleString()}:
          </p>
          <p>${msg.message}</p>
          
          ${msg.adminResponse
                    ? `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333;">
              <p style="font-style: italic; color: #A1A1AA; margin-bottom: 5px;">
                <strong>Bella (Support)</strong> - ${new Date(msg.updatedAt).toLocaleString()}:
              </p>
              <p>${msg.adminResponse}</p>
            </div>
          `
                    : ""
                }
        </div>
      `
        })

        // Generate unique token for ending the conversation
        const endConversationToken = crypto.randomBytes(32).toString("hex")

        // Store the token temporarily
        user.endConversationToken = endConversationToken
        await user.save()

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

        // Send email notification using Resend
        const { data, error } = await resend.emails.send({
            from: `Crexsim Support <support@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Support Request from ${user.name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090B; color: #FFFFFF;">
          <h2 style="color: #FFFFFF;">New Support Request</h2>
          <p><strong>From:</strong> ${user.name} (${user.email})</p>
          <p><strong>Message ID:</strong> ${savedMessage._id}</p>
          

          
          <h3 style="color: #FFFFFF; margin-top: 20px;">Conversation History</h3>
          ${conversationHtml}

            <div style="margin-top: 20px; text-align: center;">
            <a href="${appUrl}/admin-support/respond?messageId=${savedMessage._id}&token=${responseToken}" 
               style="display: inline-block; background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Respond to Message
            </a>
          </div>
          
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${appUrl}/api/support/end-conversation?token=${endConversationToken}&userId=${userId}" 
               style="display: inline-block; background-color: #FF4081; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              End Conversation
            </a>
            <p style="font-size: 12px; color: #A1A1AA; margin-top: 10px;">
              Clicking this button will close this conversation thread. The user will need to start a new conversation for further assistance.
            </p>
          </div>
        </div>
      `,
        })

        if (error) {
            console.error("Error sending email with Resend:", error)
            return NextResponse.json({ error: "Support message saved but failed to notify admin" }, { status: 500 })
        }

        return NextResponse.json({
            message: "Support message sent successfully",
            messageId: savedMessage._id,
            emailId: data?.id,
        })
    } catch (error) {
        console.error("Error sending support message:", error)
        return NextResponse.json({ error: "An error occurred while sending your message" }, { status: 500 })
    }
}

