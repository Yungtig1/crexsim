"use client"

import { useEffect, useState } from "react"
import { CryptoListItem } from "@/components/dashboard/crypto-list-item"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"

export default function Markets() {
  const [cryptos, setCryptos] = useState([])
  const [category, setCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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

    fetchCryptos()
    const interval = setInterval(fetchCryptos, 60000) // Refresh every minute

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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cryptocurrency Markets</h1>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <div className="relative w-full md:w-64">
          <Input
            type="text"
            placeholder="Search cryptocurrencies"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
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
  )
}

