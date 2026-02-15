import { createClient } from '@/lib/supabase/server'
import { StudentChatInterface } from '@/components/chat/StudentChatInterface'
import { redirect } from 'next/navigation'

export default async function StudentMessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch full profile with coordinator relation
    const { data: profile } = await supabase
        .from('users')
        .select(`
            *,
            coordinator:coordinator_id ( id, full_name, email )
        `)
        .eq('id', user.id)
        .single()

    // Robustly extract coordinator
    let coordinator = null
    if (profile?.coordinator) {
        if (Array.isArray(profile.coordinator)) {
            coordinator = profile.coordinator[0]
        } else {
            coordinator = profile.coordinator
        }
    }

    // Fallback: If coordinator_id exists but relation failed (RLS?), try fetching coordinator public profile manually
    if (!coordinator && profile?.coordinator_id) {
        const { data: coordProfile } = await supabase
            .from('users')
            .select('id, full_name, email')
            .eq('id', profile.coordinator_id)
            .single()

        if (coordProfile) {
            coordinator = coordProfile
        }
    }

    return (
        <div className="flex-1 h-screen overflow-hidden p-4 bg-slate-50/50">
            <StudentChatInterface
                currentUserId={user.id}
                initialCoordinator={coordinator}
            />
        </div>
    )
}
