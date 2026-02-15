import { createClient } from '@/lib/supabase/server'
import { CoordinatorChatInterface } from '@/components/chat/CoordinatorChatInterface'
import { redirect } from 'next/navigation'

export default async function CoordinatorMessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="flex-1 h-screen overflow-hidden p-4 bg-slate-50/50">
            <CoordinatorChatInterface currentUserId={user.id} />
        </div>
    )
}
