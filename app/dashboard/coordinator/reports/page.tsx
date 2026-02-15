import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileDown, Printer, Users, FileText, CheckCircle2, XCircle, Clock, GraduationCap, PieChart, BarChart3, ArrowUpRight, Filter } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { AdvancedReportGenerator } from "@/components/AdvancedReportGenerator"


export default async function ReportsPage() {
    const supabase = await createClient()

    // Fetch all students with program info
    const { data: students } = await supabase
        .from('users')
        .select('id, full_name, email, registration_number, program_id, programs(name, type)')
        .eq('role', 'student')

    const totalStudents = students?.length || 0

    // Count by program type
    const msStudents = students?.filter(s => (s.programs as any)?.type?.toLowerCase().includes('ms')) || []
    const phdStudents = students?.filter(s => (s.programs as any)?.type?.toLowerCase().includes('phd')) || []

    // Fetch all documents with status counts
    const { data: allDocs } = await supabase
        .from('student_documents')
        .select('id, status, student_id')

    const pendingDocs = allDocs?.filter(d => d.status === 'pending' || d.status === 'under_review').length || 0
    const approvedDocs = allDocs?.filter(d => d.status === 'approved').length || 0
    const rejectedDocs = allDocs?.filter(d => d.status === 'rejected').length || 0
    const totalDocs = allDocs?.length || 0

    // Fetch checklist totals per program
    const { data: checklistItems } = await supabase
        .from('checklist_items')
        .select('id, program_id')

    // Calculate per-program checklist counts
    const msChecklistIds = new Set<string>()
    const phdChecklistIds = new Set<string>()
    checklistItems?.forEach(item => {
        if (item.program_id === '11111111-1111-1111-1111-111111111111') msChecklistIds.add(item.id)
        if (item.program_id === '22222222-2222-2222-2222-222222222222') phdChecklistIds.add(item.id)
    })

    // Calculate documents per student for the detailed table
    const studentDocMap = new Map<string, { total: number, approved: number, pending: number, rejected: number }>()
    allDocs?.forEach(doc => {
        if (!studentDocMap.has(doc.student_id)) {
            studentDocMap.set(doc.student_id, { total: 0, approved: 0, pending: 0, rejected: 0 })
        }
        const counts = studentDocMap.get(doc.student_id)!
        counts.total++
        if (doc.status === 'approved') counts.approved++
        else if (doc.status === 'pending' || doc.status === 'under_review') counts.pending++
        else if (doc.status === 'rejected') counts.rejected++
    })

    const enrichedStudents = students?.map(student => {
        const counts = studentDocMap.get(student.id) || { total: 0, approved: 0, pending: 0, rejected: 0 }
        const requiredCount = student.program_id === '11111111-1111-1111-1111-111111111111' ? msChecklistIds.size : phdChecklistIds.size
        const isComplete = counts.approved >= requiredCount && requiredCount > 0
        const status = isComplete ? 'COMPLETE' : counts.total > 0 ? 'IN PROGRESS' : 'NOT STARTED'

        return {
            id: student.id,
            full_name: student.full_name || 'Unknown',
            registration_number: student.registration_number,
            program: (student.programs as any)?.name || 'N/A',
            status: status as any,
            metrics: counts
        }
    }) || []

    return (
        <div className="h-full overflow-y-auto space-y-8 p-8 md:p-10 pb-24 bg-slate-50/50 w-full relative">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl ring-1 ring-white/10 p-10 md:p-12 mb-10">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>

                <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-emerald-400 font-medium mb-1">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="tracking-widest uppercase text-xs">System Analytics</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                            Reports & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Insights</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl font-light">
                            Generate comprehensive performance reports and track student progress across all programs.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" className="h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-emerald-300 backdrop-blur-md rounded-xl transition-all shadow-xl shadow-black/20">
                            <Printer className="w-5 h-5 mr-2" />
                            Print Report
                        </Button>
                        <AdvancedReportGenerator students={enrichedStudents} />
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: "Total Students", value: totalStudents, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
                    { label: "Total Documents", value: totalDocs, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
                    { label: "Pending Review", value: pendingDocs, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-100" },
                    { label: "Approved", value: approvedDocs, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
                    { label: "Rejected", value: rejectedDocs, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", ring: "ring-rose-100" },
                ].map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-900/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className={`absolute top-0 right-0 h-24 w-24 -mr-6 -mt-6 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-700 ${stat.bg}`}></div>
                        <div className="relative flex flex-col justify-between h-full">
                            <div className={`h-12 w-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-inner ring-1 ${stat.ring}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                                <p className="text-sm font-medium text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Graphical Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Program Breakdown */}
                <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 overflow-hidden ring-1 ring-slate-900/5">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <PieChart className="w-5 h-5 text-emerald-500" />
                                    Program Analytics
                                </CardTitle>
                                <p className="text-sm text-slate-500">Breakdown of students across programs</p>
                            </div>
                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50">
                                <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-slate-50/50 text-left text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-100">
                                        <th className="px-8 py-4">Metric</th>
                                        <th className="px-8 py-4 text-center text-teal-600 bg-teal-50/30">MS Scholars</th>
                                        <th className="px-8 py-4 text-center text-indigo-600 bg-indigo-50/30">PhD Scholars</th>
                                        <th className="px-8 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 font-medium text-slate-700">Active Students</td>
                                        <td className="px-8 py-4 text-center text-slate-600 bg-teal-50/10 font-mono">{msStudents.length}</td>
                                        <td className="px-8 py-4 text-center text-slate-600 bg-indigo-50/10 font-mono">{phdStudents.length}</td>
                                        <td className="px-8 py-4 text-right font-bold text-slate-900">{totalStudents}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 font-medium text-slate-700">Research Milestones</td>
                                        <td className="px-8 py-4 text-center text-slate-600 bg-teal-50/10 font-mono">{msChecklistIds.size}</td>
                                        <td className="px-8 py-4 text-center text-slate-600 bg-indigo-50/10 font-mono">{phdChecklistIds.size}</td>
                                        <td className="px-8 py-4 text-right font-bold text-slate-900">{msChecklistIds.size + phdChecklistIds.size}</td>
                                    </tr>
                                    <tr className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-4 font-medium text-slate-700">Degree Duration</td>
                                        <td className="px-8 py-4 text-center text-slate-500 bg-teal-50/10">1.5 - 3 Years</td>
                                        <td className="px-8 py-4 text-center text-slate-500 bg-indigo-50/10">3 - 7 Years</td>
                                        <td className="px-8 py-4 text-right text-slate-400">—</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Document Status Distribution */}
                <Card className="rounded-[2rem] border-none shadow-lg shadow-slate-200/50 overflow-hidden ring-1 ring-slate-900/5 flex flex-col">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                    Submission Status
                                </CardTitle>
                                <p className="text-sm text-slate-500">Real-time status of research submissions</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col justify-center space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Approved
                                </span>
                                <span className="text-lg font-bold text-emerald-600">{approvedDocs}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                <div className="bg-emerald-500 h-3 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${totalDocs > 0 ? (approvedDocs / totalDocs) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Under Review
                                </span>
                                <span className="text-lg font-bold text-amber-600">{pendingDocs}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                <div className="bg-amber-500 h-3 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-1000" style={{ width: `${totalDocs > 0 ? (pendingDocs / totalDocs) * 100 : 0}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Action Required
                                </span>
                                <span className="text-lg font-bold text-rose-600">{rejectedDocs}</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                                <div className="bg-rose-500 h-3 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)] transition-all duration-1000" style={{ width: `${totalDocs > 0 ? (rejectedDocs / totalDocs) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Per-Student Report Table */}
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden ring-1 ring-slate-900/5">
                <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-8 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                <Users className="w-6 h-6 text-emerald-600" />
                                Student Progress Matrix
                            </CardTitle>
                            <p className="text-slate-500">Detailed document submission status per student</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-full h-9 border-dashed text-slate-500 hover:text-emerald-600 hover:border-emerald-200">
                                <Filter className="w-3.5 h-3.5 mr-2" /> Filter
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                                    <th className="px-8 py-5">Candidate</th>
                                    <th className="px-8 py-5">Program</th>
                                    <th className="px-8 py-5 text-center">Submitted</th>
                                    <th className="px-8 py-5 text-center text-emerald-600">Approved</th>
                                    <th className="px-8 py-5 text-center text-amber-600">Pending</th>
                                    <th className="px-8 py-5 text-center text-rose-600">Rejected</th>
                                    <th className="px-8 py-5 text-center">Degree Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {students && students.length > 0 ? (
                                    students.map(student => {
                                        const counts = studentDocMap.get(student.id) || { total: 0, approved: 0, pending: 0, rejected: 0 }
                                        const programName = (student.programs as any)?.name || 'N/A'
                                        const requiredCount = student.program_id === '11111111-1111-1111-1111-111111111111' ? msChecklistIds.size : phdChecklistIds.size
                                        const isComplete = counts.approved >= requiredCount && requiredCount > 0

                                        return (
                                            <tr key={student.id} className="hover:bg-slate-50/80 transition-all group">
                                                <td className="px-8 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs ring-2 ring-white shadow-sm">
                                                            {student.full_name?.split(' ').map((n: any) => n[0]).join('').substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{student.full_name}</div>
                                                            <div className="text-[11px] text-slate-400 font-mono tracking-tight">{student.registration_number}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-4">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-medium border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">{programName}</Badge>
                                                </td>
                                                <td className="px-8 py-4 text-center font-bold text-slate-700">{counts.total}</td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center h-8 w-12 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100 shadow-sm">{counts.approved}</span>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center h-8 w-12 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-100 shadow-sm">{counts.pending}</span>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center h-8 w-12 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-100 shadow-sm">{counts.rejected}</span>
                                                </td>
                                                <td className="px-8 py-4 text-center">
                                                    {isComplete
                                                        ? <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm border border-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> COMPLETE</div>
                                                        : counts.total > 0
                                                            ? <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold shadow-sm border border-amber-200"><Clock className="w-3.5 h-3.5" /> IN PROGRESS</div>
                                                            : <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">NOT STARTED</div>
                                                    }
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-8 py-16 text-center text-slate-400">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <Users className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p>No students registered in the system yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
