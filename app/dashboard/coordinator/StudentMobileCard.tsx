"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, FileText, MessageCircle, Trash2 } from "lucide-react"
import Link from "next/link"
import { QuickViewModal } from "@/components/QuickViewModal"
import { ChatDialog } from "@/components/ChatDialog"
import { deleteUser } from "@/app/actions/user_admin"
import { toast } from "sonner"
import { Student } from "./columns" // Import type

interface StudentMobileCardProps {
    student: Student
    currentUserId?: string
}

export function StudentMobileCard({ student, currentUserId }: StudentMobileCardProps) {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            {/* Header: Avatar + Name + Status */}
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-emerald-700 font-bold uppercase text-lg shadow-sm ring-1 ring-slate-900/5 overflow-hidden">
                        {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover" />
                        ) : (
                            student.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-base">{student.name}</h3>
                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded w-fit mt-0.5">
                            {student.regNo}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                {student.status === "Complete" ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Complete</span>
                    </div>
                ) : student.status === "Pending" ? (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Pending</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-wide">Action</span>
                    </div>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                    <p className="text-slate-400 font-medium">Program</p>
                    <p className="font-semibold text-slate-700">{student.program}</p>
                </div>
                <div>
                    <p className="text-slate-400 font-medium">Batch</p>
                    <p className="font-semibold text-slate-700">{student.batch}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-slate-400 font-medium mb-1">Documents</p>
                    {student.missingDocs > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-100 text-xs font-bold">
                            <FileText className="w-3 h-3" />
                            {student.missingDocs} Missing
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            All Submitted
                        </span>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-1">
                <div className="flex gap-1">
                    {/* Chat */}
                    {currentUserId && (
                        <ChatDialog
                            currentUserId={currentUserId}
                            otherUserId={student.id}
                            otherUserName={student.name}
                            trigger={
                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 rounded-full text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
                                    <MessageCircle className="w-4 h-4" />
                                </Button>
                            }
                        />
                    )}
                    {/* Quick View */}
                    <QuickViewModal
                        studentId={student.id}
                        studentName={student.name}
                        programName={student.program}
                        regNo={student.regNo}
                    />
                </div>

                <div className="flex gap-2">
                    {/* Delete */}
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-100"
                        onClick={async () => {
                            if (confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
                                const result = await deleteUser(student.id)
                                if (result.success) {
                                    toast.success("User deleted successfully")
                                } else {
                                    toast.error(result.error || "Failed to delete user")
                                }
                            }
                        }}
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>

                    {/* View Profile */}
                    <Link href={`/dashboard/coordinator/student/${student.id}`}>
                        <Button size="sm" className="h-9 px-4 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all font-medium text-xs">
                            View Profile <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
