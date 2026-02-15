'use client'

import { createAnnouncement } from '@/app/actions/announcements'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useState } from 'react'
import { Loader2, Plus, Megaphone } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"

export function CreateAnnouncementForm() {
    const [open, setOpen] = useState(false)
    const [pending, setPending] = useState(false)

    async function handleSubmit(formData: FormData) {
        setPending(true)
        const res = await createAnnouncement(formData)
        setPending(false)
        if (res.error) {
            alert(res.error)
        } else {
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-500/20">
                    <Plus className="w-4 h-4" /> New Announcement
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        Post Announcement
                    </DialogTitle>
                    <DialogDescription>
                        Create a new update for all students. Pinned announcements appear at the top.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required placeholder="e.g. Fall Semester Registration" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea id="content" name="content" required placeholder="Detailed information..." className="min-h-[120px] resize-none" />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input type="checkbox" id="pinned" name="is_pinned" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <Label htmlFor="pinned" className="cursor-pointer">Pin to top</Label>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={pending} className="bg-emerald-600 hover:bg-emerald-700">
                            {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post Now
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
