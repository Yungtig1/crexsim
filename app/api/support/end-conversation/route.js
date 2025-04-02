import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import SupportMessage from "@/models/SupportMessage"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET(request) {
  await dbConnect()

  try {
    // Get token and userId from query parameters
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const userId = searchParams.get("userId")

    if (!token || !userId) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #09090B;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background-color: #18181B;
                border-radius: 8px;
                max-width: 500px;
              }
              h1 {
                color: #FF4081;
              }
              .error {
                color: #FF4081;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Error</h1>
              <p class="error">Missing required parameters</p>
              <p>Please make sure the URL contains both the token and userId parameters.</p>
            </div>
          </body>
        </html>
      `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Find the user and verify token
    const user = await User.findById(userId)
    if (!user || user.endConversationToken !== token) {
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invalid Token</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #09090B;
                color: white;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .container {
                text-align: center;
                padding: 2rem;
                background-color: #18181B;
                border-radius: 8px;
                max-width: 500px;
              }
              h1 {
                color: #FF4081;
              }
              .error {
                color: #FF4081;
                margin: 20px 0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Invalid Token</h1>
              <p class="error">The token provided is invalid or has expired.</p>
              <p>This may happen if the conversation has already been ended or if the token has expired.</p>
            </div>
          </body>
        </html>
      `,
        {
          headers: {
            "Content-Type": "text/html",
          },
        },
      )
    }

    // Mark all user's messages as closed
    await SupportMessage.updateMany({ userId: userId, status: { $ne: "closed" } }, { $set: { status: "closed" } })

    // Clear the token
    user.endConversationToken = undefined
    await user.save()

    // Notify the user that the conversation has been closed
    await resend.emails.send({
      from: `Bella from Crexsim <support@${process.env.RESEND_DOMAIN || "resend.dev"}>`,
      to: user.email,
      subject: "Support Conversation Closed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090B; color: #FFFFFF;">
          <h2 style="color: #FFFFFF;">Support Conversation Closed</h2>
          <p>Hello ${user.name},</p>
          <p>Your support conversation has been closed. We hope we were able to resolve your issue.</p>
          <p>If you need further assistance, please feel free to start a new conversation through the support chat in the app.</p>
          <p style="margin-top: 30px;">Best regards,<br>Bella<br>Crexsim Support Team</p>
        </div>
      `,
    })

    // Return a simple HTML response
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Conversation Ended</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #09090B;
              color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background-color: #18181B;
              border-radius: 8px;
              max-width: 500px;
            }
            h1 {
              color: #FF69B4;
            }
            .success {
              color: #4CAF50;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Conversation Ended</h1>
            <p class="success">✓ The support conversation with ${user.name} has been successfully closed.</p>
            <p>The user has been notified and will need to start a new conversation for further assistance.</p>
            <p>You can now close this window.</p>
          </div>
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  } catch (error) {
    console.error("Error ending conversation:", error)
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #09090B;
              color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background-color: #18181B;
              border-radius: 8px;
              max-width: 500px;
            }
            h1 {
              color: #FF4081;
            }
            .error {
              color: #FF4081;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error</h1>
            <p class="error">An error occurred while ending the conversation.</p>
            <p>Please try again later or contact the system administrator.</p>
          </div>
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    )
  }
}

