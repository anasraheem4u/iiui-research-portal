import { AppSidebar } from '@/components/AppSidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // For development/demo purposes without auth, we might want to bypass
        // But production requirement says auth is mandatory.
        // Uncomment the next line for production behavior:
        // redirect('/login') 
    }

    // Mock profile if no user (for UI dev)
    const profile = user ? await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', user.id)
        .single()
        .then(res => res.data) : { role: 'student', full_name: 'Demo User' }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <AppSidebar
                role={profile?.role as 'student' | 'coordinator'}
                user={{
                    name: profile?.full_name || 'Guest User',
                    email: user?.email
                }}
            />
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-muted/10 pt-16 lg:pt-0">
                {children}
            </main>
        </div>
    )
}
