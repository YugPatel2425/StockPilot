// Real-time Indian stock data powered by Yahoo Finance
// Uses yahoo-finance2 for live NSE/BSE data with real-time volatility

import YahooFinance from 'yahoo-finance2'
import { searchLocalNSEStocks } from './nse-stocks'

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] })

export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  volume: number
  marketCap: string
  volatility?: number
}

export interface ChartDataPoint {
  date: string
  price: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

// Popular Indian NSE stocks for default listings
const DEFAULT_INDIAN_STOCKS: { symbol: string; name: string }[] = [
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
  { symbol: 'INFY.NS', name: 'Infosys' },
  { symbol: 'ICICIBANK.NS', name: 'ICICI Bank' },
  { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever' },
  { symbol: 'SBIN.NS', name: 'State Bank of India' },
  { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel' },
  { symbol: 'ITC.NS', name: 'ITC Limited' },
  { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank' },
  { symbol: 'LT.NS', name: 'Larsen & Toubro' },
  { symbol: 'HCLTECH.NS', name: 'HCL Technologies' },
  { symbol: 'AXISBANK.NS', name: 'Axis Bank' },
  { symbol: 'ASIANPAINT.NS', name: 'Asian Paints' },
  { symbol: 'MARUTI.NS', name: 'Maruti Suzuki' },
  { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma' },
  { symbol: 'TITAN.NS', name: 'Titan Company' },
  { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance' },
  { symbol: 'WIPRO.NS', name: 'Wipro' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors' },
  { symbol: 'POWERGRID.NS', name: 'Power Grid Corp' },
  { symbol: 'NTPC.NS', name: 'NTPC Limited' },
  { symbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement' },
  { symbol: 'NESTLEIND.NS', name: 'Nestle India' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel' },
  { symbol: 'JSWSTEEL.NS', name: 'JSW Steel' },
  { symbol: 'ADANIENT.NS', name: 'Adani Enterprises' },
  { symbol: 'TECHM.NS', name: 'Tech Mahindra' },
  { symbol: 'ONGC.NS', name: 'ONGC' },
  { symbol: 'COALINDIA.NS', name: 'Coal India' },
]

// In-memory cache for quotes (TTL-based)
interface CachedQuote {
  data: StockQuote
  timestamp: number
}

const quoteCache = new Map<string, CachedQuote>()
const CACHE_TTL_MS = 10_000 // 10 seconds — keeps data near real-time

function getCachedQuote(symbol: string): StockQuote | null {
  const cached = quoteCache.get(symbol.toUpperCase())
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }
  return null
}

function setCachedQuote(symbol: string, data: StockQuote): void {
  quoteCache.set(symbol.toUpperCase(), { data, timestamp: Date.now() })
}

/**
 * Compute annualized volatility from recent historical data.
 * Uses 30 days of daily close prices to calculate standard deviation of log returns.
 */
async function computeVolatility(symbol: string): Promise<number> {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 45) // fetch extra days to account for trading days

    const result: any = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    })

    const closes = (result.quotes || [])
      .map((q: any) => q.close)
      .filter((c: any): c is number => c != null && c > 0)

    if (closes.length < 5) return 0

    // Calculate log returns
    const logReturns: number[] = []
    for (let i = 1; i < closes.length; i++) {
      logReturns.push(Math.log(closes[i] / closes[i - 1]))
    }

    // Standard deviation of log returns
    const mean = logReturns.reduce((s, r) => s + r, 0) / logReturns.length
    const variance = logReturns.reduce((s, r) => s + (r - mean) ** 2, 0) / (logReturns.length - 1)
    const dailyVol = Math.sqrt(variance)

    // Annualize: daily vol × sqrt(252 trading days)
    return +(dailyVol * Math.sqrt(252) * 100).toFixed(2) // as percentage
  } catch {
    return 0
  }
}

/**
 * Ensures symbols use the .NS suffix for NSE stocks.
 * If user types "RELIANCE", it becomes "RELIANCE.NS".
 */
function normalizeSymbol(symbol: string): string {
  const s = symbol.toUpperCase().trim()
  if (s.endsWith('.NS') || s.endsWith('.BO')) return s
  return `${s}.NS`
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  const sym = normalizeSymbol(symbol)

  // Check cache first
  const cached = getCachedQuote(sym)
  if (cached) return cached

  try {
    const [result, volatility]: [any, number] = await Promise.all([
      yahooFinance.quote(sym),
      computeVolatility(sym),
    ])

    if (!result || !result.regularMarketPrice) return null

    const quote: StockQuote = {
      symbol: sym,
      name: result.shortName || result.longName || sym.replace('.NS', ''),
      price: result.regularMarketPrice,
      change: result.regularMarketChange ?? 0,
      changePercent: result.regularMarketChangePercent ?? 0,
      high: result.regularMarketDayHigh ?? result.regularMarketPrice,
      low: result.regularMarketDayLow ?? result.regularMarketPrice,
      open: result.regularMarketOpen ?? result.regularMarketPrice,
      volume: result.regularMarketVolume ?? 0,
      marketCap: formatMarketCap(result.marketCap ?? 0),
      volatility,
    }

    setCachedQuote(sym, quote)
    return quote
  } catch (err) {
    console.error(`Failed to fetch quote for ${sym}:`, err)
    return null
  }
}

export async function getChartData(symbol: string, days: number = 30): Promise<ChartDataPoint[]> {
  const sym = normalizeSymbol(symbol)

  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const result: any = await yahooFinance.chart(sym, {
      period1: startDate,
      period2: endDate,
      interval: days <= 7 ? '1h' : '1d',
    })

    return (result.quotes || [])
      .filter((q: any) => q.close != null && q.date != null)
      .map((q: any) => ({
        date: q.date instanceof Date ? q.date.toISOString().split('T')[0] : String(q.date),
        price: +Number(q.close).toFixed(2),
        open: +Number(q.open ?? q.close).toFixed(2),
        high: +Number(q.high ?? q.close).toFixed(2),
        low: +Number(q.low ?? q.close).toFixed(2),
        close: +Number(q.close).toFixed(2),
        volume: Number(q.volume ?? 0),
      }))
  } catch (err) {
    console.error(`Failed to fetch chart data for ${sym}:`, err)
    return []
  }
}

export async function searchStocks(query: string): Promise<StockQuote[]> {
  if (!query || query.length < 1) return []

  const MAX_RESULTS = 8
  const seen = new Set<string>()
  const symbolsToFetch: string[] = []

  // ── Strategy 1: Yahoo Finance search ─────────────────────────
  try {
    const searchQueries = [query]
    if (!query.includes('.')) {
      searchQueries.push(`${query}.NS`)
    }

    const allResults: any[] = []
    for (const sq of searchQueries) {
      try {
        const result: any = await yahooFinance.search(sq, {
          newsCount: 0,
          quotesCount: 15,
        })
        if (result.quotes) allResults.push(...result.quotes)
      } catch { /* ignore individual search failures */ }
    }

    // Filter for Indian exchange stocks (NSE and BSE)
    for (const q of allResults) {
      if (!q.symbol || seen.has(q.symbol)) continue
      const isIndian =
        q.isYahooFinance !== false &&
        (q.exchDisp === 'NSI' || q.exchDisp === 'BSE' || q.exchDisp === 'NSE' ||
          q.exchange === 'NSI' || q.exchange === 'BSE' || q.exchange === 'NSE' ||
          q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO'))
      if (isIndian) {
        seen.add(q.symbol)
        symbolsToFetch.push(q.symbol)
      }
    }
  } catch (err) {
    console.error('Yahoo Finance search failed:', err)
  }

  // ── Strategy 2: Local NSE stock list ─────────────────────────
  // Supplements Yahoo Finance with a comprehensive local index
  const localMatches = searchLocalNSEStocks(query, MAX_RESULTS)
  for (const entry of localMatches) {
    if (!seen.has(entry.symbol)) {
      seen.add(entry.symbol)
      symbolsToFetch.push(entry.symbol)
    }
  }

  if (symbolsToFetch.length === 0) return []

  // Fetch quotes for all matched symbols (capped)
  const quotes = await Promise.all(
    symbolsToFetch.slice(0, MAX_RESULTS).map(sym => getStockQuote(sym))
  )

  return quotes.filter((q: StockQuote | null): q is StockQuote => q !== null)
}

export async function getAllStocks(): Promise<StockQuote[]> {
  const quotes = await Promise.all(
    DEFAULT_INDIAN_STOCKS.map(s => getStockQuote(s.symbol))
  )
  return quotes.filter((q): q is StockQuote => q !== null)
}

export async function getTopMovers(): Promise<{ gainers: StockQuote[]; losers: StockQuote[] }> {
  const all = await getAllStocks()
  const sorted = [...all].sort((a, b) => b.changePercent - a.changePercent)
  return {
    gainers: sorted.slice(0, 5),
    losers: sorted.slice(-5).reverse(),
  }
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) return `₹${(value / 1e12).toFixed(2)}T`
  if (value >= 1e7) return `₹${(value / 1e7).toFixed(0)} Cr`
  if (value >= 1e5) return `₹${(value / 1e5).toFixed(0)} L`
  return `₹${value.toLocaleString('en-IN')}`
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(value)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value)
}

// ── Stock News ────────────────────────────────────────────────
export interface StockNews {
  title: string
  publisher: string
  link: string
  publishedAt: string
  thumbnail?: string
}

export async function getStockNews(symbol: string, count: number = 6): Promise<StockNews[]> {
  const sym = normalizeSymbol(symbol)

  // ── Strategy 1: Yahoo Finance query1 API ─────────────────────
  // This is the same endpoint the official Yahoo Finance site uses internally.
  // It reliably returns news without needing an API key.
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(sym)}&newsCount=${count}&quotesCount=0&enableFuzzyQuery=false`
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    })
    if (res.ok) {
      const json = await res.json()
      const articles: any[] = json?.news || []
      if (articles.length > 0) {
        return articles.slice(0, count).map((n: any) => ({
          title: n.title || '',
          publisher: n.publisher || '',
          link: n.link || '',
          publishedAt: n.providerPublishTime
            ? new Date(n.providerPublishTime * 1000).toISOString()
            : '',
          thumbnail: n.thumbnail?.resolutions?.[0]?.url || '',
        }))
      }
    }
  } catch (err) {
    console.warn(`query1 news fetch failed for ${sym}:`, err)
  }

  // ── Strategy 2: yahoo-finance2 SDK search fallback ───────────
  try {
    const result: any = await yahooFinance.search(sym, { newsCount: count, quotesCount: 0 } as any)
    const news: any[] = result?.news || []
    return news.map((n: any) => ({
      title: n.title || '',
      publisher: n.publisher || '',
      link: n.link || '',
      publishedAt: n.providerPublishTime
        ? new Date(n.providerPublishTime * 1000).toISOString()
        : '',
      thumbnail: n.thumbnail?.resolutions?.[0]?.url || '',
    }))
  } catch (err) {
    console.error(`Failed to fetch news for ${sym}:`, err)
    return []
  }
}
