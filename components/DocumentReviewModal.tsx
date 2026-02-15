"use client"

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Eye, ZoomIn, ZoomOut, Download, Printer, RefreshCw,
    ChevronUp, ChevronDown, Menu, CheckCircle, XCircle,
    AlertCircle, Paperclip, Loader2, FileText
} from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { approveDocument, rejectDocument } from "@/app/actions/documents"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface DocumentReviewModalProps {
    documentId: string
    documentTitle: string
    fileUrl: string | null
    studentName: string
    studentRegNo?: string
    programName?: string
    version?: number
    submissionDate?: string | null
    status: string
    trigger?: React.ReactNode
}

type LogEntry = {
    id: string
    old_status: string
    new_status: string
    remarks: string | null
    created_at: string
}

export function DocumentReviewModal({
    documentId,
    documentTitle,
    fileUrl,
    studentName,
    studentRegNo,
    programName,
    version = 1,
    submissionDate,
    status,
    trigger
}: DocumentReviewModalProps) {
    const [open, setOpen] = useState(false)
    const [signedUrl, setSignedUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [zoom, setZoom] = useState(100)
    const [remarks, setRemarks] = useState("")
    const [logs, setLogs] = useState<LogEntry[]>([])
    const router = useRouter()

    useEffect(() => {
        if (!open) return
        loadDocument()
        loadLogs()
    }, [open])

    async function loadDocument() {
        if (!fileUrl) {
            console.warn("DocumentReviewModal: No fileUrl provided")
            // Don't set error if it's just missing, maybe show specific UI?
            // Actually, if fileUrl is missing, we can't preview.
            // But let's act as if it's fine until user tries to refresh?
            // No, better to show empty state.
            return
        }
        setLoading(true)
        setError(null)
        const supabase = createClient()
        console.log("Loading document from storage:", fileUrl)
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(fileUrl, 3600)

        if (error) {
            console.error("Error creating signed URL for " + fileUrl, error)
            setError(error.message)
            setLoading(false)
            return
        }

        if (data?.signedUrl) {
            setSignedUrl(data.signedUrl)
        } else {
            console.warn("No signed URL returned for:", fileUrl)
            setError("Could not generate signed URL (file not found)")
        }
        setLoading(false)
    }

    async function loadLogs() {
        const supabase = createClient()
        const { data } = await supabase
            .from('document_logs')
            .select('*')
            .eq('document_id', documentId)
            .order('created_at', { ascending: false })
            .limit(10)
        if (data) setLogs(data)
    }

    async function handleApprove() {
        setActionLoading("approve")
        try {
            await approveDocument(documentId)
            toast.success(`"${documentTitle}" approved successfully`)
            setOpen(false)
            router.refresh()
        } catch (err: any) {
            toast.error(`Failed: ${err.message}`)
        }
        setActionLoading(null)
    }

    async function handleReject() {
        if (!remarks.trim()) {
            toast.error("Please provide remarks for rejection")
            return
        }
        setActionLoading("reject")
        try {
            await rejectDocument(documentId, remarks)
            toast.success(`"${documentTitle}" rejected with remarks`)
            setOpen(false)
            router.refresh()
        } catch (err: any) {
            toast.error(`Failed: ${err.message}`)
        }
        setActionLoading(null)
    }

    const getStatusBadge = () => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-100 text-green-700 border border-green-200 text-xs px-3 py-1">Approved</Badge>
            case 'pending': return <Badge className="bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs px-3 py-1">Pending Review</Badge>
            case 'rejected': return <Badge className="bg-red-100 text-red-700 border border-red-200 text-xs px-3 py-1">Rejected</Badge>
            default: return <Badge variant="secondary" className="text-xs px-3 py-1">{status}</Badge>
        }
    }

    const formatDateTime = (date: string | null | undefined) => {
        if (!date) return '--'
        const d = new Date(date)
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }

    const formatLogTime = (date: string) => {
        const d = new Date(date)
        return {
            date: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
    }

    const initials = studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    const fileExt = fileUrl?.split('.').pop()?.toLowerCase() || ''
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)
    const isDocx = ['docx', 'doc'].includes(fileExt)
    const isTxt = ['txt'].includes(fileExt)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                        <Eye className="w-4 h-4 text-blue-500" />
                    </div>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-[1050px] h-[90vh] p-0 overflow-hidden rounded-2xl gap-0" aria-describedby={undefined}>
                <DialogTitle className="sr-only">Reviewing: {documentTitle}</DialogTitle>
                {/* Top Header Bar */}
                <div className="flex items-center justify-between px-5 py-3 border-b bg-slate-50/80">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Eye className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-foreground leading-tight">
                                Reviewing: {documentTitle}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Ver. {version}.0 • Submitted: {formatDateTime(submissionDate)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge()}
                    </div>
                </div>

                {/* Main Body — Two Column Layout */}
                <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(90vh - 56px)' }}>
                    {/* LEFT: PDF Viewer */}
                    <div className="flex-1 flex flex-col bg-gray-100 border-r">
                        {/* PDF Toolbar */}
                        <div className="flex items-center justify-between px-3 py-2 bg-white border-b text-sm">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Menu className="w-4 h-4" />
                                </Button>
                                <div className="flex items-center gap-1 border rounded-md">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.max(50, z - 25))}>
                                        <ZoomOut className="w-3.5 h-3.5" />
                                    </Button>
                                    <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom(z => Math.min(200, z + 25))}>
                                        <ZoomIn className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronUp className="w-3.5 h-3.5" /></Button>
                                <span>Page 1</span>
                                <Button variant="ghost" size="icon" className="h-7 w-7"><ChevronDown className="w-3.5 h-3.5" /></Button>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => loadDocument()}>
                                    <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => signedUrl && window.open(signedUrl, '_blank')}>
                                    <Download className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => signedUrl && window.open(signedUrl, '_blank')}>
                                    <Printer className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* PDF Content */}
                        <div className="flex-1 overflow-auto p-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3">
                                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        <p className="text-sm text-muted-foreground">Loading document...</p>
                                    </div>
                                </div>
                            ) : signedUrl ? (
                                isDocx ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="text-center space-y-4">
                                            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
                                                <FileText className="w-10 h-10 text-blue-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-foreground">Preview Not Available</h3>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Word documents cannot be previewed directly.
                                                </p>
                                            </div>
                                            <Button onClick={() => window.open(signedUrl, '_blank')} variant="outline" className="gap-2">
                                                <Download className="w-4 h-4" /> Download to View
                                            </Button>
                                        </div>
                                    </div>
                                ) : isImage ? (
                                    <div className="flex justify-center min-h-full p-8" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                                        <img
                                            src={signedUrl}
                                            alt={documentTitle}
                                            className="max-w-full shadow-lg rounded-lg object-contain"
                                            style={{ maxHeight: 'none' }} // Allow natural height with zoom
                                        />
                                    </div>
                                ) : (
                                    <div className="flex justify-center" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                                        <iframe
                                            src={`${signedUrl}#toolbar=0&view=FitH`}
                                            className="w-full bg-white rounded-lg shadow-lg border"
                                            style={{ height: 'calc(100vh - 200px)', minHeight: '600px', maxWidth: '800px' }}
                                            title={documentTitle}
                                        />
                                    </div>
                                )
                            ) : error ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3 px-6">
                                        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h3 className="font-semibold text-foreground">Document Not Found</h3>
                                        <p className="text-sm text-muted-foreground max-w-[280px] mx-auto">
                                            The file for this document could not be retrieved from storage. It may have been deleted or never uploaded correctly.
                                        </p>
                                        <p className="text-xs font-mono bg-muted p-2 rounded mt-2 text-red-600 max-w-full overflow-hidden text-ellipsis">
                                            Error: {error}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-3">
                                        <div className="w-20 h-20 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto">
                                            <Eye className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No document file available to preview</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Sidebar — Submission Details + Actions */}
                    <div className="w-[300px] flex flex-col bg-white overflow-y-auto">
                        {/* Submission Details */}
                        <div className="p-5 border-b">
                            <h4 className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                                Submission Details
                            </h4>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm border border-emerald-200">
                                    {initials}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">{studentName}</p>
                                    <p className="text-xs text-muted-foreground">Reg: {studentRegNo || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 mb-4">
                                <Badge variant="outline" className="text-[10px]">{programName?.includes('PhD') ? 'PhD' : 'MS'} Thesis</Badge>
                                <Badge variant="outline" className="text-[10px]">{programName || 'N/A'}</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <p className="text-muted-foreground">Submitted</p>
                                    <p className="font-medium text-foreground">{formatDateTime(submissionDate)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Version</p>
                                    <p className="font-medium text-foreground">v{version}.0</p>
                                </div>
                            </div>
                        </div>

                        {/* History Log */}
                        <div className="p-5 border-b">
                            <h4 className="text-[11px] uppercase tracking-wider text-blue-600 font-semibold mb-3">
                                History Log
                            </h4>
                            <div className="space-y-3">
                                {logs.length > 0 ? logs.map(log => {
                                    const { date, time } = formatLogTime(log.created_at)
                                    return (
                                        <div key={log.id} className="flex items-start gap-2.5">
                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.new_status === 'approved' ? 'bg-green-500' :
                                                log.new_status === 'rejected' ? 'bg-red-500' : 'bg-gray-400'
                                                }`} />
                                            <div>
                                                <p className="text-[11px] text-muted-foreground">{date}, {time}</p>
                                                <p className="text-xs font-medium text-foreground">
                                                    {log.new_status === 'pending' && `Submitted version ${version}.0`}
                                                    {log.new_status === 'approved' && `Approved v${version}.0`}
                                                    {log.new_status === 'rejected' && (
                                                        <>Rejected v{version}.0: <span className="italic text-muted-foreground">&ldquo;{log.remarks}&rdquo;</span></>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-xs text-muted-foreground">No activity logged yet</p>
                                )}
                            </div>
                        </div>

                        {/* Coordinator Remarks */}
                        <div className="p-5 flex-1">
                            <h4 className="text-sm font-semibold text-foreground mb-2">Coordinator Remarks</h4>
                            <textarea
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value.slice(0, 500))}
                                placeholder="Enter your feedback, required changes, or approval notes here..."
                                className="w-full h-28 p-3 text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 bg-muted/30"
                            />
                            <div className="flex justify-between items-center mt-1.5">
                                <button className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                    <Paperclip className="w-3 h-3" /> Attach Guidelines
                                </button>
                                <span className="text-[11px] text-muted-foreground">{remarks.length}/500 chars</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-5 border-t">
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1 h-10 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                    onClick={handleReject}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                    Reject
                                </Button>
                                <Button
                                    className="flex-1 h-10 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={handleApprove}
                                    disabled={actionLoading !== null}
                                >
                                    {actionLoading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    Approve
                                </Button>
                            </div>
                            <button
                                className="w-full text-center text-xs text-blue-600 hover:text-blue-700 mt-3 underline"
                                onClick={() => setOpen(false)}
                            >
                                Save draft &amp; continue later
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
