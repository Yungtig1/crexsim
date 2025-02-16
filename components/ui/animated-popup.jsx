"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X } from "lucide-react"

export function AnimatedPopup({ isSuccess, message, onClose }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            isSuccess ? "bg-green-500" : "bg-red-500"
          } text-white flex items-center space-x-2`}
        >
          {isSuccess ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

