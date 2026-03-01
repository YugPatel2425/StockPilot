import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { AIChat } from '@/components/dashboard/ai-chat'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

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
