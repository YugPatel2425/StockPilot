'use client'

import useSWR from 'swr'
import { TrendingUp, TrendingDown, Flame, ThumbsDown } from 'lucide-react'
import type { StockQuote } from '@/lib/stock-data'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function MarketOverview({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
  const { data: movers } = useSWR<{ gainers: StockQuote[]; losers: StockQuote[] }>(
    '/api/stocks?action=movers',
    fetcher,
    { refreshInterval: 30000 }
  )

  if (!movers) return (
    <div className="duo-card flex flex-col items-center gap-3 py-8">
      <div className="icon-circle icon-circle-green w-12 h-12 animate-float">
        <TrendingUp className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted-foreground font-bold">Loading market data...</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-5">
      {/* Gainers */}
      <div className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
          <div className="icon-circle icon-circle-green w-7 h-7">
            <Flame className="h-3.5 w-3.5" />
          </div>
          Top Gainers
        </h3>
        <div className="duo-card duo-card-green overflow-hidden p-0 stagger">
          {movers.gainers.map((stock) => {
            const displaySymbol = stock.symbol.replace('.NS', '').replace('.BO', '')
            return (
              <button
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between w-full border-b-2 border-[hsl(145_40%_85%)] px-4 py-2.5 text-left transition-all duration-150 last:border-b-0 hover:bg-[hsl(145_50%_90%)] active:bg-[hsl(145_50%_85%)] group"
              >
                <div className="flex items-center gap-3">
                  <div className="icon-circle icon-circle-green w-8 h-8">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-extrabold text-foreground">{displaySymbol}</span>
                    <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">{stock.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-extrabold text-foreground">₹{stock.price.toFixed(0)}</span>
                  <span className="duo-badge duo-badge-green text-[10px] py-0 px-1.5">
                    +{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Losers */}
      <div className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
          <div className="icon-circle icon-circle-red w-7 h-7">
            <ThumbsDown className="h-3.5 w-3.5" />
          </div>
          Top Losers
        </h3>
        <div className="duo-card duo-card-red overflow-hidden p-0 stagger">
          {movers.losers.map((stock) => {
            const displaySymbol = stock.symbol.replace('.NS', '').replace('.BO', '')
            return (
              <button
                key={stock.symbol}
                onClick={() => onSelectStock(stock.symbol)}
                className="flex items-center justify-between w-full border-b-2 border-[hsl(0_40%_88%)] px-4 py-2.5 text-left transition-all duration-150 last:border-b-0 hover:bg-[hsl(0_50%_93%)] active:bg-[hsl(0_50%_90%)] group"
              >
                <div className="flex items-center gap-3">
                  <div className="icon-circle icon-circle-red w-8 h-8">
                    <TrendingDown className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-extrabold text-foreground">{displaySymbol}</span>
                    <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[100px]">{stock.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-extrabold text-foreground">₹{stock.price.toFixed(0)}</span>
                  <span className="duo-badge duo-badge-red text-[10px] py-0 px-1.5">
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
