"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"

export default function RespondToSupportPage() {
  const searchParams = useSearchParams()
  const messageId = searchParams.get("messageId")
  const token = searchParams.get("token")

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [message, setMessage] = useState(null)
  const [reply, setReply] = useState("")
  const [conversationHistory, setConversationHistory] = useState([])
  const { toast } = useToast()

  // Verify token and fetch message
  useEffect(() => {
    const verifyTokenAndFetchMessage = async () => {
      if (!messageId || !token) {
        setIsLoading(false)
        setIsError(true)
        return
      }

      try {
        console.log(`Verifying token for message: ${messageId}`)
        console.log(`Token: ${token}`)

        // First verify the token
        const verifyResponse = await fetch("/api/support/verify-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageId, token }),
        })

        const verifyData = await verifyResponse.json()
        console.log("Token verification response:", verifyData)

        if (!verifyData.valid) {
          setIsTokenValid(false)
          setIsLoading(false)
          return
        }

        setIsTokenValid(true)

        // Then fetch the message and conversation history
        const messageResponse = await fetch(`/api/support/message/${messageId}?token=${token}`)

        if (!messageResponse.ok) {
          throw new Error("Failed to fetch message")
        }

        const messageData = await messageResponse.json()
        setMessage(messageData.message)
        setConversationHistory(messageData.conversationHistory || [])
      } catch (error) {
        console.error("Error:", error)
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    verifyTokenAndFetchMessage()
  }, [messageId, token])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!reply.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a reply",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/support/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.ADMIN_SECRET || token}`,
        },
        body: JSON.stringify({
          messageId,
          reply,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send reply")
      }

      setIsSuccess(true)
      toast({
        title: "Success",
        description: "Your reply has been sent to the user",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading message...</p>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Invalid or Expired Token</h1>
        <p className="text-center mb-4">
          The response token is invalid or has expired. Please use the link from the most recent email.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Message ID: {messageId || "Not provided"}
          <br />
          Token: {token ? `${token.substring(0, 10)}...` : "Not provided"}
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-center mb-4">
          An error occurred while loading the message. Please try again or check if the message still exists.
        </p>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Reply Sent Successfully</h1>
        <p className="text-center mb-4">Your reply has been sent to the user and will appear in their support chat.</p>
        <Button onClick={() => window.close()}>Close Window</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Respond to Support Message</CardTitle>
          <CardDescription>{message && `From ${message.userName} (${message.userEmail})`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Conversation History</h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-4 bg-muted/50 rounded-md">
                {conversationHistory.length > 0 ? (
                  conversationHistory.map((msg, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.isAdmin ? "bg-pink-900/30 text-pink-400" : "bg-primary/20"}`}
                        >
                          {msg.isAdmin ? "B" : msg.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{msg.isAdmin ? "Bella (Support)" : msg.userName}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1">{msg.text}</p>
                        </div>
                      </div>
                      {index < conversationHistory.length - 1 && <Separator />}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No previous messages in this conversation.</p>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reply" className="block text-sm font-medium mb-1">
                    Your Reply
                  </label>
                  <Textarea
                    id="reply"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type your response here..."
                    className="min-h-[150px]"
                    required
                  />
                </div>
              </div>
              <CardFooter className="flex justify-end space-x-2 px-0 pt-4">
                <Button type="button" variant="outline" onClick={() => window.close()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reply
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

