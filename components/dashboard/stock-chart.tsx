'use client'

import { useState, useMemo } from 'react'
import useSWR from 'swr'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import type { StockQuote, ChartDataPoint, StockNews } from '@/lib/stock-data'
import { TrendingUp, TrendingDown, ShoppingCart, CircleDollarSign, ArrowUp, ArrowDown, Activity, BarChart3, DollarSign, Gauge, Clock, Layers, CandlestickChart, Newspaper, ExternalLink } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const TIME_RANGES = [
  { label: '7D', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
]

/* ── Custom Candlestick Shape ──────────────────────────────── */
function CandlestickShape(props: any) {
  const { x, y, width, height, payload } = props
  if (!payload) return null

  const { open, close, high, low } = payload
  const isUp = close >= open
  const color = isUp ? 'hsl(145 65% 42%)' : 'hsl(0 72% 55%)'
  const yScale = props.yScale || ((v: number) => v)

  // Bar dimensions
  const barWidth = Math.max(width * 0.6, 3)
  const barX = x + (width - barWidth) / 2
  const bodyTop = yScale(Math.max(open, close))
  const bodyBottom = yScale(Math.min(open, close))
  const bodyHeight = Math.max(Math.abs(bodyBottom - bodyTop), 1)

  // Wick
  const wickX = x + width / 2
  const wickTop = yScale(high)
  const wickBottom = yScale(low)

  return (
    <g>
      {/* Wick */}
      <line x1={wickX} y1={wickTop} x2={wickX} y2={wickBottom} stroke={color} strokeWidth={1.5} />
      {/* Body */}
      <rect
        x={barX} y={bodyTop} width={barWidth} height={bodyHeight}
        fill={isUp ? color : color} stroke={color} strokeWidth={1}
        rx={1.5} ry={1.5}
        fillOpacity={isUp ? 1 : 1}
      />
    </g>
  )
}

/* ── Custom Tooltip ────────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.[0]) return null
  const data = payload[0].payload
  const isUp = data.close >= data.open

  return (
    <div className="duo-card p-3 min-w-[160px] !border-b-2 shadow-lg">
      <p className="text-xs font-bold text-muted-foreground mb-2">
        {new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground font-semibold">Open</span>
        <span className="text-right font-bold">₹{data.open.toFixed(2)}</span>
        <span className="text-muted-foreground font-semibold">High</span>
        <span className="text-right font-bold text-[var(--duo-green)]">₹{data.high.toFixed(2)}</span>
        <span className="text-muted-foreground font-semibold">Low</span>
        <span className="text-right font-bold text-[var(--duo-red)]">₹{data.low.toFixed(2)}</span>
        <span className="text-muted-foreground font-semibold">Close</span>
        <span className={`text-right font-bold ${isUp ? 'text-[var(--duo-green)]' : 'text-[var(--duo-red)]'}`}>₹{data.close.toFixed(2)}</span>
      </div>
      {data.volume > 0 && (
        <p className="text-[10px] text-muted-foreground mt-2 pt-1.5 border-t border-border font-semibold">
          Vol: {(data.volume / 1000000).toFixed(2)}M
        </p>
      )}
    </div>
  )
}

export function StockChart({ symbol, onTrade }: {
  symbol: string
  onTrade: (symbol: string, action: 'buy' | 'sell') => void
}) {
  const [days, setDays] = useState(30)

  const { data: quote } = useSWR<StockQuote>(
    `/api/stocks?action=quote&symbol=${symbol}`,
    fetcher,
    { refreshInterval: 30000 }
  )

  const { data: chartData } = useSWR<ChartDataPoint[]>(
    `/api/stocks?action=chart&symbol=${symbol}&days=${days}`,
    fetcher
  )

  const { data: news } = useSWR<StockNews[]>(
    `/api/stocks?action=news&symbol=${symbol}`,
    fetcher,
    { refreshInterval: 300000 } // refresh every 5 min
  )

  // Compute price domain for the chart
  const { minPrice, maxPrice } = useMemo(() => {
    if (!chartData || chartData.length === 0) return { minPrice: 0, maxPrice: 100 }
    const lows = chartData.map(d => d.low)
    const highs = chartData.map(d => d.high)
    const min = Math.min(...lows)
    const max = Math.max(...highs)
    const padding = (max - min) * 0.05
    return { minPrice: Math.floor(min - padding), maxPrice: Math.ceil(max + padding) }
  }, [chartData])

  if (!quote || quote.price == null) {
    return (
      <div className="duo-card flex h-72 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="icon-circle icon-circle-green w-14 h-14 animate-float">
            <Activity className="h-7 w-7" />
          </div>
          <p className="text-muted-foreground text-sm font-bold">Loading chart data...</p>
        </div>
      </div>
    )
  }

  const isPositive = (quote.change ?? 0) >= 0
  const price = quote.price ?? 0
  const change = quote.change ?? 0
  const changePercent = quote.changePercent ?? 0
  const displaySymbol = symbol.replace('.NS', '').replace('.BO', '')

  return (
    <div className="flex flex-col gap-4 animate-slide-up">
      {/* Chart Card */}
      <div className="duo-card flex flex-col gap-4 p-5">
        {/* Stock Header */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className={`icon-circle w-10 h-10 ${isPositive ? 'icon-circle-green' : 'icon-circle-red'}`}>
                {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              </div>
              <div>
                <h2 className="text-xl font-extrabold font-mono text-foreground">{displaySymbol}</h2>
                <p className="text-xs text-muted-foreground font-medium">{quote.name}</p>
              </div>
            </div>
            <div className="flex items-baseline gap-2 ml-[52px]">
              <span className="text-3xl font-extrabold text-foreground tracking-tight">
                ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span className={`duo-badge ${isPositive ? 'duo-badge-green' : 'duo-badge-red'}`}>
                {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onTrade(symbol, 'buy')} className="duo-btn duo-btn-green text-sm px-4 py-2">
              <ShoppingCart className="h-4 w-4" /> Buy
            </button>
            <button onClick={() => onTrade(symbol, 'sell')} className="duo-btn duo-btn-red text-sm px-4 py-2">
              <CircleDollarSign className="h-4 w-4" /> Sell
            </button>
          </div>
        </div>

        {/* Candlestick Chart */}
        <div className="h-72 w-full rounded-xl bg-[var(--secondary)] p-3">
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: 0, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 85%)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  stroke="hsl(220 10% 60%)"
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  interval="preserveStartEnd"
                  axisLine={{ stroke: 'hsl(220 14% 85%)' }}
                />
                <YAxis
                  domain={[minPrice, maxPrice]}
                  stroke="hsl(220 10% 60%)"
                  tick={{ fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(v) => `₹${v}`}
                  width={65}
                  axisLine={{ stroke: 'hsl(220 14% 85%)' }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(220 14% 92%)', radius: 4 }} />
                <Bar
                  dataKey="high"
                  shape={(props: any) => {
                    const entry = props.payload || (chartData && chartData[props.index])
                    if (!entry || props.y == null || props.height == null) return <g />
                    const { open, close, high, low } = entry

                    if (!high || !low || !open || !close) return <g />

                    const isUp = close >= open
                    const color = isUp ? 'hsl(145 65% 42%)' : 'hsl(0 72% 55%)'

                    // Recharts gives us: props.y = pixel position of dataKey value (high)
                    // props.y + props.height = pixel position of domain minimum (minPrice)
                    // So we can derive: pixelsPerUnit = props.height / (high - minPrice)
                    const domainRange = high - minPrice
                    if (domainRange <= 0) return <g />
                    const pxPerUnit = props.height / domainRange

                    const toY = (val: number) => props.y + (high - val) * pxPerUnit

                    const wickX = props.x + props.width / 2
                    const barWidth = Math.max(props.width * 0.65, 4)
                    const barX = props.x + (props.width - barWidth) / 2

                    const bodyTop = toY(Math.max(open, close))
                    const bodyBottom = toY(Math.min(open, close))
                    const bodyH = Math.max(bodyBottom - bodyTop, 1.5)

                    return (
                      <g>
                        <line x1={wickX} y1={toY(high)} x2={wickX} y2={toY(low)} stroke={color} strokeWidth={1.5} />
                        <rect x={barX} y={bodyTop} width={barWidth} height={bodyH} fill={color} stroke={color} strokeWidth={0.5} rx={1.5} />
                      </g>
                    )
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <Activity className="h-8 w-8 text-muted-foreground animate-float" />
            </div>
          )}
        </div>

        {/* Time Range Controls */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1.5">
            {TIME_RANGES.map((range) => (
              <button
                key={range.days}
                onClick={() => setDays(range.days)}
                className={`duo-btn text-xs px-3 py-1.5 ${days === range.days ? 'duo-btn-green' : 'duo-btn-outline'
                  }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Details Card */}
      <div className="duo-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground mb-4">
          <div className="icon-circle icon-circle-blue w-7 h-7">
            <BarChart3 className="h-3.5 w-3.5" />
          </div>
          Stock Details
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <DetailItem icon={ArrowUp} label="Open" value={`₹${(quote.open ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="blue" />
          <DetailItem icon={ArrowUp} label="Day High" value={`₹${(quote.high ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="green" />
          <DetailItem icon={ArrowDown} label="Day Low" value={`₹${(quote.low ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="red" />
          <DetailItem icon={Layers} label="Volume" value={formatVolume(quote.volume ?? 0)} color="purple" />
          <DetailItem icon={DollarSign} label="Market Cap" value={quote.marketCap || '—'} color="orange" />
          <DetailItem icon={TrendingUp} label="Change" value={`${change >= 0 ? '+' : ''}₹${change.toFixed(2)}`} color={change >= 0 ? 'green' : 'red'} />
          <DetailItem icon={Gauge} label="Volatility" value={quote.volatility ? `${(quote.volatility * 100).toFixed(1)}%` : '—'} color="orange" />
          <DetailItem icon={Activity} label="Prev Close" value={`₹${(price - change).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} color="blue" />
        </div>
      </div>

      {/* News Section */}
      {news && news.length > 0 && (
        <div className="duo-card p-5">
          <h3 className="flex items-center gap-2 text-sm font-extrabold text-foreground mb-4">
            <div className="icon-circle icon-circle-purple w-7 h-7">
              <Newspaper className="h-3.5 w-3.5" />
            </div>
            Related News
          </h3>
          <div className="flex flex-col gap-3 stagger">
            {news.map((article, i) => (
              <a
                key={i}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="duo-card group flex gap-4 p-4 cursor-pointer animate-slide-up"
              >
                {article.thumbnail && (
                  <img
                    src={article.thumbnail}
                    alt=""
                    className="w-20 h-20 rounded-xl object-cover border-2 border-border flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
                  />
                )}
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                  <h4 className="text-sm font-extrabold text-foreground leading-snug line-clamp-2 group-hover:text-[var(--duo-blue)] transition-colors">
                    {article.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                    <span className="duo-badge duo-badge-purple text-[10px] py-0 px-1.5">
                      {article.publisher}
                    </span>
                    {article.publishedAt && (
                      <span>{getNewsTime(article.publishedAt)}</span>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Detail Item Component ─────────────────────────────────── */
function DetailItem({ icon: Icon, label, value, color }: {
  icon: React.ElementType
  label: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-center gap-3 group">
      <div className={`icon-circle icon-circle-${color} w-9 h-9`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="text-sm font-extrabold text-foreground">{value}</span>
      </div>
    </div>
  )
}

function formatVolume(vol: number): string {
  if (vol >= 10000000) return `${(vol / 10000000).toFixed(2)} Cr`
  if (vol >= 100000) return `${(vol / 100000).toFixed(2)} L`
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)} K`
  return vol.toString()
}

function getNewsTime(dateStr: string): string {
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
