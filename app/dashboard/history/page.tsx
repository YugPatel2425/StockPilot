'use client'

import useSWR from 'swr'
import { Clock, ShoppingCart, ArrowUpRight, ArrowDownRight, Wallet, Filter, TrendingUp, TrendingDown } from 'lucide-react'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

function timeAgo(dateStr: string) {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMs / 3600000)
    const diffDay = Math.floor(diffMs / 86400000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function HistoryPage() {
    const { data: portfolio } = useSWR('/api/trade', fetcher)
    const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'deposit'>('all')

    const transactions = portfolio?.transactions || []
    const filtered = filter === 'all' ? transactions : transactions.filter((t: any) => t.type === filter)

    const totalBuys = transactions.filter((t: any) => t.type === 'buy').length
    const totalSells = transactions.filter((t: any) => t.type === 'sell').length
    const totalDeposits = transactions.filter((t: any) => t.type === 'deposit').length

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between animate-bounce-in">
                <div className="flex items-center gap-3">
                    <div className="icon-circle icon-circle-orange w-12 h-12">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Transaction History</h1>
                        <p className="text-sm text-muted-foreground font-medium">{transactions.length} transactions</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 stagger">
                <div className="duo-card duo-card-green p-4 animate-slide-up">
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-green w-9 h-9"><ShoppingCart className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Buys</span>
                            <span className="text-lg font-extrabold text-foreground">{totalBuys}</span>
                        </div>
                    </div>
                </div>
                <div className="duo-card duo-card-red p-4 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-red w-9 h-9"><TrendingDown className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Sells</span>
                            <span className="text-lg font-extrabold text-foreground">{totalSells}</span>
                        </div>
                    </div>
                </div>
                <div className="duo-card duo-card-blue p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-blue w-9 h-9"><Wallet className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Deposits</span>
                            <span className="text-lg font-extrabold text-foreground">{totalDeposits}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                <Filter className="h-4 w-4 text-muted-foreground" />
                {(['all', 'buy', 'sell', 'deposit'] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`duo-btn text-xs px-3 py-1.5 ${filter === f
                                ? f === 'buy' ? 'duo-btn-green' : f === 'sell' ? 'duo-btn-red' : f === 'deposit' ? 'duo-btn-blue' : 'duo-btn-green'
                                : 'duo-btn-outline'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${f === 'buy' ? totalBuys : f === 'sell' ? totalSells : totalDeposits})`}
                    </button>
                ))}
            </div>

            {/* Transaction List */}
            {filtered.length === 0 ? (
                <div className="duo-card flex flex-col items-center justify-center p-16 gap-4 animate-slide-up">
                    <div className="icon-circle icon-circle-orange w-16 h-16 animate-float">
                        <Clock className="h-8 w-8" />
                    </div>
                    <p className="text-base font-extrabold text-foreground">No transactions yet</p>
                    <p className="text-sm text-muted-foreground font-medium">Start trading to see your history here</p>
                </div>
            ) : (
                <div className="flex flex-col gap-2 stagger">
                    {filtered.map((tx: any, i: number) => {
                        const isBuy = tx.type === 'buy'
                        const isSell = tx.type === 'sell'
                        const isDeposit = tx.type === 'deposit'
                        const displaySymbol = tx.symbol?.replace('.NS', '').replace('.BO', '')

                        return (
                            <div
                                key={tx.id}
                                className="duo-card flex items-center gap-4 p-4 animate-slide-up"
                                style={{ animationDelay: `${i * 0.04}s` }}
                            >
                                <div className={`icon-circle w-10 h-10 ${isBuy ? 'icon-circle-green' : isSell ? 'icon-circle-red' : 'icon-circle-blue'}`}>
                                    {isBuy ? <ArrowUpRight className="h-5 w-5" /> : isSell ? <ArrowDownRight className="h-5 w-5" /> : <Wallet className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-extrabold text-foreground">
                                            {isDeposit ? 'Added Funds' : `${isBuy ? 'Bought' : 'Sold'} ${displaySymbol}`}
                                        </span>
                                        <span className={`duo-badge text-[10px] ${isBuy ? 'duo-badge-green' : isSell ? 'duo-badge-red' : 'duo-badge-blue'}`}>
                                            {tx.type.toUpperCase()}
                                        </span>
                                    </div>
                                    {!isDeposit && (
                                        <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                            {Number(tx.shares).toFixed(2)} shares @ ₹{Number(tx.price_per_share).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-0.5">
                                    <span className={`text-sm font-extrabold ${isBuy ? 'text-[var(--duo-red)]' : 'text-[var(--duo-green)]'}`}>
                                        {isBuy ? '-' : '+'}₹{Number(tx.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground font-medium">{timeAgo(tx.created_at)}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
