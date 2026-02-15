"use client"

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, CheckCircle, Clock, AlertCircle, AlertTriangle, FileText, Mail, X } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { DocumentReviewModal } from "@/components/DocumentReviewModal"

interface QuickViewModalProps {
    studentId: string
    studentName: string
    programName: string
    regNo?: string
}

type ChecklistDoc = {
    title: string
    description: string
    is_required: boolean
    order_index: number
    status: string
    file_url: string | null
    doc_id: string | null
    submission_date: string | null
    version: number
}

export function QuickViewModal({ studentId, studentName, programName, regNo }: QuickViewModalProps) {
    const [open, setOpen] = useState(false)
    const [docs, setDocs] = useState<ChecklistDoc[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!open) return
        fetchDocs()
    }, [open])

    async function fetchDocs() {
        setLoading(true)
        const supabase = createClient()

        const { data: student } = await supabase
            .from('users')
            .select('program_id')
            .eq('id', studentId)
            .single()

        if (!student?.program_id) {
            setDocs([])
            setLoading(false)
            return
        }

        const { data: checklist } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('program_id', student.program_id)
            .order('order_index', { ascending: true })

        const { data: submissions } = await supabase
            .from('student_documents')
            .select('*')
            .eq('student_id', studentId)

        const merged: ChecklistDoc[] = (checklist || []).map(item => {
            const sub = submissions?.find(s => s.checklist_item_id === item.id)
            return {
                title: item.title,
                description: item.description,
                is_required: item.is_required,
                order_index: item.order_index,
                status: sub ? sub.status : 'missing',
                file_url: sub?.file_url || null,
                doc_id: sub?.id || null,
                submission_date: sub?.created_at || null,
                version: sub?.version || 0
            }
        })

        setDocs(merged)
        setLoading(false)
    }

    const totalDocs = docs.length
    const approvedCount = docs.filter(d => d.status === 'approved').length
    const progress = totalDocs > 0 ? Math.round((approvedCount / totalDocs) * 100) : 0

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                )
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Clock className="w-3 h-3" /> Pending Review
                    </span>
                )
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" /> Rejected
                    </span>
                )
            case 'missing':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                        <AlertCircle className="w-3 h-3" /> Missing
                    </span>
                )
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <FileText className="w-3 h-3" /> Uploaded
                    </span>
                )
        }
    }

    const getDocIcon = (status: string) => {
        switch (status) {
            case 'approved': return <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center"><FileText className="w-4 h-4 text-green-600" /></div>
            case 'pending': return <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
            case 'rejected': return <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center"><FileText className="w-4 h-4 text-red-600" /></div>
            case 'missing': return <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"><FileText className="w-4 h-4 text-gray-400" /></div>
            default: return <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-4 h-4 text-blue-600" /></div>
        }
    }

    const formatDate = (date: string | null) => {
        if (!date) return '--'
        const d = new Date(date)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return 'Today'
        if (diffDays === 1) return 'Yesterday'
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }

    // Generate initials for avatar
    const initials = studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-emerald-600" title="Quick View">
                    <Eye className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[720px] max-h-[85vh] p-0 overflow-hidden rounded-2xl" aria-describedby={undefined}>
                {/* Header — Student Info */}
                <div className="px-6 pt-6 pb-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm border-2 border-emerald-200">
                                {initials}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-foreground">{studentName}</DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                <span className="text-emerald-600 font-medium">{regNo || 'N/A'}</span>
                                <span className="mx-1.5">•</span>
                                {programName}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200">
                            <Mail className="w-3.5 h-3.5" /> Email Student
                        </Button>
                    </div>
                </div>

                {/* Checklist Header */}
                <div className="px-6 pt-4 pb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        <h4 className="text-base font-bold text-foreground">Document Checklist</h4>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                        Progress: <span className="text-foreground font-bold">{progress}%</span>
                    </span>
                </div>

                {/* Table */}
                <div className="px-6 overflow-y-auto" style={{ maxHeight: '400px' }}>
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            Loading checklist...
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No checklist items found for this program.
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b">
                                    <th className="pb-3 font-semibold">Document Name</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Last Updated</th>
                                    <th className="pb-3 font-semibold w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {docs.map((doc, idx) => (
                                    <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                {getDocIcon(doc.status)}
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{doc.title}</p>
                                                    {doc.version > 0 && (
                                                        <p className="text-[11px] text-muted-foreground">Version {doc.version}.0</p>
                                                    )}
                                                    {doc.status === 'missing' && doc.is_required && (
                                                        <p className="text-[11px] text-red-500 font-medium">Required immediately</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">{getStatusBadge(doc.status)}</td>
                                        <td className="py-3 text-sm text-muted-foreground">{formatDate(doc.submission_date)}</td>
                                        <td className="py-3">
                                            {doc.status !== 'missing' && doc.doc_id ? (
                                                <DocumentReviewModal
                                                    documentId={doc.doc_id}
                                                    documentTitle={doc.title}
                                                    fileUrl={doc.file_url}
                                                    studentName={studentName}
                                                    studentRegNo={regNo}
                                                    programName={programName}
                                                    version={doc.version}
                                                    submissionDate={doc.submission_date}
                                                    status={doc.status}
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                    <EyeOff className="w-4 h-4 text-gray-300" />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-between">
                    <Link href={`/dashboard/coordinator/student/${studentId}`}>
                        <span className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                            View Full Profile <span>→</span>
                        </span>
                    </Link>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="px-6"
                        onClick={() => setOpen(false)}
                    >
                        Close Checklist
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
