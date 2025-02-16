import { PriceChart } from "./price-chart"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

export function CryptoListItem({
  coin,
  symbol,
  price,
  change,
  chartData,
  apy,
  isWatched,
  onWatchlistToggle,
  unrealizedPnL,
  realizedPnL,
  onClick,
}) {
  const isPositive = change >= 0
  const changeColor = isPositive ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
  const router = useRouter()

  const handleNavigateToDetailsPage = () => {
    router.push(`/dashboard/coin/${symbol}`)
  }

  return (
    <div
      className="flex items-center justify-between py-4 hover:bg-accent/50 px-4 rounded-lg cursor-pointer transition-colors"
      onClick={handleNavigateToDetailsPage}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {symbol.slice(0, 2)}
        </div>
        <div>
          <h3 className="font-semibold">{coin}</h3>
          <p className="text-sm text-muted-foreground">{symbol}</p>
          {apy && <p className="text-sm text-muted-foreground">{apy}% APY</p>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <PriceChart data={chartData} color={isPositive ? "#22c55e" : "#ef4444"} />
        <div className="text-right">
          <p className="font-semibold">${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
          <span className={`text-sm px-2 py-0.5 rounded ${changeColor}`}>
            {isPositive ? "↑" : "↓"} {Math.abs(change)}%
          </span>
          {(unrealizedPnL !== undefined || realizedPnL !== undefined) && (
            <p className={`text-sm ${(unrealizedPnL || realizedPnL) >= 0 ? "text-green-500" : "text-red-500"}`}>
              {unrealizedPnL !== undefined ? "Unrealized P/L: " : "Realized P/L: "}$
              {(unrealizedPnL || realizedPnL).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          )}
        </div>
        {onWatchlistToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onWatchlistToggle()
            }}
          >
            <Star className={`h-4 w-4 ${isWatched ? "fill-yellow-400" : ""}`} />
          </Button>
        )}
      </div>
    </div>
  )
}

