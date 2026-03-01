'use client'

import { useId, useState, useCallback } from 'react'
import useSWR from 'swr'
import { StatCard, XPBar } from '@/components/dashboard/header'
import { StockSearch } from '@/components/dashboard/stock-search'
import { StockChart } from '@/components/dashboard/stock-chart'
import { PortfolioTable } from '@/components/dashboard/portfolio-table'
import { TradeDialog, AddFundsDialog } from '@/components/dashboard/trade-dialogs'
import { TransactionHistory } from '@/components/dashboard/transaction-history'
import { MarketOverview } from '@/components/dashboard/market-overview'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Crown, Wallet, BarChart3, TrendingUp, Search } from 'lucide-react'
import type { StockQuote } from '@/lib/stock-data'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function DashboardClient({ user }: { user: { id: string; email: string } }) {
  const tabsId = useId()
  const [selectedStock, setSelectedStock] = useState<string>('RELIANCE.NS')
  const [tradeDialogOpen, setTradeDialogOpen] = useState(false)
  const [tradeAction, setTradeAction] = useState<'buy' | 'sell'>('buy')
  const [tradeSymbol, setTradeSymbol] = useState('')
  const [addFundsOpen, setAddFundsOpen] = useState(false)

  const { data: portfolio, mutate: refreshPortfolio } = useSWR('/api/trade', fetcher, {
    refreshInterval: 15000,
  })

  const profile = portfolio?.profile
  const holdings = portfolio?.holdings || []
  const transactions = portfolio?.transactions || []
  const tradeCount = transactions.filter((t: { type: string }) => t.type === 'buy' || t.type === 'sell').length

  const holdingSymbols: string[] = holdings.map((h: { symbol: string }) => h.symbol)
  const { data: holdingQuotes } = useSWR<Record<string, StockQuote>>(
    holdingSymbols.length > 0
      ? `/api/stocks?action=quotes&symbols=${holdingSymbols.join(',')}`
      : null,
    async (url: string) => {
      const quotes: Record<string, StockQuote> = {}
      await Promise.all(
        holdingSymbols.map(async (sym: string) => {
          try {
            const res = await fetch(`/api/stocks?action=quote&symbol=${sym}`)
            if (res.ok) {
              const q = await res.json()
              quotes[sym] = q
            }
          } catch { /* ignore */ }
        })
      )
      return quotes
    },
    { refreshInterval: 15000 }
  )

  const enrichedHoldings = holdings.map((h: { symbol: string; shares: number; avg_price: number; id: string }) => {
    const quote = holdingQuotes?.[h.symbol]
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

  const totalPortfolioValue = enrichedHoldings.reduce((sum: number, h: { currentValue: number }) => sum + h.currentValue, 0)
  const totalCostBasis = holdings.reduce((sum: number, h: { avg_price: number; shares: number }) => sum + Number(h.avg_price) * Number(h.shares), 0)
  const totalGainLoss = totalPortfolioValue - totalCostBasis
  const totalGainLossPercent = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0
  const balance = profile?.balance || 0
  const netWorth = balance + totalPortfolioValue

  const handleTrade = useCallback((symbol: string, action: 'buy' | 'sell') => {
    setTradeSymbol(symbol)
    setTradeAction(action)
    setTradeDialogOpen(true)
  }, [])

  const handleTradeSuccess = useCallback(() => {
    refreshPortfolio()
  }, [refreshPortfolio])

  const handleRemove = useCallback(async (symbol: string) => {
    try {
      const res = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', symbol }),
      })
      if (res.ok) refreshPortfolio()
    } catch { /* ignore */ }
  }, [refreshPortfolio])

  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Trader'

  return (
    <div className="flex flex-col gap-5 p-4 md:p-6">
      {/* XP Bar */}
      <XPBar tradeCount={tradeCount} />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 stagger">
        <StatCard
          title="Net Worth"
          value={`₹${netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={Crown}
          colorClass="duo-card-green"
        />
        <StatCard
          title="Cash"
          value={`₹${balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={Wallet}
          colorClass="duo-card-blue"
          subtitle={
            <button
              onClick={() => setAddFundsOpen(true)}
              className="duo-btn duo-btn-green text-[10px] px-2 py-0.5 !border-bottom-width-2"
            >
              <Plus className="h-3 w-3" /> Add
            </button>
          }
        />
        <StatCard
          title="Portfolio"
          value={`₹${totalPortfolioValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={BarChart3}
          colorClass="duo-card-orange"
          subtitle={`${holdings.length} holding${holdings.length !== 1 ? 's' : ''}`}
        />
        <StatCard
          title="Total P/L"
          value={`${totalGainLoss >= 0 ? '+' : ''}₹${Math.abs(totalGainLoss).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          icon={TrendingUp}
          colorClass={totalGainLoss >= 0 ? 'duo-card-green' : 'duo-card-red'}
          subtitle={`${totalGainLoss >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(2)}%`}
          trend={totalGainLoss >= 0 ? 'up' : 'down'}
        />
      </div>

      {/* Content */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left */}
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Tabs defaultValue="chart" className="w-full" id={tabsId}>
            <TabsList className="bg-card border-2 border-border border-b-4 rounded-xl p-1 h-auto">
              <TabsTrigger value="chart" className="font-bold data-[state=active]:bg-[var(--duo-green-light)] data-[state=active]:text-[var(--duo-green-dark)] rounded-lg transition-all duration-200 data-[state=active]:shadow-sm px-4 py-2">
                <BarChart3 className="h-4 w-4 mr-1.5" /> Charts
              </TabsTrigger>
              <TabsTrigger value="portfolio" className="font-bold data-[state=active]:bg-[var(--duo-blue-light)] data-[state=active]:text-[var(--duo-blue-dark)] rounded-lg transition-all duration-200 data-[state=active]:shadow-sm px-4 py-2">
                <Wallet className="h-4 w-4 mr-1.5" /> Portfolio
              </TabsTrigger>
              <TabsTrigger value="history" className="font-bold data-[state=active]:bg-[var(--duo-orange-light)] data-[state=active]:text-[var(--duo-orange-dark)] rounded-lg transition-all duration-200 data-[state=active]:shadow-sm px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-1.5" /> History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chart" className="mt-4 animate-slide-up">
              <StockChart symbol={selectedStock} onTrade={handleTrade} />
            </TabsContent>
            <TabsContent value="portfolio" className="mt-4 animate-slide-up">
              <PortfolioTable holdings={enrichedHoldings} onSelectStock={setSelectedStock} onSell={(symbol) => handleTrade(symbol, 'sell')} />
            </TabsContent>
            <TabsContent value="history" className="mt-4 animate-slide-up">
              <TransactionHistory transactions={transactions} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground">
              <Search className="h-4 w-4 text-[var(--duo-blue)]" /> Search Stocks
            </h3>
            <StockSearch onSelectStock={setSelectedStock} />
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <MarketOverview onSelectStock={setSelectedStock} />
          </div>
        </div>
      </div>
      <TradeDialog open={tradeDialogOpen} onOpenChange={setTradeDialogOpen} symbol={tradeSymbol} action={tradeAction} onSuccess={handleTradeSuccess} />
      <AddFundsDialog open={addFundsOpen} onOpenChange={setAddFundsOpen} onSuccess={handleTradeSuccess} />
    </div>
  )
}
