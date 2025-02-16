"use client";

import { PriceChart } from "@/components/dashboard/price-chart";
import { useRouter } from "next/navigation";

export function WalletCoinItem({
  coin,
  symbol,
  price,
  change,
  chartData,
  unrealizedPnL,
  realizedPnL,
  onClick,
}) {
  const router = useRouter();
  const isPositive = typeof change === "number" && change >= 0;

  const handleNavigate = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/dashboard/coin/${symbol}`);
    }
  };

  return (
    <div
      onClick={handleNavigate}
      className="flex items-center justify-between py-4 hover:bg-accent/50 px-4 rounded-lg cursor-pointer transition-colors"
    >
      {/* Coin Symbol and Name */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {symbol.slice(0, 2)}
        </div>
        <div>
          <h3 className="font-semibold">{coin}</h3>
          <p className="text-sm text-muted-foreground">{symbol}</p>
        </div>
      </div>

      {/* Price, Change, and P/L Data */}
      <div className="flex items-center gap-4">
        {chartData && (
          <PriceChart data={chartData} color={isPositive ? "#22c55e" : "#ef4444"} />
        )}

        <div className="text-right">
          {/* Price */}
          <p className="font-semibold">
            {price !== undefined
              ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : "N/A"}
          </p>

          {/* Change Percentage */}
          {typeof change === "number" && (
            <span
              className={`text-sm px-2 py-0.5 rounded ${
                isPositive ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
              }`}
            >
              {isPositive ? "↑" : "↓"} {Math.abs(change)}%
            </span>
          )}

          {/* Profit & Loss */}
          {(unrealizedPnL !== undefined || realizedPnL !== undefined) && (
            <p
              className={`text-sm ${
                (unrealizedPnL || realizedPnL) >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {unrealizedPnL !== undefined ? "Unrealized P/L: " : "Realized P/L: "}
              $
              {(unrealizedPnL || realizedPnL) !== undefined
                ? Number(unrealizedPnL || realizedPnL).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })
                : "N/A"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
