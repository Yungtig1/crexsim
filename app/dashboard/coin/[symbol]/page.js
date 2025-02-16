"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line
} from "recharts"
import { ArrowUpDown, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function CoinDetailsPage() {
  const [coinData, setCoinData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userBalance, setUserBalance] = useState(0)
  const [isBuying, setIsBuying] = useState(false)
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [usdAmount, setUsdAmount] = useState("")
  const [tokenAmount, setTokenAmount] = useState("")
  const [activeInput, setActiveInput] = useState(null)
  
  const { symbol } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const buyCardRef = useRef(null)

  // Handle USD input change
  const handleUsdChange = (value) => {
    setActiveInput('usd')
    setUsdAmount(value)
    if (value && coinData?.price) {
      const tokens = parseFloat(value) / coinData.price
      setTokenAmount(tokens.toFixed(6))
    } else {
      setTokenAmount("")
    }
  }

  // Handle token input change
  const handleTokenChange = (value) => {
    setActiveInput('token')
    setTokenAmount(value)
    if (value && coinData?.price) {
      const usd = parseFloat(value) * coinData.price
      setUsdAmount(usd.toFixed(2))
    } else {
      setUsdAmount("")
    }
  }

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/user/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch balance')
      }

      const data = await response.json()
      setUserBalance(data.balance)
    } catch (err) {
      console.error('Error fetching balance:', err)
      toast({
        variant: "destructive",
        title: "Failed to fetch Balance.",
      })
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const coinResponse = await fetch(`/api/cryptocurrencies/${symbol}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (!coinResponse.ok) {
          throw new Error('Failed to fetch coin data')
        }

        const coinData = await coinResponse.json()
        setCoinData(coinData)
        await fetchUserBalance()
      } catch (err) {
        setError(err.message)
        toast({
          variant: "destructive",
          title: err.message,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [symbol, router])

  const handleBuy = async () => {
    if (!usdAmount || parseFloat(usdAmount) <= 0) return

    try {
      setIsBuying(true)
      const token = localStorage.getItem('token')
      const response = await fetch("/api/trade/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          symbol,
          amount: parseFloat(usdAmount),
        }),
      })

      if (response.ok) {
        toast({
          title: "Purchase Successful!",
          description: `You bought ${tokenAmount} ${coinData.symbol}`,
        })
        fetchUserBalance()
        setIsDialogOpen(false)
        setUsdAmount("")
        setTokenAmount("")
      } else {
        const errorData = await response.json()
        toast({
          variant: 'destructive',
          title: `Purchase failed: ${errorData.error}`
        })
      }
    } catch (error) {
      console.error("Error during purchase:", error)
      toast({
        variant: 'destructive',
        title: "An error occurred during the purchase",
      })
    } finally {
      setIsBuying(false)
    }
  }

  const handleOpenBuyCard = () => {
    setIsDialogOpen(true)
    // Wait for the card to be rendered
    setTimeout(() => {
      buyCardRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      })
    }, 100)
  }

  const handleInputFocus = (e) => {
    e.preventDefault()
    e.target.blur()
    setTimeout(() => e.target.focus(), 0)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }

  const BuyForm = () => (
    <div className="space-y-6">
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-medium">1 {coinData.symbol} = ${coinData.price.toFixed(2)}</h3>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">You Pay (USD)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={usdAmount}
              onChange={(e) => handleUsdChange(e.target.value)}
              disabled={isBuying}
              onFocus={handleInputFocus}
            />
            <div className="text-sm text-muted-foreground">
              Balance: ${userBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-background p-2 rounded-full">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">You Receive ({coinData.symbol})</label>
            <Input
              type="number"
              placeholder="0.00"
              value={tokenAmount}
              onChange={(e) => handleTokenChange(e.target.value)}
              disabled={isBuying}
              onFocus={handleInputFocus}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleBuy}
        className="w-full"
        disabled={isBuying || !usdAmount || parseFloat(usdAmount) <= 0}
      >
        {isBuying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Buy Now"
        )}
      </Button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="p-4 flex justify-center items-center h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!coinData) return <div className="p-4">No data available</div>

  return (
    <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(90vh)] md:max-h-[calc(100vh)]">
      <Card>
        <CardHeader>
          <CardTitle>{coinData.name} ({coinData.symbol})</CardTitle>
        </CardHeader>
        <CardContent className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className="text-4xl font-bold mb-4">
              ${coinData.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div className={`text-lg ${coinData.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {coinData.change >= 0 ? '+' : ''}{coinData.change}%
            </div>
          </div>
          {isDesktop ? (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='w-full md:w-60'>Buy {coinData.symbol}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buy {coinData.symbol}</DialogTitle>
                </DialogHeader>
                <BuyForm />
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              className='w-full md:w-60' 
              onClick={handleOpenBuyCard}
            >
              Buy {coinData.symbol}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={coinData.chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.1)"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666' }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#666' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a1a',
                    border: 'none',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: '#fff' }}
                  labelFormatter={formatDate}
                />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#8884d8"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {!isDesktop && isDialogOpen && (
        <Card ref={buyCardRef}>
          <CardHeader>
            <CardTitle>Buy {coinData.symbol}</CardTitle>
          </CardHeader>
          <CardContent>
            <BuyForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}