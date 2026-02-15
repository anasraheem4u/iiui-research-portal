import { createClient } from "@/lib/supabase/server"
import { HistoryTable } from "./HistoryTable"
import { ExportButton } from "@/components/ExportButton"

// Type must match what HistoryTable expects
type DocHistory = {
    id: string
    title: string
    status: "approved" | "rejected" | "pending" | "missing"
    version: number
    submission_date: string
    remarks?: string
}

export default async function UploadHistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: docs } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', user?.id)
        .order('created_at', { ascending: false })

    const formattedDocs: DocHistory[] = docs?.map(d => ({
        id: d.id,
        title: d.title,
        status: d.status as any,
        version: d.version,
        submission_date: d.created_at,
        remarks: d.remarks
    })) || []

    const exportData = formattedDocs.map(d => [
        d.title,
        d.status,
        d.version,
        new Date(d.submission_date).toLocaleDateString()
    ])

    return (
        <div className="flex-1 p-8 overflow-y-auto w-full">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Upload History</h1>
                        <p className="text-muted-foreground">Log of all your document submissions.</p>
                    </div>
                    <ExportButton
                        title="My Upload History"
                        headers={['Title', 'Status', 'Version', 'Date']}
                        data={exportData}
                        filename="my_upload_history.pdf"
                    />
                </div>

                <div className="bg-card rounded-lg border shadow-sm p-6">
                    <HistoryTable data={formattedDocs} />
                </div>
            </div>
        </div>
    )
}
