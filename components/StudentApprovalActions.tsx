"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { approveStudent, rejectStudent } from "@/app/actions/user_approvals"
import { toast } from "sonner"

export function StudentApprovalActions({ studentId }: { studentId: string }) {
    const [isPending, startTransition] = useTransition()

    const handleApprove = () => {
        startTransition(async () => {
            try {
                await approveStudent(studentId)
                toast.success("Student approved successfully")
            } catch (e) {
                toast.error("Failed to approve student")
            }
        })
    }

    const handleReject = () => {
        startTransition(async () => {
            try {
                await rejectStudent(studentId)
                toast.success("Student rejected")
            } catch (e) {
                toast.error("Failed to reject student")
            }
        })
    }

    return (
        <div className="flex gap-2">
            <Button
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
                className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-1.5 text-xs font-medium shadow-sm transition-all hover:scale-105"
            >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Approve
            </Button>
            <Button
                size="sm"
                variant="destructive"
                onClick={handleReject}
                disabled={isPending}
                className="h-8 gap-1.5 text-xs font-medium shadow-sm transition-all hover:scale-105"
            >
                {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                Reject
            </Button>
        </div>
    )
}
