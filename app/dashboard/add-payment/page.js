"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Zap, Building2, ChevronRight, BanknoteIcon as Bank } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

export default function AddPaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [amount, setAmount] = useState("")
  const [plaidUsername, setPlaidUsername] = useState("")
  const [plaidPassword, setPlaidPassword] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleMethodSelect = (method) => {
    setSelectedMethod(method)
    setStep(2)
  }

  const handleNext = () => {
    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to deposit.",
      })
      return
    }
    setStep(3)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/payment/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number.parseFloat(amount),
          method: selectedMethod,
          ...(selectedMethod === "plaid"
            ? {
                plaidUsername,
                plaidPassword,
              }
            : {
                routingNumber,
                accountNumber,
              }),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit payment request")
      }

      setShowSuccessDialog(true)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit payment request. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setShowSuccessDialog(false)
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-6">Add payment method</h1>

        {step === 1 && (
          <div className="space-y-4">
            <Card
              className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                selectedMethod === "plaid" ? "border-primary" : ""
              }`}
              onClick={() => handleMethodSelect("plaid")}
            >
              <div className="flex items-start space-x-4">
                <Bank className="h-6 w-6 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">Bank account instantly via Plaid</h3>
                    <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full flex items-center">
                      <Zap className="h-3 w-3 mr-1" />
                      Recommended
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Deposit and withdraw</li>
                    <li>• Buy crypto instantly</li>
                    <li>• Pay credit card bills (US banks only)</li>
                  </ul>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>

            <Card
              className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                selectedMethod === "manual" ? "border-primary" : ""
              }`}
              onClick={() => handleMethodSelect("manual")}
            >
              <div className="flex items-start space-x-4">
                <Building2 className="h-6 w-6 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold">Bank account manually</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Deposit and withdraw</li>
                    <li>• Buy crypto instantly</li>
                  </ul>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Enter Amount</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount to deposit (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleNext}>Next</Button>
              </div>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {selectedMethod === "plaid" ? "Enter Plaid Details" : "Enter Bank Details"}
            </h2>
            <div className="space-y-4">
              {selectedMethod === "plaid" ? (
                <>
                  <div>
                    <Label htmlFor="username">Plaid Username</Label>
                    <Input id="username" value={plaidUsername} onChange={(e) => setPlaidUsername(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="password">Plaid Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={plaidPassword}
                      onChange={(e) => setPlaidPassword(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="routing">Routing Number</Label>
                    <Input id="routing" value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="account">Account Number</Label>
                    <Input id="account" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    "Make Payment"
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Dialog open={showSuccessDialog} onOpenChange={handleClose}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Payment Request Submitted</DialogTitle>
              <DialogDescription>
                {selectedMethod === "plaid"
                  ? "Your payment is being processed. Your balance will be reflected in a few minutes."
                  : "Your payment is being processed. Your balance will be reflected within one working day."}
              </DialogDescription>
            </DialogHeader>
            <Button onClick={handleClose}>Close</Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

