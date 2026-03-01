'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react'
import useSWR from 'swr'
import type { StockQuote } from '@/lib/stock-data'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function StockSearch({ onSelectStock }: { onSelectStock: (symbol: string) => void }) {
  const [query, setQuery] = useState('')
  const { data: results } = useSWR<StockQuote[]>(
    query.length >= 1 ? `/api/stocks?action=search&q=${encodeURIComponent(query)}` : null,
    fetcher,
    { dedupingInterval: 300 }
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-[var(--duo-blue)]" />
        <Input
          placeholder="Search stocks (e.g. RELIANCE, TCS)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-card border-2 border-border border-b-4 rounded-xl font-semibold text-foreground placeholder:text-muted-foreground focus:border-[var(--duo-blue)] transition-all duration-200"
        />
      </div>
      {results && results.length > 0 && (
        <div className="duo-card overflow-hidden p-0 stagger">
          {results.map((stock) => {
            const displaySymbol = stock.symbol.replace('.NS', '').replace('.BO', '')
            const isUp = stock.change >= 0
            return (
              <button
                key={stock.symbol}
                onClick={() => {
                  onSelectStock(stock.symbol)
                  setQuery('')
                }}
                className="flex items-center justify-between w-full px-4 py-3 text-left transition-all duration-150 hover:bg-[var(--secondary)] active:bg-[var(--muted)] first:rounded-t-[14px] last:rounded-b-[14px] border-b-2 border-border/50 last:border-b-0 group animate-slide-up"
              >
                <div className="flex items-center gap-3">
                  <div className={`icon-circle w-9 h-9 ${isUp ? 'icon-circle-green' : 'icon-circle-red'}`}>
                    {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-sm font-extrabold text-foreground">{displaySymbol}</span>
                    <span className="text-xs text-muted-foreground font-medium truncate max-w-[130px]">{stock.name}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-extrabold text-foreground">₹{stock.price.toFixed(2)}</span>
                  <span className={`duo-badge text-[10px] py-0 px-1.5 ${isUp ? 'duo-badge-green' : 'duo-badge-red'}`}>
                    {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
      {query.length >= 1 && results && results.length === 0 && (
        <div className="duo-card flex flex-col items-center gap-3 py-8">
          <div className="icon-circle icon-circle-orange w-12 h-12">
            <Search className="h-5 w-5" />
          </div>
          <p className="text-sm font-bold text-muted-foreground">No stocks found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  )
}
