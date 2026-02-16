"use server"

import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

export async function deleteUser(userId: string) {
    if (!userId) {
        return { success: false, error: "User ID is required" }
    }

    try {
        console.log(`Initial attempt to delete user: ${userId}`);

        // 1. Manually delete from public tables first to avoid FK constraints if CASCADE is missing
        // Order matters: child tables first, then parent tables

        // Delete Documents Logs
        const { error: logError } = await adminClient
            .from('document_logs')
            .delete()
            .eq('changed_by', userId) // Logs created BY user

        // Also delete logs for documents OWNED by user (via join logic or direct if document_id is sufficient)
        // For simplicity, we rely on document deletion to cascade or handle separately if needed.
        // But let's try to be thorough:
        // Get all document IDs for this user
        const { data: userDocs } = await adminClient.from('student_documents').select('id').eq('student_id', userId)
        if (userDocs && userDocs.length > 0) {
            const docIds = userDocs.map(d => d.id)
            await adminClient.from('document_logs').delete().in('document_id', docIds)
        }

        if (logError) console.error("Error deleting logs:", logError)

        // Delete Messages (sent or received)
        await adminClient.from('messages').delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

        // Delete Student Documents
        await adminClient.from('student_documents').delete().eq('student_id', userId)

        // Delete Research Details
        await adminClient.from('research_details').delete().eq('student_id', userId)

        // Delete Announcements made by user? (Optional, maybe keep?)
        // await adminClient.from('announcements').delete().eq('created_by', userId) 
        // Better to set created_by to NULL if we want to keep announcements
        await adminClient.from('announcements').update({ created_by: null }).eq('created_by', userId)

        // Delete Public User Profile
        const { error: publicError } = await adminClient
            .from('users')
            .delete()
            .eq('id', userId)

        if (publicError) {
            console.error("Error deleting public user profile:", publicError)
            // Even if this fails (e.g. FK), we might still want to try deleting Auth user
            // return { success: false, error: publicError.message } 
        }

        // 2. Finally, delete from Auth Users (Super Admin role)
        const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

        if (authError) {
            console.error("Error deleting auth user:", authError)
            return { success: false, error: authError.message }
        }

        revalidatePath('/dashboard/coordinator')
        return { success: true }
    } catch (err: any) {
        console.error("Unexpected error deleting user:", err)
        return { success: false, error: err.message || "Failed to delete user" }
    }
}
