"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Send } from "lucide-react"
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

export default function WalletPage() {
  const [balance, setBalance] = useState(0)
  const [holdingCoins, setHoldingCoins] = useState([])
  const [tradedCoins, setTradedCoins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [sendAmount, setSendAmount] = useState("")
  const [recipientAddress, setRecipientAddress] = useState("")
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
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


  const handleSend = async (e) => {
    e.preventDefault()
    setIsSendDialogOpen(false)

    // Simulated failing send
    setTimeout(() => {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: "The send operation could not be completed. Please try again later.",
      })
    }, 2000)

    // Reset form
    setSendAmount("")
    setRecipientAddress("")
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
        <Button className="flex-1 sm:flex-none" onClick={() => router.push('/dashboard/add-payment')}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Funds
        </Button>
        <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 sm:flex-none">
              <Send className="mr-2 h-4 w-4" /> Send
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Funds</DialogTitle>
              <DialogDescription>Enter the amount and recipient address to send funds.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSend} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (USD)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Recipient Address</Label>
                <Input
                  id="address"
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter recipient address"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Send
              </Button>
            </form>
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

