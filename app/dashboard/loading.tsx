import { SkeletonLoader } from "@/components/SkeletonLoader"

export default function DashboardLoading() {
    return (
        <div className="flex-1 p-8 overflow-y-auto bg-slate-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-slate-200 rounded animate-pulse"></div>
                        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-10 w-32 bg-slate-200 rounded animate-pulse"></div>
                </div>

                {/* Stats Grid Skeleton (Optional, using simple boxes) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
                    ))}
                </div>

                {/* Main Content Grid using the User's Loader */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                    <SkeletonLoader />
                </div>
            </div>
        </div>
    )
}
