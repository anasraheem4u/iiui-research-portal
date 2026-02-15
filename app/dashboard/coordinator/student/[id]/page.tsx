import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CheckCircle, XCircle, FileText, Download, User, Calendar, Phone, Mail, GraduationCap, Clock, AlertCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { DocumentActions } from "./DocumentActions"

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function StudentDetailPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Student Profile
    const { data: student } = await supabase
        .from('users')
        .select(`
            *,
            programs ( name ),
            batches ( name )
        `)
        .eq('id', id)
        .single()

    if (!student) return notFound()

    // 2. Fetch Checklist Items for this program
    const { data: checklist } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('program_id', student.program_id)
        .order('order_index', { ascending: true })

    // 3. Fetch Submitted Documents
    const { data: documents } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', id)
        .order('created_at', { ascending: false })

    // 4. Fetch Document Logs
    const { data: logs } = await supabase
        .from('document_logs')
        .select('*')
        .in('document_id', documents?.map(d => d.id) || [])
        .order('created_at', { ascending: false })
        .limit(20)

    // 5. Fetch Avatar URL
    const profileItem = checklist?.find(i =>
        i.title.toLowerCase().includes('profile') ||
        i.title.toLowerCase().includes('photo') ||
        i.title.toLowerCase().includes('picture')
    )
    const avatarDoc = documents?.find(d => d.checklist_item_id === profileItem?.id)

    let avatarUrl = null
    if (avatarDoc?.file_url) {
        const { data } = await supabase.storage.from('documents').createSignedUrl(avatarDoc.file_url, 3600)
        avatarUrl = data?.signedUrl
    }

    // Merge checklist with submissions
    const mergedDocs = (checklist || []).map(item => {
        const sub = documents?.find(d => d.checklist_item_id === item.id)
        return {
            checklistId: item.id,
            title: item.title,
            description: item.description,
            isRequired: item.is_required,
            orderIndex: item.order_index,
            status: sub ? sub.status : 'missing',
            fileUrl: sub?.file_url || null,
            docId: sub?.id || null,
            submissionDate: sub?.created_at || null,
            remarks: sub?.remarks || null,
            version: sub?.version || 0
        }
    })

    const totalDocs = mergedDocs.length
    const approvedCount = mergedDocs.filter(d => d.status === 'approved').length
    const pendingCount = mergedDocs.filter(d => d.status === 'pending').length
    const rejectedCount = mergedDocs.filter(d => d.status === 'rejected').length
    const missingCount = mergedDocs.filter(d => d.status === 'missing').length
    const completionPercent = totalDocs > 0 ? Math.round((approvedCount / totalDocs) * 100) : 0

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 px-2.5 py-0.5 font-medium shadow-sm">
                    <CheckCircle className="w-3.5 h-3.5" /> Approved
                </Badge>
            )
            case 'pending': return (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5 px-2.5 py-0.5 font-medium shadow-sm">
                    <Clock className="w-3.5 h-3.5" /> Pending
                </Badge>
            )
            case 'rejected': return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1.5 px-2.5 py-0.5 font-medium shadow-sm">
                    <XCircle className="w-3.5 h-3.5" /> Rejected
                </Badge>
            )
            case 'missing': return (
                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 gap-1.5 px-2.5 py-0.5 font-medium dashed border">
                    <AlertCircle className="w-3.5 h-3.5" /> Missing
                </Badge>
            )
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto w-full bg-slate-50/30">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-border/60">
                    <div className="flex items-center gap-5">
                        <Link href="/dashboard/coordinator">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-sm">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{student.full_name}</h1>
                                <Badge className="bg-emerald-600 hover:bg-emerald-700 shadow-sm">Active Student</Badge>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {student.email}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{student.registration_number}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="text-right hidden md:block mr-4">
                            <p className="text-sm font-medium text-slate-900">{(student.programs as any)?.name}</p>
                            <p className="text-xs text-muted-foreground">Batch: {(student.batches as any)?.name}</p>
                        </div>
                        <Button variant="outline" className="gap-2 shadow-sm border-slate-200 hover:bg-white hover:text-emerald-700">
                            <Download className="w-4 h-4" /> Export Profile
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile & Stats */}
                    <div className="space-y-6 lg:col-span-1">
                        {/* Profile Card */}
                        <Card className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative">
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg ring-1 ring-emerald-50">
                                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-emerald-700 text-3xl font-bold overflow-hidden">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                student.full_name?.[0] || 'U'
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <CardContent className="pt-16 pb-6 px-6 text-center space-y-4">
                                <div>
                                    <h2 className="font-bold text-lg text-slate-900">{student.full_name}</h2>
                                    <p className="text-sm text-muted-foreground">{student.department || "N/A"}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-left pt-4 border-t border-slate-100">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone</p>
                                        <p className="text-sm font-medium truncate">{student.phone_number || "—"}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Joined</p>
                                        <p className="text-sm font-medium">{new Date(student.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Completion Stats */}
                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                                    Progress Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">Completion</span>
                                        <span className="font-bold text-emerald-600">{completionPercent}%</span>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${completionPercent}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 flex flex-col items-center">
                                        <span className="text-2xl font-bold text-emerald-700">{approvedCount}</span>
                                        <span className="text-xs text-emerald-600 font-medium">Approved</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-100 flex flex-col items-center">
                                        <span className="text-2xl font-bold text-amber-700">{pendingCount}</span>
                                        <span className="text-xs text-amber-600 font-medium">Pending</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-red-50/50 border border-red-100 flex flex-col items-center">
                                        <span className="text-2xl font-bold text-red-700">{rejectedCount}</span>
                                        <span className="text-xs text-red-600 font-medium">Rejected</span>
                                    </div>
                                    <div className="p-3 rounded-lg bg-slate-50/50 border border-slate-100 flex flex-col items-center">
                                        <span className="text-2xl font-bold text-slate-600">{missingCount}</span>
                                        <span className="text-xs text-slate-500 font-medium">Missing</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-emerald-600" />
                                    Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="relative border-l border-slate-200 ml-2 space-y-6 py-2">
                                    {logs && logs.length > 0 ? logs.slice(0, 5).map((log, idx) => (
                                        <div key={log.id} className="relative pl-6 group">
                                            <div className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white ring-1 transition-colors ${log.new_status === 'approved' ? 'bg-emerald-500 ring-emerald-100 group-hover:ring-emerald-300' :
                                                log.new_status === 'rejected' ? 'bg-red-500 ring-red-100 group-hover:ring-red-300' :
                                                    'bg-slate-300 ring-slate-100'
                                                }`} />
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-sm font-medium text-slate-800 capitalize leading-none">
                                                    Status changed to <span className={
                                                        log.new_status === 'approved' ? 'text-emerald-600' :
                                                            log.new_status === 'rejected' ? 'text-red-600' : ''
                                                    }>{log.new_status}</span>
                                                </p>
                                                <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleDateString()}</span>
                                                {log.remarks && (
                                                    <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded mt-1 border border-slate-100 italic">
                                                        "{log.remarks}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-muted-foreground pl-6">No recent activity recorded.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Documents Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-800">Document Checklist</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Review and manage student submissions ({totalDocs} items)</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {/* Filters could go here */}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                                            <TableHead className="w-12 text-center font-semibold text-slate-700">#</TableHead>
                                            <TableHead className="min-w-[200px] font-semibold text-slate-700">Document Name</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Ver</TableHead>
                                            <TableHead className="font-semibold text-slate-700">Remarks</TableHead>
                                            <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {mergedDocs.map((doc, idx) => (
                                            <TableRow
                                                key={doc.checklistId}
                                                className={`group transition-colors hover:bg-slate-50/80 ${doc.status === 'pending' ? 'bg-amber-50/10' : ''
                                                    }`}
                                            >
                                                <TableCell className="text-center text-xs font-mono text-muted-foreground">{idx + 1}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${doc.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                                                            doc.status === 'missing' ? 'bg-slate-100 text-slate-400' :
                                                                'bg-blue-50 text-blue-600'
                                                            }`}>
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className={`font-medium text-sm ${doc.status === 'missing' ? 'text-muted-foreground' : 'text-slate-800'}`}>
                                                                {doc.title}
                                                            </span>
                                                            {!doc.isRequired && <span className="text-[10px] text-emerald-600 font-medium">Optional</span>}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getStatusBadge(doc.status)}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {doc.submissionDate ? new Date(doc.submissionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground font-mono">
                                                    {doc.version > 0 ? `v${doc.version}` : '—'}
                                                </TableCell>
                                                <TableCell>
                                                    {doc.remarks ? (
                                                        <div className="relative group/tooltip">
                                                            <div className="max-w-[120px] truncate text-xs text-muted-foreground cursor-help underline decoration-dotted">
                                                                {doc.remarks}
                                                            </div>
                                                            {/* Simple tooltip fallback */}
                                                            <div className="absolute hidden group-hover/tooltip:block z-10 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg -top-8 left-0 pointer-events-none">
                                                                {doc.remarks}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground/30 text-xs">—</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {doc.status !== 'missing' && doc.docId && (
                                                        <DocumentActions
                                                            documentId={doc.docId}
                                                            documentTitle={doc.title}
                                                            fileUrl={doc.fileUrl}
                                                            studentName={student.full_name}
                                                            studentRegNo={student.registration_number || 'N/A'}
                                                            programName={(student.programs as any)?.name}
                                                            version={doc.version}
                                                            submissionDate={doc.submissionDate}
                                                            status={doc.status}
                                                        />
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
