'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/**
 * On every fresh browser session (sessionStorage is empty),
 * sign the user out and redirect to login.
 * Tab refreshes / navigation keep the flag alive so you stay logged in.
 */
export function SessionGuard({ children }: { children: React.ReactNode }) {
    const [checked, setChecked] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const SESSION_KEY = 'stockpilot-active-session'

        // If the flag exists → this is a tab refresh / navigation → allow
        if (sessionStorage.getItem(SESSION_KEY)) {
            setChecked(true)
            return
        }

        // Flag doesn't exist → fresh browser open → sign out
        const supabase = createClient()
        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                // User has a stale session from a previous browser open
                supabase.auth.signOut().then(() => {
                    router.push('/auth/login')
                })
            } else {
                // No session, let the normal auth flow handle it
                setChecked(true)
            }
        })
    }, [router])

    // Listen for successful sign-in to set the flag
    useEffect(() => {
        const supabase = createClient()
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN') {
                sessionStorage.setItem('stockpilot-active-session', 'true')
                setChecked(true)
            }
            if (event === 'SIGNED_OUT') {
                sessionStorage.removeItem('stockpilot-active-session')
            }
        })
        return () => subscription.unsubscribe()
    }, [])

    if (!checked) {
        return (
            <div className="flex min-h-svh items-center justify-center bg-background">
                <div className="icon-circle icon-circle-green w-12 h-12 animate-spin">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
