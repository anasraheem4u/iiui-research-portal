import { EducationLoader } from "@/components/EducationLoader"

export default function DashboardLoading() {
    return (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 min-h-screen">
            <div className="flex items-center justify-center min-h-[60vh]">
                <EducationLoader />
            </div>
        </div>
    )
}
