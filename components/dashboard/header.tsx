'use client'

import { TrendingUp, TrendingDown, LogOut, Wallet, Flame, Crown, Star, Zap, Award, BookOpen, GraduationCap, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import React from 'react'
import { ThemeToggle } from './theme-toggle'

/* ── Trader Levels ─────────────────────────────────────────── */
const LEVELS = [
  { name: 'Rookie', icon: BookOpen, color: 'green', minXP: 0 },
  { name: 'Apprentice', icon: Star, color: 'blue', minXP: 5 },
  { name: 'Trader', icon: TrendingUp, color: 'orange', minXP: 15 },
  { name: 'Pro', icon: Zap, color: 'purple', minXP: 30 },
  { name: 'Expert', icon: Flame, color: 'red', minXP: 60 },
  { name: 'Master', icon: Award, color: 'orange', minXP: 100 },
  { name: 'Legend', icon: Crown, color: 'purple', minXP: 200 },
]

export function getTraderLevel(tradeCount: number) {
  let level = LEVELS[0]
  for (const l of LEVELS) {
    if (tradeCount >= l.minXP) level = l
  }
  const idx = LEVELS.indexOf(level)
  const next = LEVELS[idx + 1]
  const xpInLevel = tradeCount - level.minXP
  const xpNeeded = next ? next.minXP - level.minXP : 100
  const progress = next ? Math.min((xpInLevel / xpNeeded) * 100, 100) : 100
  return { ...level, progress, nextLevel: next, tradeCount, levelIndex: idx + 1, totalLevels: LEVELS.length }
}

/* ── Dashboard Header ──────────────────────────────────────── */
export function DashboardHeader({ displayName, balance, tradeCount = 0 }: {
  displayName: string
  balance: number
  tradeCount?: number
}) {
  const router = useRouter()
  const supabase = createClient()
  const level = getTraderLevel(tradeCount)
  const LevelIcon = level.icon

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="flex items-center justify-between border-b-2 border-border bg-card px-5 py-3 animate-slide-up">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="group flex items-center gap-2.5">
          <div className="icon-circle icon-circle-green w-9 h-9">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-foreground hidden sm:inline">
            Stock<span className="gradient-text">Pilot</span>
          </span>
        </Link>

        {/* Level Badge */}
        <div className="hidden md:block">
          <span className={`duo-badge duo-badge-${level.color}`}>
            <LevelIcon className="h-3.5 w-3.5" />
            Lv.{level.levelIndex} {level.name}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Balance */}
        <div className="duo-card flex items-center gap-2 px-3.5 py-1.5 cursor-default !border-bottom-width-2">
          <Wallet className="h-4 w-4 text-[var(--duo-green)]" />
          <span className="text-sm font-bold font-mono text-foreground">
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(balance)}
          </span>
        </div>

        <span className="hidden lg:block text-sm font-semibold text-muted-foreground">{displayName}</span>

        <ThemeToggle />

        <button
          onClick={handleSignOut}
          className="duo-btn duo-btn-outline px-2.5 py-1.5"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

/* ── Stat Card ─────────────────────────────────────────────── */
export function StatCard({ title, value, subtitle, icon: Icon, trend, colorClass = '' }: {
  title: string
  value: string
  subtitle?: React.ReactNode
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  colorClass?: string
}) {
  return (
    <div className={`duo-card flex flex-col gap-2 p-5 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={`icon-circle w-8 h-8 ${trend === 'up' ? 'icon-circle-green' :
            trend === 'down' ? 'icon-circle-red' :
              'icon-circle-blue'
          }`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-extrabold text-foreground tracking-tight">{value}</span>
        {subtitle && (
          <span className={`text-xs font-bold ${trend === 'up' ? 'text-[var(--duo-green)]' :
            trend === 'down' ? 'text-[var(--duo-red)]' :
              'text-muted-foreground'
            }`}>
            {trend === 'up' && <TrendingUp className="mr-0.5 inline h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="mr-0.5 inline h-3 w-3" />}
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── XP Progress Bar ───────────────────────────────────────── */
export function XPBar({ tradeCount }: { tradeCount: number }) {
  const level = getTraderLevel(tradeCount)
  const LevelIcon = level.icon
  const NextIcon = level.nextLevel?.icon || Trophy

  return (
    <div className="duo-card flex items-center gap-4 px-5 py-3 animate-slide-up"
      style={{ animationDelay: '0.1s' }}>
      <div className={`icon-circle w-10 h-10 icon-circle-${level.color}`}>
        <LevelIcon className="h-5 w-5" />
      </div>
      <div className="flex flex-col flex-1 gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-foreground">Level {level.levelIndex} — {level.name}</span>
          <span className="text-[10px] font-bold text-muted-foreground">{tradeCount} XP</span>
        </div>
        <div className="xp-bar">
          <div className="xp-bar-fill" style={{ width: `${level.progress}%` }} />
        </div>
      </div>
      {level.nextLevel && (
        <div className={`icon-circle w-8 h-8 icon-circle-${level.nextLevel.color} opacity-40`}>
          <NextIcon className="h-4 w-4" />
        </div>
      )}
    </div>
  )
}

export { TrendingUp, TrendingDown, Wallet }
export { BarChart3, DollarSign } from 'lucide-react'
