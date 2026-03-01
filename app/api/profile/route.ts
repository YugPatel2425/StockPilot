import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { display_name } = await request.json()

    if (!display_name || typeof display_name !== 'string') {
        return NextResponse.json({ error: 'Display name required' }, { status: 400 })
    }

    const { error } = await supabase
        .from('profiles')
        .update({ display_name: display_name.trim().slice(0, 50) })
        .eq('id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}
