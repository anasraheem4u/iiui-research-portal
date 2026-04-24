"use server"

import { createClient } from "@supabase/supabase-js"

// Use service role to bypass RLS and fetch the necessary public registration options 
// (programs, batches, returning ONLY names of coordinators to preserve security)
export async function getRegistrationData() {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const [programsRes, batchesRes, coordinatorsRes] = await Promise.all([
            supabaseAdmin.from('programs').select('id, name, type, department'),
            supabaseAdmin.from('batches').select('id, name'),
            supabaseAdmin.from('users').select('id, full_name').in('role', ['admin', 'coordinator']).order('full_name')
        ])

        return {
            programs: programsRes.data || [],
            batches: batchesRes.data || [],
            coordinators: coordinatorsRes.data || [],
            error: null
        }
    } catch (error: any) {
        console.error("Failed to fetch registration data:", error)
        return { programs: [], batches: [], coordinators: [], error: error.message }
    }
}
