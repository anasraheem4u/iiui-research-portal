import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error("CRITICAL: Supabase environment variables are missing!", { supabaseUrl, supabaseAnonKey })
    } else {
        // console.log("Supabase Client Init:", supabaseUrl) // Uncomment for debugging
    }

    return createBrowserClient(
        supabaseUrl!,
        supabaseAnonKey!
    )
}
