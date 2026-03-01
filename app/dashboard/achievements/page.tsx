'use client'

import { useEffect, useState, useMemo } from 'react'
import useSWR from 'swr'
import { Trophy, Lock, Star, Flame, Target, Zap, Crown, Award, TrendingUp, BookOpen, ShoppingCart, Wallet, Medal } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface Achievement {
    id: string
    title: string
    description: string
    icon: React.ElementType
    color: string
    check: (stats: UserStats) => boolean
    progress: (stats: UserStats) => { current: number; target: number }
}

interface UserStats {
    tradeCount: number
    holdingCount: number
    totalPL: number
    balance: number
    netWorth: number
    lessonsCompleted: number
    watchlistCount: number
    depositCount: number
    buyCount: number
    sellCount: number
    maxSingleProfit: number
}

const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-trade',
        title: 'First Steps',
        description: 'Make your first trade',
        icon: ShoppingCart,
        color: 'green',
        check: (s) => s.tradeCount >= 1,
        progress: (s) => ({ current: Math.min(s.tradeCount, 1), target: 1 }),
    },
    {
        id: 'trader-5',
        title: 'Active Trader',
        description: 'Complete 5 trades',
        icon: Zap,
        color: 'blue',
        check: (s) => s.tradeCount >= 5,
        progress: (s) => ({ current: Math.min(s.tradeCount, 5), target: 5 }),
    },
    {
        id: 'trader-25',
        title: 'Serial Trader',
        description: 'Complete 25 trades',
        icon: Flame,
        color: 'orange',
        check: (s) => s.tradeCount >= 25,
        progress: (s) => ({ current: Math.min(s.tradeCount, 25), target: 25 }),
    },
    {
        id: 'trader-100',
        title: 'Trading Machine',
        description: 'Complete 100 trades',
        icon: Crown,
        color: 'purple',
        check: (s) => s.tradeCount >= 100,
        progress: (s) => ({ current: Math.min(s.tradeCount, 100), target: 100 }),
    },
    {
        id: 'diversified',
        title: 'Diversified',
        description: 'Hold 3 different stocks',
        icon: Target,
        color: 'blue',
        check: (s) => s.holdingCount >= 3,
        progress: (s) => ({ current: Math.min(s.holdingCount, 3), target: 3 }),
    },
    {
        id: 'portfolio-10',
        title: 'Big Portfolio',
        description: 'Hold 10 different stocks',
        icon: Target,
        color: 'purple',
        check: (s) => s.holdingCount >= 10,
        progress: (s) => ({ current: Math.min(s.holdingCount, 10), target: 10 }),
    },
    {
        id: 'green-portfolio',
        title: 'In the Green',
        description: 'Achieve positive total P/L',
        icon: TrendingUp,
        color: 'green',
        check: (s) => s.totalPL > 0,
        progress: (s) => ({ current: s.totalPL > 0 ? 1 : 0, target: 1 }),
    },
    {
        id: 'profit-10k',
        title: 'Smart Investor',
        description: 'Earn ₹10,000 in total profit',
        icon: Award,
        color: 'orange',
        check: (s) => s.totalPL >= 10000,
        progress: (s) => ({ current: Math.min(Math.max(s.totalPL, 0), 10000), target: 10000 }),
    },
    {
        id: 'profit-1l',
        title: 'Lakhpati',
        description: 'Earn ₹1,00,000 in total profit',
        icon: Crown,
        color: 'orange',
        check: (s) => s.totalPL >= 100000,
        progress: (s) => ({ current: Math.min(Math.max(s.totalPL, 0), 100000), target: 100000 }),
    },
    {
        id: 'learner',
        title: 'Quick Learner',
        description: 'Complete 5 lessons',
        icon: BookOpen,
        color: 'green',
        check: (s) => s.lessonsCompleted >= 5,
        progress: (s) => ({ current: Math.min(s.lessonsCompleted, 5), target: 5 }),
    },
    {
        id: 'scholar',
        title: 'Market Scholar',
        description: 'Complete all 15 lessons',
        icon: BookOpen,
        color: 'purple',
        check: (s) => s.lessonsCompleted >= 15,
        progress: (s) => ({ current: Math.min(s.lessonsCompleted, 15), target: 15 }),
    },
    {
        id: 'watchful',
        title: 'Watchful Eye',
        description: 'Add 5 stocks to watchlist',
        icon: Star,
        color: 'orange',
        check: (s) => s.watchlistCount >= 5,
        progress: (s) => ({ current: Math.min(s.watchlistCount, 5), target: 5 }),
    },
    {
        id: 'funded',
        title: 'Cash Ready',
        description: 'Add funds to your account',
        icon: Wallet,
        color: 'blue',
        check: (s) => s.depositCount >= 1,
        progress: (s) => ({ current: Math.min(s.depositCount, 1), target: 1 }),
    },
    {
        id: 'balanced',
        title: 'Balanced Trader',
        description: 'Make both buy and sell trades',
        icon: Medal,
        color: 'green',
        check: (s) => s.buyCount >= 1 && s.sellCount >= 1,
        progress: (s) => ({ current: (s.buyCount >= 1 ? 1 : 0) + (s.sellCount >= 1 ? 1 : 0), target: 2 }),
    },
]

export default function AchievementsPage() {
    const { data: portfolio } = useSWR('/api/trade', fetcher)
    const [lessonsCompleted, setLessonsCompleted] = useState(0)
    const [watchlistCount, setWatchlistCount] = useState(0)

    useEffect(() => {
        const progress = localStorage.getItem('stockpilot-learn-progress')
        if (progress) {
            setLessonsCompleted(Object.values(JSON.parse(progress)).filter(Boolean).length)
        }
        const watchlist = localStorage.getItem('stockpilot-watchlist')
        if (watchlist) {
            setWatchlistCount(JSON.parse(watchlist).length)
        }
    }, [])

    const stats: UserStats = useMemo(() => {
        const holdings = portfolio?.holdings || []
        const transactions = portfolio?.transactions || []
        const profile = portfolio?.profile

        const buyTx = transactions.filter((t: any) => t.type === 'buy')
        const sellTx = transactions.filter((t: any) => t.type === 'sell')
        const depositTx = transactions.filter((t: any) => t.type === 'deposit')

        const totalInvested = holdings.reduce((sum: number, h: any) =>
            sum + Number(h.avg_price) * Number(h.shares), 0)

        return {
            tradeCount: buyTx.length + sellTx.length,
            holdingCount: holdings.length,
            totalPL: (profile?.balance || 0) + totalInvested - 1000000, // vs starting 10L
            balance: profile?.balance || 0,
            netWorth: (profile?.balance || 0) + totalInvested,
            lessonsCompleted,
            watchlistCount,
            depositCount: depositTx.length,
            buyCount: buyTx.length,
            sellCount: sellTx.length,
            maxSingleProfit: 0,
        }
    }, [portfolio, lessonsCompleted, watchlistCount])

    const unlockedCount = ACHIEVEMENTS.filter(a => a.check(stats)).length
    const percent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl mx-auto w-full">
            {/* Header */}
            <div className="flex items-center justify-between animate-bounce-in">
                <div className="flex items-center gap-3">
                    <div className="icon-circle icon-circle-orange w-12 h-12">
                        <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Achievements</h1>
                        <p className="text-sm text-muted-foreground font-medium">{unlockedCount}/{ACHIEVEMENTS.length} unlocked</p>
                    </div>
                </div>
                <div className="duo-badge duo-badge-orange text-sm">
                    <Trophy className="h-4 w-4" /> {percent}%
                </div>
            </div>

            {/* Overall Progress */}
            <div className="duo-card p-4 animate-slide-up">
                <div className="xp-bar">
                    <div className="xp-bar-fill" style={{ width: `${percent}%` }} />
                </div>
            </div>

            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger">
                {ACHIEVEMENTS.map((achievement, i) => {
                    const unlocked = achievement.check(stats)
                    const prog = achievement.progress(stats)
                    const progPercent = Math.round((prog.current / prog.target) * 100)
                    const Icon = achievement.icon

                    return (
                        <div
                            key={achievement.id}
                            className={`duo-card p-5 flex items-start gap-4 animate-slide-up transition-all ${unlocked ? '' : 'opacity-70'}`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            <div className={`icon-circle w-12 h-12 flex-shrink-0 ${unlocked
                                    ? `icon-circle-${achievement.color}`
                                    : 'bg-muted border-border'
                                }`}>
                                {unlocked ? <Icon className="h-6 w-6" /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-sm font-extrabold ${unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                                        {achievement.title}
                                    </h3>
                                    {unlocked && <span className="duo-badge duo-badge-green text-[9px] py-0">✓ Done</span>}
                                </div>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">{achievement.description}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="xp-bar flex-1 h-2">
                                        <div className="xp-bar-fill" style={{ width: `${progPercent}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                                        {prog.current.toLocaleString('en-IN')}/{prog.target.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
