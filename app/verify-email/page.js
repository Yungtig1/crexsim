"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AnimatedPopup } from "@/components/ui/animated-popup"

export default function VerifyEmail() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [popupState, setPopupState] = useState({ show: false, isSuccess: false, message: "" })
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const email = searchParams.get("email")
    if (!email) {
      setPopupState({ show: true, isSuccess: false, message: "No email provided" })
    }
  }, [searchParams])

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Move to next input if value is entered
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const email = searchParams.get("email")
    const otpString = otp.join("")

    setIsLoading(true)
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString }),
      })

      const data = await response.json()

      if (response.ok) {
        setPopupState({ show: true, isSuccess: true, message: data.message })
        setTimeout(() => router.push("/login"), 3000)
      } else {
        setPopupState({ show: true, isSuccess: false, message: data.error })
      }
    } catch (error) {
      setPopupState({ show: true, isSuccess: false, message: "An error occurred during verification" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-background">
      {popupState.show && (
        <AnimatedPopup
          isSuccess={popupState.isSuccess}
          message={popupState.message}
          onClose={() => setPopupState({ ...popupState, show: false })}
        />
      )}
      <div className="bg-card shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Email Verification</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-between mb-6">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center text-2xl"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
              />
            ))}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
        </form>
      </div>
    </div>
  )
}

