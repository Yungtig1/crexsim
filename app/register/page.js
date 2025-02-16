"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Copy } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "", otp: "" })
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await response.json()

      if (response.ok) {
        setModalState({
          isOpen: true,
          title: "Registration Successful",
          message: "Your account has been created successfully. Please verify your email using the OTP below:",
          otp: data.otp,
        })
      } else {
        setModalState({
          isOpen: true,
          title: "Registration Failed",
          message: data.error || "An error occurred during registration",
        })
      }
    } catch (error) {
      setModalState({
        isOpen: true,
        title: "Error",
        message: "An error occurred during registration",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyOTP = () => {
    navigator.clipboard.writeText(modalState.otp)
  }

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false })
    if (modalState.otp) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title}>
        <p>{modalState.message}</p>
        {modalState.otp && (
          <div className="mt-4">
            <p className="font-semibold">Your OTP:</p>
            <div className="flex items-center justify-between bg-accent p-2 rounded mt-2">
              <code className="text-lg">{modalState.otp}</code>
              <Button variant="ghost" size="icon" onClick={handleCopyOTP}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        <Button className="w-full mt-4" onClick={closeModal}>
          Close
        </Button>
      </Modal>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src="/Logo.jpeg"
            alt="GW Logo"
            className="w-20 h-16"
          />
        </motion.div>
        <h2 className="text-center text-3xl font-bold tracking-tight mb-8">Create your account</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <motion.div
          className="py-8 px-4 sm:px-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name
              </label>
              <div className="mt-1">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <div className="mt-1 relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="flex w-full justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

