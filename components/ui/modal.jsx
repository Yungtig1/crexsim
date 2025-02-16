"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Modal({ isOpen, onClose, title, children }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ type: "spring", damping: 25, stiffness: 500 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg z-50 p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

