'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { Target, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Crown, Wallet, BarChart3, Plus, PieChart } from 'lucide-react'
import { TradeDialog, AddFundsDialog } from '@/components/dashboard/trade-dialogs'
import type { StockQuote } from '@/lib/stock-data'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function PortfolioPage() {
    const { data: portfolio, mutate } = useSWR('/api/trade', fetcher, { refreshInterval: 15000 })
    const [tradeDialogOpen, setTradeDialogOpen] = useState(false)
    const [addFundsOpen, setAddFundsOpen] = useState(false)
    const [tradeSymbol, setTradeSymbol] = useState('')
    const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy')

    const holdings = portfolio?.holdings || []
    const profile = portfolio?.profile
    const balance = profile?.balance || 0

    // Fetch live quotes for holdings
    const { data: quotes } = useSWR<Record<string, StockQuote>>(
        holdings.length > 0 ? 'portfolio-quotes' : null,
        async () => {
            const results: Record<string, StockQuote> = {}
            await Promise.all(
                holdings.map(async (h: any) => {
                    try {
                        const res = await fetch(`/api/stocks?action=quote&symbol=${h.symbol}`)
                        if (res.ok) results[h.symbol] = await res.json()
                    } catch { /* ignore */ }
                })
            )
            return results
        },
        { refreshInterval: 15000 }
    )

    const enrichedHoldings = holdings.map((h: any) => {
        const quote = quotes?.[h.symbol]
        const currentPrice = quote?.price || Number(h.avg_price)
        const currentValue = currentPrice * Number(h.shares)
        const costBasis = Number(h.avg_price) * Number(h.shares)
        return {
            ...h,
            currentPrice,
            currentValue,
            gainLoss: currentValue - costBasis,
            gainLossPercent: costBasis > 0 ? ((currentValue - costBasis) / costBasis) * 100 : 0,
        }
    })

    const totalValue = enrichedHoldings.reduce((sum: number, h: any) => sum + h.currentValue, 0)
    const totalCost = enrichedHoldings.reduce((sum: number, h: any) => sum + Number(h.avg_price) * Number(h.shares), 0)
    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
    const netWorth = balance + totalValue
    const isUp = totalGainLoss >= 0

    const handleSell = (symbol: string) => {
        setTradeSymbol(symbol)
        setTradeAction('sell')
        setTradeDialogOpen(true)
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between animate-bounce-in">
                <div className="flex items-center gap-3">
                    <div className="icon-circle icon-circle-blue w-12 h-12">
                        <PieChart className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Portfolio</h1>
                        <p className="text-sm text-muted-foreground font-medium">{holdings.length} holdings</p>
                    </div>
                </div>
                <button onClick={() => setAddFundsOpen(true)} className="duo-btn duo-btn-green text-sm">
                    <Plus className="h-4 w-4" /> Add Funds
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
                <div className="duo-card duo-card-green p-4 animate-slide-up">
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-green w-9 h-9"><Crown className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Net Worth</span>
                            <span className="text-sm font-extrabold text-foreground">₹{netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>
                <div className="duo-card duo-card-blue p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-blue w-9 h-9"><Wallet className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Cash</span>
                            <span className="text-sm font-extrabold text-foreground">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>
                <div className="duo-card duo-card-orange p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-orange w-9 h-9"><BarChart3 className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Invested</span>
                            <span className="text-sm font-extrabold text-foreground">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>
                <div className={`duo-card ${isUp ? 'duo-card-green' : 'duo-card-red'} p-4 animate-slide-up`} style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center gap-3">
                        <div className={`icon-circle w-9 h-9 ${isUp ? 'icon-circle-green' : 'icon-circle-red'}`}><TrendingUp className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Total P/L</span>
                            <span className="text-sm font-extrabold text-foreground">{isUp ? '+' : ''}₹{Math.abs(totalGainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Holdings Table */}
            {holdings.length === 0 ? (
                <div className="duo-card flex flex-col items-center justify-center p-16 gap-4 animate-slide-up">
                    <div className="icon-circle icon-circle-blue w-16 h-16 animate-float">
                        <Target className="h-8 w-8" />
                    </div>
                    <p className="text-base font-extrabold text-foreground">No holdings yet!</p>
                    <p className="text-sm text-muted-foreground font-medium">Go to the Dashboard to search and buy stocks</p>
                </div>
            ) : (
                <div className="duo-card overflow-hidden p-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="grid grid-cols-7 gap-2 border-b-2 border-border px-5 py-3 text-xs font-extrabold text-muted-foreground uppercase tracking-wider bg-[var(--secondary)]">
                        <span>Stock</span>
                        <span className="text-right">Qty</span>
                        <span className="text-right">Avg Cost</span>
                        <span className="text-right">Current</span>
                        <span className="text-right">Value</span>
                        <span className="text-right">P/L</span>
                        <span className="text-right">Action</span>
                    </div>
                    <div className="stagger">
                        {enrichedHoldings.map((h: any, i: number) => {
                            const isPositive = h.gainLoss >= 0
                            const displaySymbol = h.symbol.replace('.NS', '').replace('.BO', '')
                            return (
                                <div
                                    key={h.id}
                                    className="grid grid-cols-7 items-center gap-2 border-b-2 border-border/50 px-5 py-3.5 text-left transition-all last:border-b-0 hover:bg-[var(--secondary)] animate-slide-up"
                                    style={{ animationDelay: `${(i + 3) * 0.05}s` }}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className={`icon-circle w-8 h-8 ${isPositive ? 'icon-circle-green' : 'icon-circle-red'}`}>
                                            {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                                        </div>
                                        <span className="font-mono text-sm font-extrabold text-foreground">{displaySymbol}</span>
                                    </div>
                                    <span className="text-right text-sm text-foreground font-bold">{Number(h.shares).toFixed(2)}</span>
                                    <span className="text-right text-sm text-muted-foreground font-semibold">₹{Number(h.avg_price).toFixed(0)}</span>
                                    <span className="text-right text-sm text-foreground font-bold">₹{h.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                    <span className="text-right text-sm text-foreground font-extrabold">₹{h.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    <span className="flex items-center justify-end">
                                        <span className={`duo-badge text-xs ${isPositive ? 'duo-badge-green' : 'duo-badge-red'}`}>
                                            {isPositive ? '+' : ''}{h.gainLossPercent.toFixed(1)}%
                                        </span>
                                    </span>
                                    <div className="flex justify-end">
                                        <button onClick={() => handleSell(h.symbol)} className="duo-btn duo-btn-red text-xs px-3 py-1">
                                            Sell
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    {/* Totals row */}
                    <div className="grid grid-cols-7 items-center gap-2 px-5 py-3 border-t-2 border-border bg-[var(--secondary)]">
                        <span className="text-xs font-extrabold text-foreground">Total</span>
                        <span />
                        <span />
                        <span />
                        <span className="text-right text-sm font-extrabold text-foreground">₹{totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        <span className="flex items-center justify-end">
                            <span className={`duo-badge text-xs ${isUp ? 'duo-badge-green' : 'duo-badge-red'}`}>
                                {isUp ? '+' : ''}{totalGainLossPercent.toFixed(2)}%
                            </span>
                        </span>
                        <span />
                    </div>
                </div>
            )}

            <TradeDialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen} symbol={tradeSymbol} action={tradeAction} onSuccess={() => mutate()} />
            <AddFundsDialog open={addFundsOpen} onOpenChange={setAddFundsOpen} onSuccess={() => mutate()} />
        </div>
    )
}
