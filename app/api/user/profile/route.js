import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import User from "@/models/User"
import { verifyToken } from "@/lib/auth"

export async function GET(request) {
  console.log("Profile route hit")
  
  try {
    await dbConnect()
    console.log("Database connected")
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    console.log("Received token:", token) // Debug log

    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)
    console.log("Verified userId:", userId) // Debug log

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("Searching for user with ID:", userId)
    const user = await User.findById(userId).select("-password")
    
    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("User found, returning data")
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error in profile route:", error)
    return NextResponse.json({ error: "An error occurred while fetching the user profile" }, { status: 500 })
  }
}