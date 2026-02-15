"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, FileText, Loader2 } from "lucide-react"
import { useState } from "react"
import { approveDocument, rejectDocument } from "@/app/actions/documents"
import { toast } from "sonner"
import { DocumentReviewModal } from "@/components/DocumentReviewModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface DocumentActionsProps {
    documentId: string
    documentTitle: string
    fileUrl: string | null
    studentName: string
    studentRegNo: string
    programName: string
    version: number
    submissionDate: string | null
    status: string
}

export function DocumentActions({
    documentId,
    documentTitle,
    fileUrl,
    studentName,
    studentRegNo,
    programName,
    version,
    submissionDate,
    status
}: DocumentActionsProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [rejectOpen, setRejectOpen] = useState(false)
    const [remarks, setRemarks] = useState("")

    async function handleApprove() {
        setLoading("approve")
        try {
            await approveDocument(documentId)
            toast.success(`"${documentTitle}" approved successfully`)
        } catch (err: any) {
            toast.error(`Failed to approve: ${err.message}`)
        }
        setLoading(null)
    }

    async function handleReject() {
        if (!remarks.trim()) {
            toast.error("Please provide a reason for rejection")
            return
        }
        setLoading("reject")
        try {
            await rejectDocument(documentId, remarks)
            toast.success(`"${documentTitle}" rejected with remarks`)
            setRejectOpen(false)
            setRemarks("")
        } catch (err: any) {
            toast.error(`Failed to reject: ${err.message}`)
        }
        setLoading(null)
    }

    return (
        <div className="flex justify-end gap-1">
            {/* Detailed Review Modal */}
            <DocumentReviewModal
                documentId={documentId}
                documentTitle={documentTitle}
                fileUrl={fileUrl}
                studentName={studentName}
                studentRegNo={studentRegNo}
                programName={programName}
                version={version}
                submissionDate={submissionDate}
                status={status}
            />

            {/* Quick Approve */}
            <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleApprove}
                disabled={loading !== null}
                title="Approve"
            >
                {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            </Button>

            {/* Quick Reject */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogTrigger asChild>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={loading !== null}
                        title="Reject"
                    >
                        <XCircle className="w-4 h-4" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Reject: {documentTitle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Please provide a reason for rejection. The student will see this and be able to re-upload.
                        </p>
                        <Input
                            placeholder="e.g. Document is blurry, wrong file uploaded..."
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={loading === "reject"}
                        >
                            {loading === "reject" ? "Rejecting..." : "Reject Document"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
