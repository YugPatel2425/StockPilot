import { NextRequest, NextResponse } from 'next/server'
import { getStockQuote, getChartData, searchStocks, getAllStocks, getTopMovers, getStockNews } from '@/lib/stock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const action = searchParams.get('action')
  const symbol = searchParams.get('symbol')
  const query = searchParams.get('q')
  const days = parseInt(searchParams.get('days') || '30')

  switch (action) {
    case 'quote':
      if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
      const quote = await getStockQuote(symbol)
      if (!quote) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })
      return NextResponse.json(quote)

    case 'chart':
      if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
      const chart = await getChartData(symbol, days)
      return NextResponse.json(chart)

    case 'search':
      if (!query) return NextResponse.json([])
      return NextResponse.json(await searchStocks(query))

    case 'all':
      return NextResponse.json(await getAllStocks())

    case 'movers':
      return NextResponse.json(await getTopMovers())

    case 'news':
      if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
      return NextResponse.json(await getStockNews(symbol))

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}
