import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStockQuote } from '@/lib/stock-data'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { action, symbol, shares, amount } = body

  switch (action) {
    case 'buy': {
      if (!symbol || !shares) return NextResponse.json({ error: 'Symbol and shares required' }, { status: 400 })

      const quote = await getStockQuote(symbol)
      if (!quote) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })

      const totalCost = quote.price * shares

      // Get user balance
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
      if (!profile || profile.balance < totalCost) {
        return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 })
      }

      // Deduct balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - totalCost })
        .eq('id', user.id)
      if (balanceError) return NextResponse.json({ error: balanceError.message }, { status: 500 })

      // Upsert holdings
      const { data: existing } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol.toUpperCase())
        .single()

      if (existing) {
        const newShares = Number(existing.shares) + shares
        const newAvgPrice = ((Number(existing.avg_price) * Number(existing.shares)) + totalCost) / newShares
        await supabase
          .from('holdings')
          .update({ shares: newShares, avg_price: newAvgPrice, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await supabase.from('holdings').insert({
          user_id: user.id,
          symbol: symbol.toUpperCase(),
          shares,
          avg_price: quote.price,
        })
      }

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        type: 'buy',
        shares,
        price_per_share: quote.price,
        total_amount: totalCost,
      })

      return NextResponse.json({ success: true, price: quote.price, total: totalCost })
    }

    case 'sell': {
      if (!symbol || !shares) return NextResponse.json({ error: 'Symbol and shares required' }, { status: 400 })

      const quote = await getStockQuote(symbol)
      if (!quote) return NextResponse.json({ error: 'Stock not found' }, { status: 404 })

      // Check holdings
      const { data: holding } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol.toUpperCase())
        .single()

      if (!holding || Number(holding.shares) < shares) {
        return NextResponse.json({ error: 'Insufficient shares' }, { status: 400 })
      }

      const totalRevenue = quote.price * shares
      const remainingShares = Number(holding.shares) - shares

      // Update balance
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
      await supabase
        .from('profiles')
        .update({ balance: (profile?.balance || 0) + totalRevenue })
        .eq('id', user.id)

      // Update or delete holding
      if (remainingShares <= 0) {
        await supabase.from('holdings').delete().eq('id', holding.id)
      } else {
        await supabase
          .from('holdings')
          .update({ shares: remainingShares, updated_at: new Date().toISOString() })
          .eq('id', holding.id)
      }

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        type: 'sell',
        shares,
        price_per_share: quote.price,
        total_amount: totalRevenue,
      })

      return NextResponse.json({ success: true, price: quote.price, total: totalRevenue })
    }

    case 'deposit': {
      if (!amount || amount <= 0 || amount > 1000000) {
        return NextResponse.json({ error: 'Amount must be between ₹1 and ₹10,00,000' }, { status: 400 })
      }

      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
      await supabase
        .from('profiles')
        .update({ balance: (profile?.balance || 0) + amount })
        .eq('id', user.id)

      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'deposit',
        total_amount: amount,
      })

      return NextResponse.json({ success: true, newBalance: (profile?.balance || 0) + amount })
    }

    case 'remove': {
      // Remove a holding entirely and refund cost basis — no quote needed
      if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 })

      const { data: holding } = await supabase
        .from('holdings')
        .select('*')
        .eq('user_id', user.id)
        .eq('symbol', symbol.toUpperCase())
        .single()

      if (!holding) {
        return NextResponse.json({ error: 'Holding not found' }, { status: 404 })
      }

      const refund = Number(holding.avg_price) * Number(holding.shares)

      // Refund cost basis to balance
      const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single()
      await supabase
        .from('profiles')
        .update({ balance: (profile?.balance || 0) + refund })
        .eq('id', user.id)

      // Delete holding
      await supabase.from('holdings').delete().eq('id', holding.id)

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: user.id,
        symbol: symbol.toUpperCase(),
        type: 'sell',
        shares: Number(holding.shares),
        price_per_share: Number(holding.avg_price),
        total_amount: refund,
      })

      return NextResponse.json({ success: true, refund })
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [profileRes, holdingsRes, transactionsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('holdings').select('*').eq('user_id', user.id).order('symbol'),
    supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
  ])

  return NextResponse.json({
    profile: profileRes.data,
    holdings: holdingsRes.data || [],
    transactions: transactionsRes.data || [],
  })
}
