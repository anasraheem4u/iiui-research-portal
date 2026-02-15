"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveStudent(studentId: string) {
    const supabase = await createClient()

    // Verify permission (optional, but RLS handles it)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('users')
        .update({ status: 'approved' })
        .eq('id', studentId)

    if (error) {
        console.error("Error approving student:", error)
        throw new Error("Failed to approve student")
    }

    revalidatePath('/dashboard/coordinator')
}

export async function rejectStudent(studentId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Unauthorized")

    const { error } = await supabase
        .from('users')
        .update({ status: 'rejected' })
        .eq('id', studentId)

    if (error) {
        console.error("Error rejecting student:", error)
        throw new Error("Failed to reject student")
    }

    revalidatePath('/dashboard/coordinator')
}
