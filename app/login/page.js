"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedPopup } from "@/components/ui/animated-popup"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [popupState, setPopupState] = useState({ show: false, isSuccess: false, message: "" })
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const { token } = await response.json()
        localStorage.setItem("token", token)
        setPopupState({ show: true, isSuccess: true, message: "Login successful" })
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        const data = await response.json()
        setPopupState({ show: true, isSuccess: false, message: data.error || "Login failed" })
      }
    } catch (error) {
      setPopupState({ show: true, isSuccess: false, message: "An error occurred during login" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-4 sm:px-6 lg:px-8">
      {popupState.show && (
        <AnimatedPopup
          isSuccess={popupState.isSuccess}
          message={popupState.message}
          onClose={() => setPopupState({ ...popupState, show: false })}
        />
      )}
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
        <h2 className="text-center text-3xl font-bold tracking-tight mb-8">Sign in to your account</h2>
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
                  autoComplete="current-password"
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
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-2 text-muted-foreground">New to CryptoSim?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="flex w-full justify-center rounded-lg border border-input bg-background px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
              >
                Create an account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

