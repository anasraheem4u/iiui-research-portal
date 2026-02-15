import { CheckCircle, Clock, AlertTriangle, AlertCircle, Calendar, LifeBuoy, ArrowRight, Filter, Plus, FileText, Download } from 'lucide-react'
import { UploadModal } from '@/components/UploadModal'
import { EditProfileModal } from '@/components/EditProfileModal'
import { ChatDialog } from '@/components/ChatDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function StudentDashboard() {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 2. Fetch User Profile with Program & Batch
    let { data: profile } = await supabase
        .from('users')
        .select(`
            *,
            programs ( name, type ),
            batches ( name ),
            coordinator:coordinator_id ( full_name )
        `)
        .eq('id', user.id)
        .single()

    // Auto-recover logic (omitted for brevity, assume profile exists or handled)
    if (!profile) {
        const meta = user.user_metadata || {}
        await supabase.from('users').insert({
            id: user.id,
            email: user.email,
            full_name: meta.full_name || user.email?.split('@')[0] || 'Student',
            role: 'student',
        })
        const { data: retryProfile } = await supabase.from('users').select(`*, programs ( name, type ), batches ( name )`).eq('id', user.id).single()
        profile = retryProfile
    }

    if (!profile) return <div>Error loading profile.</div>

    const programId = profile.program_id
    const programName = profile.programs?.name || "N/A"
    const batchName = profile.batches?.name || "N/A"
    const regNo = profile.registration_number || "N/A"

    // Check Account Status
    if (profile.status === 'pending') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[80vh]">
                <div className="max-w-md text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
                        <Clock className="w-10 h-10 text-amber-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Awaiting Approval</h1>
                        <p className="text-slate-500 mt-2 leading-relaxed">
                            Your account is currently pending approval from your coordinator.
                        </p>
                    </div>
                </div>
            </div>
        )
    } else if (profile.status === 'rejected') {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[80vh]">
                <div className="max-w-md text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-red-50/50">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Account Rejected</h1>
                        <p className="text-slate-500 mt-2 leading-relaxed">
                            Your account registration has been rejected.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // 3. Fetch Checklist Requirements
    const { data: checklistItems } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('program_id', programId)
        .order('order_index', { ascending: true })

    // 4. Fetch User's Submitted Documents
    const { data: studentDocs } = await supabase
        .from('student_documents')
        .select('*')
        .eq('student_id', user.id)

    // 5. Merge Data
    const mergedDocs = checklistItems?.map(item => {
        const submission = studentDocs?.find(doc => doc.checklist_item_id === item.id)
        return {
            title: item.title,
            checklistId: item.id,
            description: item.description,
            isRequired: item.is_required,
            status: submission ? submission.status : 'missing',
            version: submission ? submission.version : 0,
            date: submission ? new Date(submission.created_at).toLocaleDateString() : '--',
            remark: submission?.remarks,
            docId: submission?.id
        }
    }) || []

    // 6. Calculate Stats
    const totalItems = checklistItems?.length || 0
    const approved = mergedDocs.filter(d => d.status === 'approved').length
    const rejected = mergedDocs.filter(d => d.status === 'rejected').length
    const review = mergedDocs.filter(d => d.status === 'pending').length
    const missing = mergedDocs.filter(d => d.status === 'missing').length
    const progress = totalItems > 0 ? Math.round((approved / totalItems) * 100) : 0

    // Circular Progress Math
    const radius = 40
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (progress / 100) * circumference

    // 7. Fetch Avatar URL
    let avatarUrl = null
    const profileItem = checklistItems?.find(i => i.title.toLowerCase().includes('profile') || i.title.toLowerCase().includes('photo'))
    const avatarDoc = studentDocs?.find(d => d.checklist_item_id === profileItem?.id)

    if (avatarDoc?.file_url) {
        const { data } = await supabase.storage.from('documents').createSignedUrl(avatarDoc.file_url, 3600)
        avatarUrl = data?.signedUrl
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved": return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle className="w-5 h-5" /></div>;
            case "rejected": return <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertCircle className="w-5 h-5" /></div>;
            case "pending": return <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock className="w-5 h-5" /></div>;
            case "missing": return <div className="p-2 bg-slate-50 text-slate-400 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>;
            default: return null;
        }
    }

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">

                {/* Header Section */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl ring-1 ring-white/10 p-10 md:p-12 mb-10 group">
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl transition-transform duration-1000 group-hover:scale-110"></div>
                    <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto text-center md:text-left">
                            <div className="relative group/avatar">
                                <div className="w-32 h-32 rounded-full ring-4 ring-white/10 shadow-2xl overflow-hidden bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-5xl select-none relative z-10">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110" />
                                    ) : (
                                        <span>{profile.full_name?.charAt(0).toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl -z-10 group-hover/avatar:bg-emerald-500/40 transition-all duration-500"></div>

                                <div className="absolute -bottom-2 -right-2 flex gap-2 z-20">
                                    <div className="bg-white rounded-full p-1 shadow-lg hover:scale-105 transition-transform">
                                        <EditProfileModal user={profile} />
                                    </div>
                                    {profile.coordinator_id && (
                                        <div className="bg-white rounded-full p-1 shadow-lg hover:scale-105 transition-transform">
                                            <ChatDialog
                                                currentUserId={user.id}
                                                otherUserId={profile.coordinator_id}
                                                otherUserName={profile.coordinator?.full_name || 'Coordinator'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs uppercase tracking-wider font-bold backdrop-blur-sm">
                                        {batchName} Batch
                                    </Badge>
                                    <span className={`flex h-2 w-2 rounded-full ${rejected > 0 ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]'}`}></span>
                                </div>

                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                                        Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">{profile.full_name.split(' ')[0]}</span>
                                    </h1>
                                    <p className="text-slate-400 text-lg mt-2 font-light flex items-center justify-center md:justify-start gap-2">
                                        {programName} <span className="w-1 h-1 rounded-full bg-slate-600"></span> <span className="font-mono text-slate-500">{regNo}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Custom Circular Progress */}
                        <div className="hidden xl:flex items-center gap-8 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl min-w-[340px]">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg width="96" height="96" className="transform -rotate-90">
                                    <circle
                                        className="text-slate-700 stroke-current"
                                        strokeWidth="8"
                                        fill="transparent"
                                        r={radius}
                                        cx="48"
                                        cy="48"
                                    />
                                    <circle
                                        className="text-emerald-500 stroke-current transition-all duration-1000 ease-out"
                                        strokeWidth="8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={offset}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r={radius}
                                        cx="48"
                                        cy="48"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{progress}%</span>
                                </div>
                            </div>
                            <div className="space-y-3 flex-1">
                                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-1">
                                    <span className="text-slate-400">Approved</span>
                                    <span className="font-bold text-emerald-400">{approved}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm border-b border-white/5 pb-1">
                                    <span className="text-slate-400">In Review</span>
                                    <span className="font-bold text-amber-400">{review}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Pending</span>
                                    <span className="font-bold text-slate-500">{missing}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Checklist */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                                        <FileText className="w-6 h-6 text-emerald-600" />
                                        Submission Checklist
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">Track your mandatory document submissions.</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center">
                                        {Math.max(0, totalItems - approved)} Remaining
                                    </span>
                                </div>
                            </div>

                            <Card className="border-t-4 border-t-emerald-500 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden ring-1 ring-slate-900/5">
                                <div className="overflow-x-auto">
                                    <Table className="min-w-[700px] lg:min-w-0">
                                        <TableHeader>
                                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b border-slate-200">
                                                <TableHead className="w-[45%] pl-6 py-5 font-bold text-slate-600 uppercase tracking-wider text-xs">Document Name</TableHead>
                                                <TableHead className="font-bold text-slate-600 uppercase tracking-wider text-xs">Date</TableHead>
                                                <TableHead className="font-bold text-slate-600 uppercase tracking-wider text-xs text-center">Status</TableHead>
                                                <TableHead className="text-right pr-6 font-bold text-slate-600 uppercase tracking-wider text-xs">Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {mergedDocs.length > 0 ? (
                                                mergedDocs.map((doc, idx) => (
                                                    <TableRow key={idx} className={cn("hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0", doc.status === 'rejected' && "bg-red-50/30")}>
                                                        <TableCell className="pl-6 py-5">
                                                            <div className="flex flex-col gap-1.5">
                                                                <div className="flex items-center gap-3">
                                                                    {getStatusIcon(doc.status)}
                                                                    <div>
                                                                        <span className={cn("font-bold text-base block", doc.status === 'approved' ? "text-slate-800" : "text-slate-700")}>
                                                                            {doc.title}
                                                                        </span>
                                                                        <span className="text-xs text-slate-400 line-clamp-1 max-w-[200px]">{doc.description}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-sm text-slate-500 py-5 font-mono text-xs">
                                                            {doc.date}
                                                        </TableCell>
                                                        <TableCell className="py-5 text-center">
                                                            {doc.status === 'approved' && <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none px-3 py-1">Approved</Badge>}
                                                            {doc.status === 'rejected' && <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-none px-3 py-1">Rejected</Badge>}
                                                            {doc.status === 'pending' && <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-none px-3 py-1">Reviewing</Badge>}
                                                            {doc.status === 'missing' && <Badge variant="outline" className="text-slate-400 border-slate-200 px-3 py-1">Missing</Badge>}
                                                        </TableCell>
                                                        <TableCell className="text-right pr-6 py-5">
                                                            {doc.status === 'missing' ? (
                                                                <div className="flex justify-end">
                                                                    <UploadModal documentTitle={doc.title} checklistId={doc.checklistId} />
                                                                </div>
                                                            ) : doc.status === 'rejected' ? (
                                                                <div className="flex flex-col items-end gap-2">
                                                                    <span className="text-[10px] text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded-full max-w-[120px] truncate border border-red-100" title={doc.remark}>
                                                                        {doc.remark || 'Fix Required'}
                                                                    </span>
                                                                    <UploadModal documentTitle={doc.title} checklistId={doc.checklistId} existingDocId={doc.docId} />
                                                                </div>
                                                            ) : doc.status === 'approved' ? (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-xs font-bold border border-slate-200">
                                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                                                    Completed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-500 text-xs font-bold border border-slate-200">
                                                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                                                    Wait
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="h-48 text-center text-slate-400">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="p-4 rounded-full bg-slate-50 text-slate-300">
                                                                <Filter className="w-8 h-8" />
                                                            </div>
                                                            <p>No checklist items found for your program.</p>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        </section>
                    </div>

                    {/* Sidebar Widgets */}
                    <div className="space-y-6">
                        {/* Guidelines Card */}
                        <div className="group relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-white shadow-xl shadow-slate-900/20 ring-1 ring-white/10">
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl transition-transform duration-500 group-hover:scale-125"></div>
                            <div className="relative z-10 flex h-full flex-col justify-between space-y-12">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 backdrop-blur-sm border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                        <LifeBuoy className="mr-2 h-3.5 w-3.5" />
                                        Quick Guide
                                    </div>
                                    <h3 className="text-3xl font-bold leading-tight">
                                        Formatting <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Guidelines</span>
                                    </h3>
                                    <p className="text-sm leading-relaxed text-slate-400 font-light">
                                        Ensure your thesis follows the latest IIUI academic standards for spacing, citation, and structure.
                                    </p>
                                </div>
                                <a href="#" className="flex items-center gap-3 text-sm font-bold text-emerald-400 transition-colors hover:text-white group/link">
                                    <div className="p-2 bg-white/5 rounded-lg group-hover/link:bg-white/10">
                                        <Download className="h-4 w-4" />
                                    </div>
                                    Download PDF <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                                </a>
                            </div>
                        </div>

                        {/* Calendar Widget */}
                        <Card className="border-none shadow-lg shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white ring-1 ring-slate-900/5">
                            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-emerald-600" /> Important Dates
                                </h3>
                            </div>
                            <div className="p-2 space-y-1">
                                {[
                                    { event: "Proposal Submission", date: "Oct 15", active: false },
                                    { event: "Mid-Term Defense", date: "Dec 10", active: true },
                                    { event: "Final Thesis", date: "Jan 15", active: false },
                                ].map((item, i) => (
                                    <div key={i} className={cn("flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-slate-50 group cursor-default", item.active && "bg-emerald-50/50 border border-emerald-100 shadow-sm")}>
                                        <div className={cn("flex flex-col items-center justify-center w-12 h-12 rounded-xl font-bold text-xs shrink-0 transition-colors", item.active ? "bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200")}>
                                            <span className="text-[10px] uppercase font-normal opacity-70">{item.date.split(' ')[0]}</span>
                                            <span className="text-lg">{item.date.split(' ')[1]}</span>
                                        </div>
                                        <div>
                                            <p className={cn("text-sm font-bold", item.active ? "text-slate-900" : "text-slate-600")}>{item.event}</p>
                                            <p className="text-xs text-slate-400">2026 Academic Year</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
