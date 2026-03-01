import DashboardClient from '@/components/dashboard/dashboard-client'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <DashboardClient user={{ id: user!.id, email: user!.email || '' }} />
}
