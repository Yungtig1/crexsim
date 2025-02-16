"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisitedBefore")
    setIsFirstVisit(!hasVisited)

    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    localStorage.setItem("hasVisitedBefore", "true")
    router.push("/register")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <motion.img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-5wsFVGhZPbco8JqTU15YHaRUvCUz1q.jpeg"
          alt="GW Logo"
          className="w-24 h-24"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            ease: [0, 0.71, 0.2, 1.01],
            scale: {
              type: "spring",
              damping: 5,
              stiffness: 100,
              restDelta: 0.001,
            },
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold tracking-wider"
        >
          CREXSIM
        </motion.div>
      </div>
    )
  }

  if (!isFirstVisit) {
    router.push("/login")
    return null
  }

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <motion.div
          className="flex flex-col flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo and Name */}
          <motion.div
            className="flex items-center justify-center md:justify-start gap-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Logo-5wsFVGhZPbco8JqTU15YHaRUvCUz1q.jpeg"
              alt="GW Logo"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold tracking-wider">CREXSIM</span>
          </motion.div>

          {/* Main content container */}
          <div className="flex flex-col-reverse md:flex-row items-center justify-center gap-2 md:gap-12">
            {/* Text content */}
            <div className="flex flex-col space-y-2 md:space-y-6 md:w-1/2 text-center md:text-left">
              <motion.h1
                className="text-4xl md:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Trade to the Moon and Beyond
              </motion.h1>
              <motion.p
                className="text-md  text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Join the next generation of crypto pioneers.
              </motion.p>
              <motion.button
                className="bg-primary text-primary-foreground rounded-full py-2 px-8 text-lg font-semibold hover:bg-primary/90 transition-colors w-full md:w-auto"
                onClick={handleGetStarted}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Illustration */}
            <motion.div
              className="md:w-1/2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <img
                src="/Moon.png"
                alt="Astronaut on moon with crypto coins"
                className="w-full h-65 md:h-auto max-w-lg object-fit mx-auto"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

