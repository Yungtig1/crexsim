"use client"

import { useState, useRef, useEffect } from "react"
import { Send, X, MessageCircle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useMobile } from "@/hooks/use-mobile"

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "Hi there! How can we help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)
  const [messageIdBeingSent, setMessageIdBeingSent] = useState(null)
  const isMobile = useMobile()

  // Scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      // Reset unread count when chat is opened
      setUnreadCount(0)
    }
  }, [messages, isOpen])

  // Fetch user's support messages when chat opens
  useEffect(() => {
    if (isOpen) {
      fetchUserMessages()

      // Set up polling for new messages every 5 seconds when chat is open
      const interval = setInterval(() => {
        fetchUserMessages(true)
      }, 5000)

      return () => clearInterval(interval)
    } else {
      // When chat is closed, still poll but less frequently
      const interval = setInterval(() => {
        fetchUserMessages(true)
      }, 15000)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  // Add body class to prevent scrolling when chat is open on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.classList.add("overflow-hidden")
    } else {
      document.body.classList.remove("overflow-hidden")
    }

    return () => {
      document.body.classList.remove("overflow-hidden")
    }
  }, [isMobile, isOpen])

  const fetchUserMessages = async (silent = false) => {
    const token = localStorage.getItem("token")
    if (!token) return

    if (!silent) {
      setIsLoading(true)
    }

    try {
      const response = await fetch("/api/support/user-messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()

      // Process messages and add them to the chat
      if (data.length > 0) {
        const chatMessages = [
          {
            id: "welcome",
            text: "Hi there! How can we help you today?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]

        // Track new messages for badge counter
        const newMessagesCount = 0

        data.forEach((msg) => {
          // Skip closed conversations
          if (msg.status === "closed") return

          // Add user message
          chatMessages.push({
            id: `user-${msg._id}`,
            text: msg.message,
            sender: "user",
            timestamp: new Date(msg.createdAt),
          })

          // Add system confirmation message
          chatMessages.push({
            id: `system-${msg._id}`,
            text: "Thanks for reaching out! We've received your message and will get back to you as soon as possible.",
            sender: "bot",
            timestamp: new Date(msg.createdAt),
          })

          // Add admin responses if available
          if (msg.adminResponses && msg.adminResponses.length > 0) {
            msg.adminResponses.forEach((response, index) => {
              chatMessages.push({
                id: `admin-${msg._id}-${index}`,
                text: response.text,
                sender: "admin",
                timestamp: new Date(response.timestamp),
              })
            })
          }
        })

        // If we're in the process of sending a message, don't overwrite the typing indicator
        if (messageIdBeingSent) {
          const filteredMessages = chatMessages.filter(
            (msg) => !msg.id.includes(messageIdBeingSent) || msg.sender === "user",
          )

          // Find the user message we're currently sending
          const userMessageBeingSent = messages.find((msg) => msg.id === messageIdBeingSent)

          // Find the typing indicator
          const typingIndicator = messages.find((msg) => msg.sender === "typing")

          if (userMessageBeingSent && typingIndicator) {
            setMessages([...filteredMessages, userMessageBeingSent, typingIndicator])
          } else {
            setMessages(chatMessages)
            setMessageIdBeingSent(null)
          }
        } else {
          setMessages(chatMessages)
        }

        // Update badge counter only if chat is closed
        if (!isOpen) {
          // Simple approach: just show that there are messages
          setUnreadCount(1)
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      if (!silent) {
        console.error("Failed to load your support messages.")
      }
    } finally {
      if (!silent) {
        setIsLoading(false)
      }
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    // Generate a unique ID for this message
    const messageId = `user-${Date.now()}`
    setMessageIdBeingSent(messageId)

    // Add user message to chat
    const userMessage = {
      id: messageId,
      text: newMessage,
      sender: "user",
      timestamp: new Date(),
    }

    // Add typing indicator immediately after user message
    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: `typing-${Date.now()}`,
        text: "",
        sender: "typing",
        timestamp: new Date(),
      },
    ])

    setNewMessage("")
    setIsSending(true)

    try {
      // Send message to API
      const response = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ message: newMessage }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Replace typing indicator with confirmation message after a delay
      setTimeout(() => {
        setMessages((prev) => {
          const filtered = prev.filter((msg) => msg.sender !== "typing")
          return [
            ...filtered,
            {
              id: `bot-${Date.now()}`,
              text: "Thanks for reaching out! We've received your message and will get back to you as soon as possible.",
              sender: "bot",
              timestamp: new Date(),
            },
          ]
        })
        setIsSending(false)
        setMessageIdBeingSent(null)

        // Fetch messages to get the server-generated ID
        fetchUserMessages(true)
      }, 1500)
    } catch (error) {
      console.error("Error sending message:", error)
      // Remove typing indicator and show error
      setMessages((prev) => prev.filter((msg) => msg.sender !== "typing"))
      console.error("Failed to send your message. Please try again.")
      setIsSending(false)
      setMessageIdBeingSent(null)
    }
  }

  // Helper function to render avatar based on sender
  const renderAvatar = (sender) => {
    if (sender === "bot" || sender === "typing") {
      return (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C6.25 17.8 6 17.3 6 16.75C6 14.99 7.5 13.5 9.25 13.5H14.75C16.5 13.5 18 14.99 18 16.75C18 17.3 17.75 17.8 17.34 18.12C15.9 19.33 14.03 20 12 20Z"
              fill="currentColor"
            />
          </svg>
        </div>
      )
    } else if (sender === "admin") {
      return (
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 20C9.97 20 8.1 19.33 6.66 18.12C6.25 17.8 6 17.3 6 16.75C6 14.99 7.5 13.5 9.25 13.5H14.75C16.5 13.5 18 14.99 18 16.75C18 17.3 17.75 17.8 17.34 18.12C15.9 19.33 14.03 20 12 20Z"
              fill="#FF69B4"
            />
          </svg>
        </div>
      )
    }
    return null
  }

  // Typing indicator component
  const TypingIndicator = () => (
    <div className="flex space-x-1 items-center px-2">
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
    </div>
  )

  // Render the chat button or full chat interface
  return (
    <>
      {/* Chat button (only shown when chat is closed) */}
      {!isOpen && (
        <Button onClick={() => setIsOpen(true)} className="fixed bottom-3 right-5 rounded-full h-16 w-16 p-0 shadow-lg">
          <MessageCircle className="h-12 w-12" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-none" variant="destructive">
              {unreadCount}
            </Badge>
          )}
        </Button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div
          className={`
            bg-background border border-border shadow-xl flex flex-col z-50
            ${isMobile ? "fixed inset-0 h-[100dvh] w-screen" : "fixed bottom-4 right-4 w-80 sm:w-96 h-96 rounded-lg"}
          `}
        >
          {/* Header */}
          <div className="p-3 border-b border-border flex justify-between items-center bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              {isMobile && (
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h3 className="font-semibold">Support Chat</h3>
            </div>
            {!isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender !== "user" && renderAvatar(message.sender)}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.sender === "admin"
                          ? "bg-pink-900/30 text-foreground border border-pink-500/30"
                          : message.sender === "typing"
                            ? "bg-muted p-2"
                            : "bg-muted"
                    }`}
                  >
                    {message.sender === "admin" && (
                      <div className="text-xs font-semibold text-pink-400 mb-1">Bella (Support)</div>
                    )}
                    {message.sender === "typing" ? (
                      <TypingIndicator />
                    ) : (
                      <>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input - Fixed at bottom for mobile */}
          <div className="sticky bottom-0 left-0 right-0 bg-background border-t border-border">
            <form onSubmit={handleSendMessage} className="p-3 flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isSending}
              />
              <Button type="submit" size="icon" disabled={isSending}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

