"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, BanknoteIcon as Bank, Building2, ArrowDownToLine } from "lucide-react"
import { WalletCoinItem } from "@/components/dashboard/wallet-coin-item"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [holdingCoins, setHoldingCoins] = useState([])
  const [tradedCoins, setTradedCoins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("")
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [withdrawStep, setWithdrawStep] = useState(1)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    } else {
      fetchUserData()
    }
  }, [router])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        throw new Error("No token found")
      }
      const response = await fetch("/api/user/wallet", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 401) {
        //Token is invalid or expired
        localStorage.removeItem('token')
        router.push('/login')
      }
      
      if (!response.ok) {
        throw new Error("Failed to fetch wallet data")
      }

      const data = await response.json()
      setBalance(data.balance)
      setHoldingCoins(data.holdingCoins)
      setTradedCoins(data.tradedCoins)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An unexpected error occurred.",
      })
      setBalance(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setIsWithdrawDialogOpen(false)

    toast({
      variant: "destructive",
      title: "Withdrawal Failed",
      description:
        "We couldn't process your withdrawal at this time. Please contact support via the chat for assistance.",
    })

    // Reset form
    setWithdrawAmount("")
    setWithdrawMethod("")
    setWithdrawStep(1)
  }

  const handleDialogClose = () => {
    setIsWithdrawDialogOpen(false)
    setWithdrawStep(1)
    setWithdrawAmount("")
    setWithdrawMethod("")
  }

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {balance === null ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : (
              `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        <Button className="flex-1 sm:flex-none" onClick={() => router.push("/dashboard/add-payment")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Funds
        </Button>
        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 sm:flex-none" onClick={() => setIsWithdrawDialogOpen(true)}>
              <ArrowDownToLine className="mr-2 h-4 w-4" /> Withdraw
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>
                {withdrawStep === 1 ? "Select your withdrawal method" : "Enter the amount you want to withdraw"}
              </DialogDescription>
            </DialogHeader>
            {withdrawStep === 1 ? (
              <div className="space-y-4">
                <RadioGroup value={withdrawMethod} onValueChange={setWithdrawMethod}>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="plaid" id="plaid" />
                    <Label htmlFor="plaid" className="flex items-center cursor-pointer flex-1">
                      <Bank className="h-5 w-5 mr-2" />
                      Plaid Bank Account
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 rounded-lg border cursor-pointer hover:bg-accent">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="flex items-center cursor-pointer flex-1">
                      <Building2 className="h-5 w-5 mr-2" />
                      Manual Bank Account
                    </Label>
                  </div>
                </RadioGroup>
                <Button
                  className="w-full"
                  onClick={() => withdrawMethod && setWithdrawStep(2)}
                  disabled={!withdrawMethod}
                >
                  Continue
                </Button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setWithdrawStep(1)}>
                    Back
                  </Button>
                  <Button type="submit">Withdraw</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="holding" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holding">Holding</TabsTrigger>
          <TabsTrigger value="traded">Traded</TabsTrigger>
        </TabsList>
        <TabsContent value="holding">
          <div className="space-y-4">
            {holdingCoins.map((coin) => (
              <WalletCoinItem
                key={coin.symbol}
                coin={coin.name}
                symbol={coin.symbol}
                price={coin.price}
                change={coin.change}
                chartData={coin.chartData}
                unrealizedPnL={coin.unrealizedPnL}
                onClick={() => router.push(`/dashboard/coin/${coin.symbol}`)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="traded">
          <div className="space-y-4">
            {tradedCoins.map((coin) => (
              <WalletCoinItem
                key={coin.symbol}
                coin={coin.name}
                symbol={coin.symbol}
                price={coin.price}
                change={coin.change}
                chartData={coin.chartData}
                realizedPnL={coin.realizedPnL}
                onClick={() => router.push(`/dashboard/coin/${coin.symbol}`)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

