'use client'

import { ShoppingCart, CircleDollarSign, Wallet, History, Target } from 'lucide-react'

interface Transaction {
  id: string
  symbol: string | null
  type: 'buy' | 'sell' | 'deposit'
  shares: number | null
  price_per_share: number | null
  total_amount: number
  created_at: string
}

function getRelativeTime(dateStr: string): string {
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
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const TX_CONFIG = {
  buy: { icon: ShoppingCart, label: 'Bought', color: 'green' as const },
  sell: { icon: CircleDollarSign, label: 'Sold', color: 'orange' as const },
  deposit: { icon: Wallet, label: 'Deposited', color: 'blue' as const },
}

export function TransactionHistory({ transactions }: { transactions: Transaction[] }) {
  if (transactions.length === 0) {
    return (
      <div className="duo-card flex flex-col items-center justify-center p-12 gap-4">
        <div className="icon-circle icon-circle-orange w-16 h-16 animate-float">
          <History className="h-8 w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <p className="text-base font-extrabold text-foreground">No transactions yet!</p>
          <p className="text-sm text-muted-foreground font-medium">Your trade history will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
        <div className="icon-circle icon-circle-orange w-7 h-7">
          <History className="h-3.5 w-3.5" />
        </div>
        Recent Transactions
      </h3>
      <div className="duo-card overflow-hidden p-0">
        <div className="stagger">
          {transactions.map((tx) => {
            const config = TX_CONFIG[tx.type] || TX_CONFIG.buy
            const Icon = config.icon
            const isIncome = tx.type === 'sell' || tx.type === 'deposit'
            const displaySymbol = tx.symbol?.replace('.NS', '').replace('.BO', '') || ''

            return (
              <div key={tx.id} className="flex items-center justify-between border-b-2 border-border/50 px-4 py-3.5 last:border-b-0 transition-all duration-150 hover:bg-[var(--secondary)] active:bg-[var(--muted)] animate-slide-up">
                <div className="flex items-center gap-3">
                  <div className={`icon-circle icon-circle-${config.color} w-10 h-10`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-extrabold text-foreground">
                      {tx.type === 'deposit' ? 'Deposit' : `${config.label} ${displaySymbol}`}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {tx.type !== 'deposit' && tx.shares && tx.price_per_share
                        ? `${Number(tx.shares).toFixed(2)} shares @ ₹${Number(tx.price_per_share).toFixed(0)}`
                        : getRelativeTime(tx.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-sm font-extrabold ${isIncome ? 'text-[var(--duo-green)]' : 'text-[var(--duo-red)]'}`}>
                    {tx.type === 'buy' ? '-' : '+'}₹{Number(tx.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    {getRelativeTime(tx.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
