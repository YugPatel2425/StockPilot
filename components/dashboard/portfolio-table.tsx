'use client'

import { TrendingUp, TrendingDown, Target, ArrowUp, ArrowDown } from 'lucide-react'
import type { StockQuote } from '@/lib/stock-data'

interface Holding {
  id: string
  symbol: string
  shares: number
  avg_price: number
}

export function PortfolioTable({ holdings, onSelectStock, onSell }: {
  holdings: (Holding & { currentPrice?: number; currentValue?: number; gainLoss?: number; gainLossPercent?: number })[]
  onSelectStock: (symbol: string) => void
  onSell: (symbol: string) => void
}) {
  if (holdings.length === 0) {
    return (
      <div className="duo-card flex flex-col items-center justify-center p-12 gap-4">
        <div className="icon-circle icon-circle-blue w-16 h-16 animate-float">
          <Target className="h-8 w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-base font-extrabold text-foreground">No holdings yet!</p>
          <p className="text-sm text-muted-foreground font-medium">Search and buy stocks to start your journey</p>
        </div>
      </div>
    )
  }

  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0)
  const totalCost = holdings.reduce((sum, h) => sum + (Number(h.avg_price) * Number(h.shares)), 0)
  const totalGainLoss = totalValue - totalCost
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
  const isUp = totalGainLoss >= 0

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
          <div className="icon-circle icon-circle-blue w-7 h-7">
            <Target className="h-3.5 w-3.5" />
          </div>
          Your Holdings
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground">
            Total: <span className="text-foreground">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </span>
          <span className={`duo-badge ${isUp ? 'duo-badge-green' : 'duo-badge-red'}`}>
            {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {isUp ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="duo-card overflow-hidden p-0">
        <div className="grid grid-cols-6 gap-2 border-b-2 border-border px-4 py-3 text-xs font-extrabold text-muted-foreground uppercase tracking-wider bg-[var(--secondary)]">
          <span>Stock</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Avg Cost</span>
          <span className="text-right">Value</span>
          <span className="text-right">P/L</span>
          <span className="text-right">Action</span>
        </div>
        <div className="stagger">
          {holdings.map((h) => {
            const isPositive = (h.gainLoss || 0) >= 0
            const displaySymbol = h.symbol.replace('.NS', '').replace('.BO', '')
            return (
              <div
                key={h.id}
                className="grid w-full grid-cols-6 items-center gap-2 border-b-2 border-border/50 px-4 py-3 text-left transition-all duration-150 last:border-b-0 hover:bg-[var(--secondary)] active:bg-[var(--muted)] animate-slide-up"
              >
                <button onClick={() => onSelectStock(h.symbol)} className="text-left flex items-center gap-2">
                  <div className={`icon-circle w-7 h-7 ${isPositive ? 'icon-circle-green' : 'icon-circle-red'}`}>
                    {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                  </div>
                  <span className="font-mono text-sm font-extrabold text-foreground hover:text-[var(--duo-blue)] transition-colors">{displaySymbol}</span>
                </button>
                <span className="text-right text-sm text-foreground font-bold">{Number(h.shares).toFixed(2)}</span>
                <span className="text-right text-sm text-muted-foreground font-semibold">₹{Number(h.avg_price).toFixed(0)}</span>
                <span className="text-right text-sm text-foreground font-extrabold">₹{(h.currentValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="flex items-center justify-end">
                  <span className={`duo-badge text-xs ${isPositive ? 'duo-badge-green' : 'duo-badge-red'}`}>
                    {isPositive ? '+' : ''}{(h.gainLossPercent || 0).toFixed(1)}%
                  </span>
                </span>
                <div className="flex justify-end">
                  <button onClick={() => onSell(h.symbol)} className="duo-btn duo-btn-red text-xs px-3 py-1">
                    Sell
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
