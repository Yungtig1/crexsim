"use client"

import { useEffect, useRef } from "react"

export function PriceChart({ data, color = "#3b82f6", width = 100, height = 30 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw line
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5

    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - Math.min(...data)) / (Math.max(...data) - Math.min(...data))) * height,
    }))

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })

    ctx.stroke()
  }, [data, color, width, height])

  return <canvas ref={canvasRef} width={width} height={height} />
}

