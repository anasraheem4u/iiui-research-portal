import { getAnnouncements } from '@/app/actions/announcements'
import { AnnouncementsFeed } from '@/components/AnnouncementsFeed'
import { Megaphone } from 'lucide-react'

export const metadata = {
    title: 'Announcements | Student Portal',
    description: 'Read important announcements.',
}

export default async function StudentAnnouncements() {
    const announcements = await getAnnouncements()

    return (
        <div className="flex-1 p-6 md:p-8 overflow-y-auto w-full bg-slate-50/50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Modern Hero Header */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl ring-1 ring-white/10 p-8 md:p-10 flex items-center justify-between gap-6 group transition-all hover:shadow-emerald-900/10">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
                    <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-5 mix-blend-soft-light" />

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-3 text-emerald-400 font-medium mb-1">
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="tracking-widest uppercase text-xs">Official Updates</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight">
                            Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Announcements</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-xl font-light">
                            Stay informed with important news, deadlines, and guidelines from the department.
                        </p>
                    </div>

                    <div className="hidden md:block relative z-10 p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl rotate-3 transition-transform group-hover:rotate-6">
                        <Megaphone className="w-12 h-12 text-emerald-400" />
                    </div>
                </div>

                <AnnouncementsFeed announcements={announcements} isAdmin={false} />
            </div>
        </div>
    )
}
