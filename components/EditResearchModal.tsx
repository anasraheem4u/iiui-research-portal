"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Pencil, FileText, Loader2, PlusCircle } from "lucide-react"

interface ResearchDetails {
    id?: string
    title?: string
    abstract?: string
    supervisor_name?: string
    co_supervisor_name?: string
    keywords?: string[]
}

interface EditResearchModalProps {
    studentId: string
    research?: ResearchDetails | null
}

export function EditResearchModal({ studentId, research }: EditResearchModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form States
    const [title, setTitle] = useState(research?.title || "")
    const [abstract, setAbstract] = useState(research?.abstract || "")
    const [supervisor, setSupervisor] = useState(research?.supervisor_name || "")
    const [coSupervisor, setCoSupervisor] = useState(research?.co_supervisor_name || "")
    const [keywordsStr, setKeywordsStr] = useState((research?.keywords || []).join(", "))

    const router = useRouter()
    const supabase = createClient()

    async function handleUpdate() {
        if (!title.trim()) {
            toast.error("Research Title is required")
            return
        }

        setLoading(true)

        // Parse keywords
        const keywords = keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 0)

        const payload = {
            student_id: studentId,
            title: title,
            abstract: abstract,
            supervisor_name: supervisor,
            co_supervisor_name: coSupervisor,
            keywords: keywords,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('research_details')
            .upsert(payload, { onConflict: 'student_id' })

        if (error) {
            console.error("Research update error:", error)
            toast.error(`Failed to update research details: ${error.message}`)
        } else {
            toast.success("Research details updated successfully")
            setOpen(false)
            router.refresh()
        }
        setLoading(false)
    }

    const isNew = !research || !research.title;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={isNew ? "default" : "outline"} size="sm" className="gap-2">
                    {isNew ? <PlusCircle className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                    {isNew ? "Add Research Details" : "Edit Details"}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        {isNew ? "Add Research Topic" : "Edit Research Details"}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <label htmlFor="title" className="text-sm font-medium leading-none">
                            Research Title *
                        </label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Advanced AI in Educational Management"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="abstract" className="text-sm font-medium leading-none">
                            Abstract
                        </label>
                        <Textarea
                            id="abstract"
                            value={abstract}
                            onChange={(e) => setAbstract(e.target.value)}
                            placeholder="Briefly describe your research goals..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="supervisor" className="text-sm font-medium leading-none">
                                Primary Supervisor
                            </label>
                            <Input
                                id="supervisor"
                                value={supervisor}
                                onChange={(e) => setSupervisor(e.target.value)}
                                placeholder="e.g. Dr. Ayesha Kwan"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="coSupervisor" className="text-sm font-medium leading-none">
                                Co-Supervisor (Optional)
                            </label>
                            <Input
                                id="coSupervisor"
                                value={coSupervisor}
                                onChange={(e) => setCoSupervisor(e.target.value)}
                                placeholder="e.g. Dr. Bilal Ahmed"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="keywords" className="text-sm font-medium leading-none">
                            Keywords (Comma separated)
                        </label>
                        <Input
                            id="keywords"
                            value={keywordsStr}
                            onChange={(e) => setKeywordsStr(e.target.value)}
                            placeholder="AI, Education, Machine Learning"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Save Details
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
