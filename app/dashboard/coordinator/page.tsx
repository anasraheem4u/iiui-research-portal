import { DataTable } from "@/components/ui/data-table"
import { ExportButton } from "@/components/ExportButton"
import { columns, Student } from "./columns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileDown, Plus, Users, Clock, AlertCircle, FileText, GraduationCap, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StudentApprovalActions } from "@/components/StudentApprovalActions"

type PendingStudent = {
    id: string
    name: string
    email: string
    regNo: string
    program: string
    dept: string
    created_at: string
}

async function getData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Fetch Students
    const { data: students, error } = await supabase
        .from('users')
        .select(`
            id, full_name, email, registration_number, department, program_id, batch_id, status, created_at,
            programs ( id, name ),
            batches ( name )
        `)
        .eq('role', 'student')
        .order('created_at', { ascending: false })

    if (error || !students) return { active: [], pending: [] }

    // Separate Active vs Pending
    const pendingRaw = students.filter(s => s.status === 'pending')
    const activeRaw = students.filter(s => s.status !== 'pending' && s.status !== 'rejected')

    // --- Process Active Students (Documents & Stats) ---

    // 2. Fetch Checklist Items (need title to find "Profile Picture")
    const { data: allChecklistItems } = await supabase
        .from('checklist_items')
        .select('id, program_id, title')

    const checklistMap = new Map<string, number>()
    const photoItemIds = new Set<string>()

    allChecklistItems?.forEach(item => {
        checklistMap.set(item.program_id, (checklistMap.get(item.program_id) || 0) + 1)
        if (item.title.toLowerCase().includes('profile picture') || item.title.toLowerCase().includes('photo')) {
            photoItemIds.add(item.id)
        }
    })

    // 3. Fetch Documents for Active Students only (optimization)
    const activeIds = activeRaw.map(s => s.id)
    const { data: allDocs } = activeIds.length > 0 ? await supabase
        .from('student_documents')
        .select('student_id, status, checklist_item_id, file_url')
        .in('student_id', activeIds) : { data: [] }

    const docMap = new Map<string, Set<string>>()
    const pendingMap = new Map<string, boolean>()
    const pathsToSign: { studentId: string, path: string }[] = []

    allDocs?.forEach(doc => {
        if (!docMap.has(doc.student_id)) docMap.set(doc.student_id, new Set())
        docMap.get(doc.student_id)?.add(doc.checklist_item_id)

        if (doc.status === 'pending' || doc.status === 'under_review') {
            pendingMap.set(doc.student_id, true)
        }

        // Identify Avatar Document
        if (photoItemIds.has(doc.checklist_item_id) && doc.file_url) {
            pathsToSign.push({ studentId: doc.student_id, path: doc.file_url })
        }
    })

    // 3.5 Generate Signed URLs for Avatars
    const avatarMap = new Map<string, string>()
    if (pathsToSign.length > 0) {
        await Promise.all(pathsToSign.map(async ({ studentId, path }) => {
            const { data } = await supabase.storage.from('documents').createSignedUrl(path, 3600)
            if (data?.signedUrl) {
                avatarMap.set(studentId, data.signedUrl)
            }
        }))
    }

    // 4. Transform Active Data
    const active: Student[] = activeRaw.map(student => {
        const programId = student.program_id
        const totalRequired = checklistMap.get(programId) || 0
        const submittedCount = docMap.get(student.id)?.size || 0
        const missing = Math.max(0, totalRequired - submittedCount)
        const hasPending = pendingMap.get(student.id)

        let status: "Complete" | "Pending" | "Incomplete" = "Incomplete"

        if (missing > 0) {
            status = "Incomplete"
        } else if (hasPending) {
            status = "Pending"
        } else {
            status = "Complete"
        }

        return {
            id: student.id,
            name: student.full_name,
            email: student.email,
            regNo: student.registration_number || "N/A",
            program: (student.programs as any)?.name || "N/A",
            programId: student.program_id || "",
            dept: student.department || "N/A",
            batch: (student.batches as any)?.name || "N/A",
            status: status,
            missingDocs: missing,
            avatarUrl: avatarMap.get(student.id)
        }
    })

    // 5. Transform Pending Data
    const pending: PendingStudent[] = pendingRaw.map(s => ({
        id: s.id,
        name: s.full_name,
        email: s.email,
        regNo: s.registration_number || "N/A",
        program: (s.programs as any)?.name || "N/A",
        dept: s.department || "N/A",
        created_at: s.created_at
    }))

    return { active, pending, user }
}

export default async function CoordinatorDashboard() {
    const { active, pending, user } = await getData()

    // Calc Stats
    const totalStudents = active.length
    const pendingReviews = active.filter(s => s.status === 'Pending').length
    const incompleteDocs = active.filter(s => s.missingDocs > 0).length
    const completeDocs = active.filter(s => s.status === 'Complete').length

    const exportData = active.map(s => [
        s.name || 'Unknown',
        s.email || 'N/A',
        s.regNo || 'N/A',
        s.program || 'N/A',
        s.dept || 'N/A',
        s.status,
        s.missingDocs
    ])

    return (
        <div className="flex-1 p-8 overflow-y-auto w-full bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Dark Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl ring-1 ring-white/10 p-10 flex flex-col md:flex-row justify-between items-center gap-8 group transition-all hover:shadow-emerald-900/20">
                    <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-soft-light" />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-900/40" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

                    <div className="relative z-10 space-y-3 text-center md:text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-emerald-400 text-xs font-semibold backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live Dashboard
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 leading-tight">
                            Coordinator <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">control center</span>
                        </h1>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Monitor student progress, review submissions, and manage program requirements efficiently.
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <ExportButton
                            title="Active Students Directory"
                            headers={['Name', 'Email', 'Reg No', 'Program', 'Department', 'Status', 'Missing Docs']}
                            data={exportData}
                            filename="student_directory.pdf"
                            className="w-full md:w-auto bg-slate-800/50 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-white shadow-lg backdrop-blur-sm gap-2 h-12 px-6 rounded-2xl transition-all"
                            label="Export Data"
                        />
                        <Button className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-900/20 gap-2 h-12 px-6 rounded-2xl transition-all hover:scale-105 border border-emerald-500/20">
                            <UserPlus className="w-4 h-4" /> Invite Student
                        </Button>
                    </div>
                </div>

                {/* Stats Grid - Glass Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users className="w-24 h-24 text-emerald-600 -mr-6 -mt-6" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="p-3 w-fit rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{totalStudents}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Total Enrolled</p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-amber-900/5 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Clock className="w-24 h-24 text-amber-600 -mr-6 -mt-6" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="p-3 w-fit rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{pendingReviews}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Pending Review</p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-red-900/5 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <AlertCircle className="w-24 h-24 text-red-600 -mr-6 -mt-6" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="p-3 w-fit rounded-2xl bg-red-50 text-red-600 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{incompleteDocs}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Action Required</p>
                            </div>
                        </div>
                    </div>

                    <div className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <GraduationCap className="w-24 h-24 text-blue-600 -mr-6 -mt-6" />
                        </div>
                        <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
                            <div className="p-3 w-fit rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{completeDocs}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">Fully Verified</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Account Approvals Section */}
                {pending.length > 0 && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                Pending Approvals
                                <span className="flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-amber-100 px-2 text-xs font-bold text-amber-700 shadow-sm border border-amber-200">
                                    {pending.length} Requests
                                </span>
                            </h3>
                        </div>
                        <Card className="border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 overflow-hidden rounded-[2rem] bg-white">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50 border-b border-slate-100 hover:bg-slate-50/50">
                                            <TableHead className="w-[350px] font-bold text-slate-500 uppercase tracking-wider text-xs pl-8 py-6">Candidate</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-6">Program Info</TableHead>
                                            <TableHead className="font-bold text-slate-500 uppercase tracking-wider text-xs py-6">Registered</TableHead>
                                            <TableHead className="text-right font-bold text-slate-500 uppercase tracking-wider text-xs pr-8 py-6">Decision</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pending.map(student => (
                                            <TableRow key={student.id} className="hover:bg-slate-50/50 border-b border-slate-50 transition-colors group">
                                                <TableCell className="py-5 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase text-lg shadow-inner group-hover:scale-110 transition-transform">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-bold text-slate-900 text-base">{student.name}</span>
                                                            <span className="text-sm text-slate-500">{student.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-5">
                                                    <div className="flex flex-col gap-2">
                                                        <Badge variant="outline" className="w-fit bg-white text-slate-700 border-slate-200 font-mono text-xs">{student.regNo}</Badge>
                                                        <span className="text-xs font-medium text-emerald-700">
                                                            {student.program}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm font-medium py-5">
                                                    {new Date(student.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                                </TableCell>
                                                <TableCell className="text-right pr-8 py-5">
                                                    <div className="flex justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                                                        <StudentApprovalActions studentId={student.id} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Main Dashboard Content */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Student Directory</h3>
                    </div>

                    {/* Active Students Table */}
                    <Card className="border-none shadow-xl shadow-slate-200/50 ring-1 ring-slate-900/5 bg-white rounded-[2rem] overflow-hidden">
                        <CardContent className="p-0">
                            <DataTable
                                columns={columns}
                                data={active}
                                meta={{ currentUserId: user?.id }}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
