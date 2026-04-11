import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { AIChat } from '@/components/dashboard/ai-chat'
import { cookies } from 'next/headers'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    let user = null

    try {
        const supabase = await createClient()
        const { data } = await supabase.auth.getUser()
        user = data.user
    } catch {
        // Network error reaching Supabase — check for auth cookies as fallback
        const cookieStore = await cookies()
        const hasAuthCookie = cookieStore.getAll().some(
            (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
        )
        if (!hasAuthCookie) {
            redirect('/auth/login')
        }
        // Has auth cookies but can't verify — render with fallback user info
        // Extract basic info from the cookie if possible
        user = { id: 'offline', email: '' }
    }

    if (!user) {
        redirect('/auth/login')
    }

    return (
        <div className="flex min-h-svh flex-col bg-background">
            <DashboardNav userId={user.id} email={user.email || ''} />
            <main className="flex-1">
                {children}
            </main>
            <AIChat />
        </div>
    )
}
