'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { Star, Plus, Trash2, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Search, Eye } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { StockQuote } from '@/lib/stock-data'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('stockpilot-watchlist')
            return saved ? JSON.parse(saved) : ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS']
        }
        return []
    })
    const [searchQuery, setSearchQuery] = useState('')

    const { data: searchResults } = useSWR<StockQuote[]>(
        searchQuery.length >= 1 ? `/api/stocks?action=search&q=${encodeURIComponent(searchQuery)}` : null,
        fetcher,
        { dedupingInterval: 300 }
    )

    // Fetch quotes for all watchlist symbols
    const { data: quotes } = useSWR<Record<string, StockQuote>>(
        watchlist.length > 0 ? `/api/stocks?action=watchlist&symbols=${watchlist.join(',')}` : null,
        async () => {
            const results: Record<string, StockQuote> = {}
            await Promise.all(
                watchlist.map(async (sym) => {
                    try {
                        const res = await fetch(`/api/stocks?action=quote&symbol=${sym}`)
                        if (res.ok) results[sym] = await res.json()
                    } catch { /* ignore */ }
                })
            )
            return results
        },
        { refreshInterval: 15000 }
    )

    const saveWatchlist = (list: string[]) => {
        setWatchlist(list)
        localStorage.setItem('stockpilot-watchlist', JSON.stringify(list))
    }

    const addToWatchlist = useCallback((symbol: string) => {
        if (!watchlist.includes(symbol)) {
            saveWatchlist([...watchlist, symbol])
        }
        setSearchQuery('')
    }, [watchlist])

    const removeFromWatchlist = useCallback((symbol: string) => {
        saveWatchlist(watchlist.filter(s => s !== symbol))
    }, [watchlist])

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between animate-bounce-in">
                <div className="flex items-center gap-3">
                    <div className="icon-circle icon-circle-orange w-12 h-12">
                        <Star className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Watchlist</h1>
                        <p className="text-sm text-muted-foreground font-medium">{watchlist.length} stocks tracked</p>
                    </div>
                </div>
            </div>

            {/* Search to add */}
            <div className="duo-card p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-[var(--duo-blue)]" />
                    <Input
                        placeholder="Search stocks to add to watchlist..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card border-2 border-border border-b-4 rounded-xl font-semibold text-foreground placeholder:text-muted-foreground focus:border-[var(--duo-blue)] transition-all"
                    />
                </div>
                {searchResults && searchResults.length > 0 && (
                    <div className="mt-3 flex flex-col gap-1 stagger">
                        {searchResults.slice(0, 5).map((stock) => {
                            const displaySym = stock.symbol.replace('.NS', '').replace('.BO', '')
                            const alreadyAdded = watchlist.includes(stock.symbol)
                            return (
                                <button
                                    key={stock.symbol}
                                    onClick={() => addToWatchlist(stock.symbol)}
                                    disabled={alreadyAdded}
                                    className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-[var(--secondary)] transition-all animate-slide-up disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-sm font-extrabold text-foreground">{displaySym}</span>
                                        <span className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">{stock.name}</span>
                                    </div>
                                    {alreadyAdded ? (
                                        <span className="duo-badge duo-badge-green text-[10px]">Added</span>
                                    ) : (
                                        <span className="duo-badge duo-badge-blue text-[10px]"><Plus className="h-3 w-3" /> Add</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Watchlist Grid */}
            {watchlist.length === 0 ? (
                <div className="duo-card flex flex-col items-center justify-center p-16 gap-4 animate-slide-up">
                    <div className="icon-circle icon-circle-orange w-16 h-16 animate-float">
                        <Eye className="h-8 w-8" />
                    </div>
                    <p className="text-base font-extrabold text-foreground">Your watchlist is empty</p>
                    <p className="text-sm text-muted-foreground font-medium">Search above to add stocks</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
                    {watchlist.map((symbol) => {
                        const quote = quotes?.[symbol]
                        const displaySym = symbol.replace('.NS', '').replace('.BO', '')
                        const isUp = (quote?.change ?? 0) >= 0
                        return (
                            <div key={symbol} className="duo-card group flex items-center gap-4 p-4 animate-slide-up">
                                <div className={`icon-circle w-10 h-10 ${isUp ? 'icon-circle-green' : 'icon-circle-red'}`}>
                                    {isUp ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-mono text-sm font-extrabold text-foreground">{displaySym}</span>
                                    <span className="text-xs text-muted-foreground font-medium truncate">{quote?.name || 'Loading...'}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-sm font-extrabold text-foreground">
                                        {quote ? `₹${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '—'}
                                    </span>
                                    {quote && (
                                        <span className={`duo-badge text-[10px] py-0 px-1.5 ${isUp ? 'duo-badge-green' : 'duo-badge-red'}`}>
                                            {isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => removeFromWatchlist(symbol)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duo-btn duo-btn-outline px-2 py-1"
                                >
                                    <Trash2 className="h-3.5 w-3.5 text-[var(--duo-red)]" />
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
