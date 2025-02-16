"use client"

import { useEffect, useState } from "react"
import { CryptoListItem } from "@/components/dashboard/crypto-list-item"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Search, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Dashboard() {
  const [cryptos, setCryptos] = useState([])
  const [balance, setBalance] = useState(0)
  const [category, setCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const router = useRouter()


  useEffect(() => {
    const fetchCryptos = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/cryptocurrencies")
        const data = await response.json()
        setCryptos(data)
      } catch (error) {
        console.error("Error fetching cryptocurrencies:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token')
          const response = await fetch("/api/user/wallet", {
            headers: {
              'Authorization' : `Bearer ${token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            setBalance(data.balance)
          }
      } catch (error) {
        console.error("Error fetching user data:", error)
      }
    }

    fetchBalance()

    fetchCryptos()
    const interval = setInterval(fetchCryptos, 600000) // Refresh every minute

    return () => clearInterval(interval)
  }, [])

  const filterCryptos = () => {
    let filtered = cryptos

    // Apply category filter
    switch (category) {
      case "new":
        filtered = filtered.filter((crypto) => {
          const createdAt = new Date(crypto.createdAt)
          const now = new Date()
          const diffHours = (now - createdAt) / (1000 * 60 * 60)
          return diffHours <= 24
        })
        break
      case "gainers":
        filtered = filtered.filter((crypto) => crypto.change > 0).sort((a, b) => b.change - a.change)
        break
      case "losers":
        filtered = filtered.filter((crypto) => crypto.change < 0).sort((a, b) => a.change - b.change)
        break
      case "watchlist":
        filtered = filtered.filter((crypto) => crypto.isWatched)
        break
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (crypto) =>
          crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    return filtered
  }

  const toggleWatchlist = async (symbol) => {
    try {
      const response = await fetch(`/api/watchlist/${symbol}`, { method: "POST" })
      if (response.ok) {
        setCryptos(
          cryptos.map((crypto) => (crypto.symbol === symbol ? { ...crypto, isWatched: !crypto.isWatched } : crypto)),
        )
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error)
    }
  }



  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center p-4">
          <Image src="/Logo.jpeg" alt="Crexsim Logo" width={50} height={50} className="md:hidden" />
          <div className="flex-1 mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search cryptocurrencies"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-accent rounded-full py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          <Link href='/dashboard/profile' className="p-2 hover:bg-accent rounded-full">
            <User className="md:hidden"/>
          </Link>
        </div>
      </div>

      <div className="p-4">
        {/* Balance Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg text-muted-foreground mb-2">Total Balance</h2>
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-bold">${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</h1>
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-muted-foreground">
                <path fill="none" stroke="currentColor" strokeWidth="2" d="M9 18l6-6-6-6" />
              </svg>
            </div>
          </div>
              <Button className="mt-4 md:mt-0" onClick={() => router.push('/dashboard/add-payment')}>Add Cash</Button>
        </div>

        {/* Prices Section */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tokens</h2>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="gainers">Gainers</SelectItem>
              <SelectItem value="losers">Losers</SelectItem>
              <SelectItem value="watchlist">Watchlist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Crypto List */}
        <div className="space-y-2 overflow-y-auto max-h-[calc(80vh)] md:max-h-[calc(90vh)]">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            filterCryptos().map((crypto) => (
              <CryptoListItem
                key={crypto.symbol}
                coin={crypto.name}
                symbol={crypto.symbol}
                price={crypto.price}
                change={crypto.change}
                chartData={crypto.chartData}
                apy={crypto.apy}
                isWatched={crypto.isWatched}
                onWatchlistToggle={() => toggleWatchlist(crypto.symbol)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

