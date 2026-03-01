'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { TrendingUp, LayoutDashboard, BookOpen, Star, Trophy, UserCircle, LogOut, Wallet, PieChart, Clock } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/portfolio', label: 'Portfolio', icon: PieChart },
    { href: '/dashboard/history', label: 'History', icon: Clock },
    { href: '/dashboard/watchlist', label: 'Watchlist', icon: Star },
    { href: '/dashboard/learn', label: 'Learn', icon: BookOpen },
    { href: '/dashboard/achievements', label: 'Achievements', icon: Trophy },
    { href: '/dashboard/profile', label: 'Profile', icon: UserCircle },
]

export function DashboardNav({ userId, email }: { userId: string; email: string }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const { data: portfolio } = useSWR('/api/trade', fetcher, { refreshInterval: 30000 })
    const balance = portfolio?.profile?.balance || 0
    const displayName = portfolio?.profile?.display_name || email.split('@')[0]

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/auth/login')
    }

    return (
        <header className="flex items-center justify-between border-b-2 border-border bg-card px-4 py-2.5 animate-slide-up">
            <div className="flex items-center gap-1">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2 mr-3">
                    <div className="icon-circle icon-circle-green w-8 h-8">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                    <span className="text-base font-extrabold tracking-tight text-foreground hidden sm:inline">
                        Stock<span className="gradient-text">Pilot</span>
                    </span>
                </Link>

                {/* Nav Links */}
                <nav className="flex items-center gap-0.5">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${isActive
                                    ? 'bg-[var(--duo-green-light)] text-[var(--duo-green-dark)] border-2 border-[hsl(145_40%_82%)]'
                                    : 'text-muted-foreground hover:bg-[var(--secondary)] hover:text-foreground border-2 border-transparent'
                                    }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span className="hidden lg:inline">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-2.5">
                <div className="duo-card flex items-center gap-2 px-3 py-1.5 cursor-default !border-b-2">
                    <Wallet className="h-3.5 w-3.5 text-[var(--duo-green)]" />
                    <span className="text-xs font-bold font-mono text-foreground">
                        ₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                </div>
                <span className="hidden md:block text-xs font-semibold text-muted-foreground">{displayName}</span>
                <button onClick={handleSignOut} className="duo-btn duo-btn-outline px-2 py-1.5">
                    <LogOut className="h-3.5 w-3.5" />
                </button>
            </div>
        </header>
    )
}
