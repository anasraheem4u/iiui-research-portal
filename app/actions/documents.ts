"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveDocument(documentId: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Update document status
    const { error } = await supabase
        .from('student_documents')
        .update({
            status: 'approved',
            updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

    if (error) throw new Error(error.message)

    // Log the status change
    await supabase.from('document_logs').insert({
        document_id: documentId,
        old_status: 'pending',
        new_status: 'approved',
        changed_by: user.id,
        remarks: 'Approved by coordinator'
    })

    revalidatePath('/dashboard/coordinator')
    revalidatePath('/dashboard/student')
    return { success: true }
}

export async function rejectDocument(documentId: string, remarks: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
        .from('student_documents')
        .update({
            status: 'rejected',
            remarks: remarks,
            updated_at: new Date().toISOString()
        })
        .eq('id', documentId)

    if (error) throw new Error(error.message)

    // Log the status change
    await supabase.from('document_logs').insert({
        document_id: documentId,
        old_status: 'pending',
        new_status: 'rejected',
        changed_by: user.id,
        remarks: remarks
    })

    revalidatePath('/dashboard/coordinator')
    revalidatePath('/dashboard/student')
    return { success: true }
}
