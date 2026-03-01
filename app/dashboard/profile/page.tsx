'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { UserCircle, Save, Trophy, TrendingUp, Wallet, BarChart3, ShoppingCart, BookOpen, Star, Calendar, CheckCircle2 } from 'lucide-react'
import { Input } from '@/components/ui/input'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function ProfilePage() {
    const { data: portfolio, mutate } = useSWR('/api/trade', fetcher)
    const [displayName, setDisplayName] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const profile = portfolio?.profile
    const holdings = portfolio?.holdings || []
    const transactions = portfolio?.transactions || []

    useEffect(() => {
        if (profile?.display_name) setDisplayName(profile.display_name)
    }, [profile])

    // Computed stats
    const tradeCount = transactions.filter((t: any) => t.type === 'buy' || t.type === 'sell').length
    const totalInvested = holdings.reduce((sum: number, h: any) => sum + Number(h.avg_price) * Number(h.shares), 0)
    const netWorth = (profile?.balance || 0) + totalInvested
    const totalPL = netWorth - 1000000
    const totalPLPercent = (totalPL / 1000000) * 100

    const lessonsCompleted = (() => {
        if (typeof window === 'undefined') return 0
        const saved = localStorage.getItem('stockpilot-learn-progress')
        return saved ? Object.values(JSON.parse(saved)).filter(Boolean).length : 0
    })()

    const watchlistCount = (() => {
        if (typeof window === 'undefined') return 0
        const saved = localStorage.getItem('stockpilot-watchlist')
        return saved ? JSON.parse(saved).length : 0
    })()

    const handleSave = async () => {
        setSaving(true)
        try {
            await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ display_name: displayName }),
            })
            setSaved(true)
            mutate()
            setTimeout(() => setSaved(false), 2000)
        } catch { /* ignore */ }
        setSaving(false)
    }

    // Level calculation
    const level = Math.min(Math.floor(tradeCount / 5) + 1, 7)
    const LEVELS = ['Rookie', 'Apprentice', 'Day Trader', 'Swing Trader', 'Pro Trader', 'Expert', 'Legend']
    const LEVEL_ICONS = [Star, TrendingUp, BarChart3, Wallet, Trophy, Trophy, Trophy]

    const joinDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
        : '—'

    const stats = [
        { label: 'Net Worth', value: `₹${netWorth.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: Wallet, color: 'green' },
        { label: 'Total P/L', value: `${totalPL >= 0 ? '+' : ''}₹${Math.abs(totalPL).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: TrendingUp, color: totalPL >= 0 ? 'green' : 'red' },
        { label: 'Trades Made', value: tradeCount.toString(), icon: ShoppingCart, color: 'blue' },
        { label: 'Holdings', value: holdings.length.toString(), icon: BarChart3, color: 'orange' },
        { label: 'Lessons Done', value: `${lessonsCompleted}/15`, icon: BookOpen, color: 'green' },
        { label: 'Watchlist', value: watchlistCount.toString(), icon: Star, color: 'orange' },
    ]

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center gap-4 animate-bounce-in">
                <div className="icon-circle icon-circle-blue w-16 h-16">
                    <UserCircle className="h-8 w-8" />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-extrabold text-foreground">
                        {profile?.display_name || displayName || 'Trader'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`duo-badge duo-badge-${level <= 2 ? 'green' : level <= 4 ? 'blue' : 'orange'} text-xs`}>
                            Lv.{level} {LEVELS[level - 1]}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Joined {joinDate}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger">
                {stats.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className={`duo-card p-4 animate-slide-up`} style={{ animationDelay: `${i * 0.06}s` }}>
                            <div className="flex items-center gap-3">
                                <div className={`icon-circle icon-circle-${stat.color} w-9 h-9`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                                    <span className="text-sm font-extrabold text-foreground">{stat.value}</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Settings */}
            <div className="duo-card p-5 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h2 className="flex items-center gap-2 text-base font-extrabold text-foreground mb-4">
                    <div className="icon-circle icon-circle-blue w-8 h-8">
                        <UserCircle className="h-4 w-4" />
                    </div>
                    Profile Settings
                </h2>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Display Name</label>
                        <div className="flex gap-2">
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your name"
                                className="flex-1 bg-card border-2 border-border border-b-4 rounded-xl font-semibold text-foreground focus:border-[var(--duo-blue)] transition-all"
                            />
                            <button
                                onClick={handleSave}
                                disabled={saving || !displayName.trim()}
                                className="duo-btn duo-btn-green px-4 flex items-center gap-2"
                            >
                                {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                {saved ? 'Saved!' : 'Save'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Email</label>
                        <p className="text-sm font-semibold text-muted-foreground bg-[var(--secondary)] border-2 border-border rounded-xl px-4 py-2.5">
                            {portfolio?.profile?.id ? '••••@••••' : '—'}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1 block">Account Level</label>
                        <div className="flex items-center gap-3 bg-[var(--secondary)] border-2 border-border rounded-xl px-4 py-3">
                            <div className={`icon-circle icon-circle-${level <= 2 ? 'green' : level <= 4 ? 'blue' : 'orange'} w-9 h-9`}>
                                {(() => { const LvlIcon = LEVEL_ICONS[level - 1]; return <LvlIcon className="h-4 w-4" /> })()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-extrabold text-foreground">Level {level} — {LEVELS[level - 1]}</span>
                                <span className="text-xs text-muted-foreground font-medium">{tradeCount} XP earned • {5 * level - tradeCount > 0 ? `${5 * level - tradeCount} trades to next level` : 'Max level reached!'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="duo-card duo-card-red p-5 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-base font-extrabold text-foreground mb-2">Reset Account</h2>
                <p className="text-xs text-muted-foreground font-medium mb-3">This will reset your balance to ₹10,00,000 and clear all holdings. This cannot be undone.</p>
                <button disabled className="duo-btn duo-btn-red text-sm opacity-50 cursor-not-allowed">
                    Coming Soon
                </button>
            </div>
        </div>
    )
}
