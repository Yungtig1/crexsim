import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose"
import PaymentRequest from "@/models/PaymentRequest"
import { verifyToken } from "@/lib/auth"

export async function POST(request) {
  await dbConnect()

  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]

    if (!token) {
      console.log("No token provided")
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const userId = verifyToken(token)

    if (!userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const data = await request.json()
    const paymentRequest = new PaymentRequest({
      userId: userId,
      amount: data.amount,
      method: data.method,
      status: "pending",
      details:
        data.method === "plaid"
          ? {
              plaidUsername: data.plaidUsername,
              plaidPassword: data.plaidPassword, // Add this line to include the password
            }
          : {
              routingNumber: data.routingNumber,
              accountNumber: data.accountNumber,
            },
    })

    await paymentRequest.save()

    return NextResponse.json({ message: "Payment request submitted successfully" })
  } catch (error) {
    console.error("Error creating payment request:", error)
    return NextResponse.json({ error: "An error occurred while creating the payment request" }, { status: 500 })
  }
}

