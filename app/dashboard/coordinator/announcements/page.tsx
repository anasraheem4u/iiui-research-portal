import { getAnnouncements } from '@/app/actions/announcements'
import { AnnouncementsFeed } from '@/components/AnnouncementsFeed'
import { CreateAnnouncementForm } from '@/components/CreateAnnouncementForm'
import { Megaphone } from 'lucide-react'

export const metadata = {
    title: 'Announcements | Coordinator',
    description: 'Manage system-wide announcements.',
}

export default async function CoordinatorAnnouncements() {
    const announcements = await getAnnouncements()

    return (
        <div className="flex-1 p-8 overflow-y-auto w-full bg-slate-50/50 min-h-screen">
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                            <Megaphone className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manage Announcements</h1>
                            <p className="text-sm text-slate-500">Broadcast important updates to all students.</p>
                        </div>
                    </div>
                    <CreateAnnouncementForm />
                </div>

                <AnnouncementsFeed announcements={announcements} isAdmin={true} />
            </div>
        </div>
    )
}
