'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import useSWR from 'swr'
import type { StockQuote } from '@/lib/stock-data'
import { ShoppingCart, CircleDollarSign, PartyPopper, Wallet, AlertTriangle, Loader2, Sparkles, Banknote } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function TradeDialog({
  open,
  onOpenChange,
  symbol,
  action,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol: string
  action: 'buy' | 'sell'
  onSuccess: () => void
}) {
  const [shares, setShares] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const { data: quote } = useSWR<StockQuote>(
    open && symbol ? `/api/stocks?action=quote&symbol=${symbol}` : null,
    fetcher
  )

  const numShares = parseFloat(shares) || 0
  const totalCost = quote ? numShares * quote.price : 0
  const displaySymbol = symbol.replace('.NS', '').replace('.BO', '')
  const isBuy = action === 'buy'

  const handleTrade = async () => {
    if (numShares <= 0) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, symbol: symbol.toUpperCase(), shares: numShares }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Trade failed')

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
        onOpenChange(false)
        setShares('')
      }, 1800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Trade failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-border border-b-4 bg-card sm:max-w-md rounded-2xl overflow-hidden p-0">
        {showSuccess ? (
          <div className="flex flex-col items-center gap-5 py-14 px-6 animate-pop">
            <div className={`icon-circle w-20 h-20 border-[3px] ${isBuy ? 'icon-circle-green' : 'icon-circle-orange'}`}>
              <PartyPopper className="h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground">
                {isBuy ? 'Purchase Complete!' : 'Sale Complete!'}
              </p>
              <p className="text-sm text-muted-foreground mt-2 font-semibold">
                {isBuy ? '+' : '-'}{numShares} shares of {displaySymbol}
              </p>
            </div>
            <div className="duo-badge duo-badge-green">
              <Sparkles className="h-3.5 w-3.5" />
              +1 XP earned!
            </div>
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-foreground flex items-center gap-3 text-xl">
                <div className={`icon-circle w-10 h-10 ${isBuy ? 'icon-circle-green' : 'icon-circle-red'}`}>
                  {isBuy ? <ShoppingCart className="h-5 w-5" /> : <CircleDollarSign className="h-5 w-5" />}
                </div>
                {isBuy ? 'Buy' : 'Sell'} {displaySymbol}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-semibold mt-1">
                {quote?.price != null
                  ? `Current price: ₹${quote.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                  : 'Loading price...'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="shares" className="text-foreground font-extrabold text-sm">
                  Number of shares
                </Label>
                <Input
                  id="shares"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  className="border-2 border-border border-b-4 bg-card text-foreground font-mono text-lg rounded-xl focus:border-[var(--duo-blue)] transition-all"
                />
              </div>
              {numShares > 0 && quote && (
                <div className={`duo-card flex items-center justify-between px-5 py-4 ${isBuy ? 'duo-card-green' : 'duo-card-red'}`}>
                  <span className="text-sm text-muted-foreground font-bold flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Estimated {isBuy ? 'cost' : 'revenue'}
                  </span>
                  <span className="text-xl font-extrabold text-foreground">
                    ₹{totalCost.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {error && (
                <div className="duo-card duo-card-red flex items-center gap-2 text-sm text-[var(--duo-red)] font-bold px-4 py-3">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </div>
              )}
            </div>
            <DialogFooter className="mt-5 gap-2 sm:gap-2">
              <button onClick={() => onOpenChange(false)} className="duo-btn duo-btn-outline">
                Cancel
              </button>
              <button
                onClick={handleTrade}
                disabled={isLoading || numShares <= 0}
                className={`duo-btn ${isBuy ? 'duo-btn-green' : 'duo-btn-red'} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>{isBuy ? <ShoppingCart className="h-4 w-4" /> : <CircleDollarSign className="h-4 w-4" />}
                    {isBuy ? 'Buy' : 'Sell'} {numShares > 0 ? `${numShares} shares` : ''}</>
                )}
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function AddFundsDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const presets = [10000, 50000, 100000, 250000, 500000]

  const handleDeposit = async () => {
    const numAmount = parseFloat(amount)
    if (!numAmount || numAmount <= 0) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deposit', amount: numAmount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deposit failed')

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onSuccess()
        onOpenChange(false)
        setAmount('')
      }, 1500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Deposit failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-border border-b-4 bg-card sm:max-w-md rounded-2xl overflow-hidden p-0">
        {showSuccess ? (
          <div className="flex flex-col items-center gap-5 py-14 px-6 animate-pop">
            <div className="icon-circle icon-circle-green w-20 h-20 border-[3px]">
              <PartyPopper className="h-10 w-10" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-extrabold text-foreground">Funds Added!</p>
              <p className="text-sm text-muted-foreground mt-2 font-semibold">
                +₹{parseFloat(amount || '0').toLocaleString('en-IN')} added to your account
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-foreground flex items-center gap-3 text-xl">
                <div className="icon-circle icon-circle-blue w-10 h-10">
                  <Wallet className="h-5 w-5" />
                </div>
                Add Virtual Funds
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-semibold mt-1">
                Power up your trading account
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="amount" className="text-foreground font-extrabold text-sm">
                  Amount (₹)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  max="1000000"
                  step="1"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-2 border-border border-b-4 bg-card text-foreground font-mono text-lg rounded-xl focus:border-[var(--duo-blue)] transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setAmount(preset.toString())}
                    className="duo-btn duo-btn-outline text-xs px-3 py-1.5"
                  >
                    ₹{preset.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
              {error && (
                <div className="duo-card duo-card-red flex items-center gap-2 text-sm text-[var(--duo-red)] font-bold px-4 py-3">
                  <AlertTriangle className="h-4 w-4" /> {error}
                </div>
              )}
            </div>
            <DialogFooter className="mt-5 gap-2 sm:gap-2">
              <button onClick={() => onOpenChange(false)} className="duo-btn duo-btn-outline">
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={isLoading || !parseFloat(amount)}
                className="duo-btn duo-btn-green disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Adding...</>
                ) : (
                  <><Wallet className="h-4 w-4" /> Add ₹{parseFloat(amount || '0').toLocaleString('en-IN')}</>
                )}
              </button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
