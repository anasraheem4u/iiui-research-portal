"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, FileText, User, ArrowUpDown, MessageCircle, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { QuickViewModal } from "@/components/QuickViewModal"
import { ChatDialog } from "@/components/ChatDialog"

export type Student = {
    id: string
    name: string
    email: string
    regNo: string
    program: string
    programId: string
    dept: string
    batch: string
    status: "Complete" | "Pending" | "Incomplete"
    missingDocs: number
    avatarUrl?: string
}

export const columns: ColumnDef<Student>[] = [
    {
        accessorKey: "name",
        header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent font-bold text-slate-700 text-xs uppercase tracking-wider" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Candidate <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => {
            const student = row.original
            return (
                <div className="flex items-center gap-4 py-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-700 font-bold uppercase text-sm shadow-sm ring-1 ring-slate-900/5 group-hover:scale-105 transition-transform overflow-hidden relative">
                        {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                            student.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                        )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">{student.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono tracking-tight bg-slate-100 px-1.5 rounded w-fit">{student.regNo}</div>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "program",
        header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent font-bold text-slate-700 text-xs uppercase tracking-wider" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Program Info <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="flex flex-col gap-1.5">
                <Badge variant="outline" className="w-fit bg-emerald-50/50 text-emerald-700 border-emerald-200/60 font-medium text-[11px] px-2.5 py-0.5 shadow-sm rounded-md hover:bg-emerald-100/50 transition-colors">
                    {row.original.program}
                </Badge>
                <span className="text-[11px] text-slate-500 font-medium ml-1 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    {row.original.dept}
                </span>
            </div>
        ),
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        }
    },
    {
        accessorKey: "batch",
        header: () => <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Batch</span>,
        cell: ({ row }) => <span className="text-slate-600 text-sm font-medium">{row.original.batch}</span>
    },
    {
        accessorKey: "status",
        header: () => <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">Status</span>,
        cell: ({ row }) => {
            const status = row.original.status
            if (status === "Complete") return (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 w-fit">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Complete</span>
                </div>
            )
            if (status === "Pending") return (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 w-fit">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">Pending</span>
                </div>
            )
            return (
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 w-fit">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Action Req.</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        }
    },
    {
        accessorKey: "missingDocs",
        header: ({ column }) => (
            <Button variant="ghost" className="p-0 hover:bg-transparent font-bold text-slate-700 text-xs uppercase tracking-wider" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                Documents <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
        ),
        cell: ({ row }) => {
            if (row.original.missingDocs > 0) return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold shadow-sm">
                    <FileText className="w-3.5 h-3.5" />
                    {row.original.missingDocs} Missing
                </span>
            )
            return <div className="ml-4 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner"><CheckCircle2 className="w-4 h-4" /></div>
        }
    },
    {
        id: "actions",
        header: () => <div className="text-right font-bold text-slate-700 text-xs uppercase tracking-wider">Actions</div>,
        cell: ({ row, table }) => {
            const student = row.original
            const currentUserId = (table.options.meta as any)?.currentUserId

            return (
                <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    {/* 💬 Chat */}
                    {currentUserId && (
                        <ChatDialog
                            currentUserId={currentUserId}
                            otherUserId={student.id}
                            otherUserName={student.name}
                            trigger={
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 hover:scale-110 transition-all">
                                    <MessageCircle className="w-4 h-4" />
                                </Button>
                            }
                        />
                    )}
                    {/* 👁 Quick View Modal */}
                    <div className="scale-90 hover:scale-100 transition-transform">
                        <QuickViewModal
                            studentId={student.id}
                            studentName={student.name}
                            programName={student.program}
                            regNo={student.regNo}
                        />
                    </div>

                    {/* 🔎 View Profile */}
                    <Link href={`/dashboard/coordinator/student/${student.id}`}>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:scale-110 transition-all">
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </Link>
                </div>
            )
        }
    }
]
