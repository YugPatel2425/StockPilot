import DashboardClient from '@/components/dashboard/dashboard-client'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  let userId = ''
  let userEmail = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      userId = user.id
      userEmail = user.email || ''
    }
  } catch {
    // Network error — use fallback. The layout already guards auth.
    const cookieStore = await cookies()
    const hasAuthCookie = cookieStore.getAll().some(
      (c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
    )
    if (hasAuthCookie) {
      userId = 'offline'
      userEmail = ''
    }
  }

  return <DashboardClient user={{ id: userId, email: userEmail }} />
}
