'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Announcement = {
    id: string
    title: string
    content: string
    created_by: string
    created_at: string
    is_pinned: boolean
}

export async function getAnnouncements() {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching announcements:', error)
        return []
    }
    return (data as Announcement[]) || []
}

export async function createAnnouncement(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is coordinator/admin
    // (Actual logic would check database role too if using robust server-side check not just RLS)
    // RLS handles the permission check on insert, but we can verify role here for cleaner error message.

    if (!user) return { error: 'Not authenticated' }

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const is_pinned = formData.get('is_pinned') === 'on'

    const { error } = await supabase
        .from('announcements')
        .insert({
            title,
            content,
            created_by: user.id,
            is_pinned
        })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/coordinator/announcements')
    revalidatePath('/dashboard/student/announcements')
    return { success: true }
}

export async function deleteAnnouncement(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/dashboard/coordinator/announcements')
    revalidatePath('/dashboard/student/announcements')
    return { success: true }
}
