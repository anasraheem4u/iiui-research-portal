'use client'

import { Announcement, deleteAnnouncement } from '@/app/actions/announcements'
import { Card } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Pin, Megaphone, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function AnnouncementsFeed({ announcements, isAdmin }: { announcements: Announcement[], isAdmin?: boolean }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return

        startTransition(async () => {
            await deleteAnnouncement(id)
            router.refresh()
        })
    }

    if (announcements.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200 text-center">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No announcements yet</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-1">Check back later for important updates.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {announcements.map(a => (
                <Card
                    key={a.id}
                    className={cn(
                        "p-6 relative group border-l-4 hover:shadow-lg transition-all duration-300 overflow-hidden bg-white",
                        a.is_pinned ? "border-l-emerald-500 shadow-emerald-900/5 ring-1 ring-emerald-900/5" : "border-l-slate-300 shadow-sm"
                    )}
                >
                    {a.is_pinned && (
                        <div className="absolute top-0 right-0 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1 shadow-sm">
                            <Pin className="w-3 h-3 rotate-45" /> Pinned
                        </div>
                    )}

                    <div className="flex gap-4">
                        <div className={cn(
                            "mt-1 p-2.5 rounded-xl h-fit w-fit",
                            a.is_pinned ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                        )}>
                            <Megaphone className="w-5 h-5" />
                        </div>

                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start pr-16">
                                <h3 className="font-bold text-lg text-slate-900 leading-tight">{a.title}</h3>
                            </div>

                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content}</p>

                            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <span>{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</span>
                                {isAdmin && (
                                    <>
                                        <span>•</span>
                                        <span>Post ID: {a.id.slice(0, 8)}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleDelete(a.id)}
                                disabled={isPending}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete Announcement"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </Card>
            ))}
        </div>
    )
}
