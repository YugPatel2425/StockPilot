import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TrendingUp, BarChart3, Wallet, ArrowRight, Zap, Trophy, Target, Sparkles, BookOpen, ShieldCheck, LineChart, GraduationCap } from 'lucide-react'

export default async function HomePage() {
  let user = null
  try {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Network error — show landing page
  }

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-svh flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b-2 border-border bg-card animate-slide-up">
        <div className="flex items-center gap-2.5">
          <div className="icon-circle icon-circle-green w-9 h-9">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Stock<span className="gradient-text">Pilot</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <button className="duo-btn duo-btn-outline text-sm px-4 py-2">Sign in</button>
          </Link>
          <Link href="/auth/sign-up">
            <button className="duo-btn duo-btn-green text-sm px-4 py-2">Get Started</button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 md:py-24">
        <div className="flex max-w-3xl flex-col items-center gap-8 text-center">
          {/* Badge */}
          <div className="animate-bounce-in duo-badge duo-badge-orange">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Free forever — no real money needed</span>
          </div>

          {/* Hero icon cluster */}
          <div className="animate-bounce-in relative flex items-center justify-center" style={{ animationDelay: '0.1s' }}>
            <div className="icon-circle icon-circle-green w-20 h-20 border-[3px] animate-float">
              <TrendingUp className="h-10 w-10" />
            </div>
            <div className="icon-circle icon-circle-orange w-12 h-12 absolute -top-2 -right-6 animate-float" style={{ animationDelay: '0.5s' }}>
              <Zap className="h-5 w-5" />
            </div>
            <div className="icon-circle icon-circle-blue w-10 h-10 absolute -bottom-2 -left-5 animate-float" style={{ animationDelay: '1s' }}>
              <Trophy className="h-4 w-4" />
            </div>
          </div>

          {/* Heading */}
          <h1 className="animate-bounce-in text-balance text-4xl font-extrabold tracking-tight text-foreground md:text-6xl leading-tight"
            style={{ animationDelay: '0.15s' }}>
            Master the market,{' '}
            <span className="gradient-text">one trade at a time</span>
          </h1>

          <p className="animate-slide-up max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground"
            style={{ animationDelay: '0.25s' }}>
            Practice stock trading with ₹10,00,000 in virtual cash. Real NSE stock data, zero risk. Level up from Rookie to Market Legend!
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 animate-slide-up" style={{ animationDelay: '0.35s' }}>
            <Link href="/auth/sign-up">
              <button className="duo-btn duo-btn-green text-base px-8 py-3">
                Start Learning <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="duo-btn duo-btn-outline text-base px-8 py-3">
                I have an account
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="animate-slide-up grid grid-cols-3 gap-4 w-full max-w-md mt-4"
            style={{ animationDelay: '0.45s' }}>
            <div className="duo-card duo-card-green flex flex-col items-center gap-1 p-4">
              <span className="text-2xl font-extrabold text-[var(--duo-green)]">500+</span>
              <span className="text-xs font-semibold text-muted-foreground">NSE Stocks</span>
            </div>
            <div className="duo-card duo-card-orange flex flex-col items-center gap-1 p-4">
              <span className="text-2xl font-extrabold text-[var(--duo-orange)]">₹10L</span>
              <span className="text-xs font-semibold text-muted-foreground">Virtual Cash</span>
            </div>
            <div className="duo-card duo-card-blue flex flex-col items-center gap-1 p-4">
              <span className="text-2xl font-extrabold text-[var(--duo-blue)]">7</span>
              <span className="text-xs font-semibold text-muted-foreground">Levels to Master</span>
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid w-full gap-5 md:grid-cols-3 stagger">
            <div className="duo-card group flex flex-col items-center gap-4 p-7 cursor-default animate-slide-up">
              <div className="icon-circle icon-circle-green">
                <LineChart className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-foreground text-lg">Live Charts</h3>
              <p className="text-sm leading-relaxed text-muted-foreground text-center">
                Real-time price charts with multiple timeframes. Analyze stocks like a pro.
              </p>
            </div>
            <div className="duo-card group flex flex-col items-center gap-4 p-7 cursor-default animate-slide-up">
              <div className="icon-circle icon-circle-blue">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-foreground text-lg">Learn by Doing</h3>
              <p className="text-sm leading-relaxed text-muted-foreground text-center">
                Buy and sell stocks with virtual money. No real risk, just real learning.
              </p>
            </div>
            <div className="duo-card group flex flex-col items-center gap-4 p-7 cursor-default animate-slide-up">
              <div className="icon-circle icon-circle-orange">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-foreground text-lg">Level Up</h3>
              <p className="text-sm leading-relaxed text-muted-foreground text-center">
                Earn XP with every trade. Progress from Rookie to Market Legend!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-border px-6 py-5 bg-card">
        <p className="text-center text-xs font-medium text-muted-foreground">
          StockPilot is a stock market simulator for educational purposes. No real money is used.
        </p>
      </footer>
    </div>
  )
}
