"use client"
import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useState } from "react"
import { Upload, FileUp, CheckCircle2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

interface UploadModalProps {
    documentTitle: string
    checklistId: string
    existingDocId?: string // If re-uploading a rejected doc
    onUploadSuccess?: () => void
}

export function UploadModal({ documentTitle, checklistId, existingDocId, onUploadSuccess }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [open, setOpen] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    async function handleUpload() {
        if (!file) {
            toast.error("Please select a file")
            return
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'text/plain',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Allowed: PDF, JPG, PNG, TXT, DOCX")
            return
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size must be less than 10MB")
            return
        }

        setUploading(true)

        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error("You must be logged in to upload documents")
                setUploading(false)
                return
            }

            // Upload file to Supabase Storage
            const fileExt = file.name.split('.').pop()
            const timestamp = Date.now()
            const filePath = `${user.id}/${checklistId}/${timestamp}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file, { upsert: true })

            if (uploadError) {
                console.error("Storage upload error:", uploadError)
                toast.error(`Upload failed: ${uploadError.message}`)
                setUploading(false)
                return
            }

            // If re-uploading a rejected doc, update existing record
            if (existingDocId) {
                const { error: updateError } = await supabase
                    .from('student_documents')
                    .update({
                        file_url: filePath,
                        status: 'pending',
                        version: 1, // Will be incremented by a trigger if needed
                        submission_date: new Date().toISOString(),
                        remarks: null,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', existingDocId)

                if (updateError) {
                    console.error("DB update error:", updateError)
                    toast.error(`Failed to update record: ${updateError.message}`)
                    setUploading(false)
                    return
                }
            } else {
                // Insert new document record
                const { error: insertError } = await supabase
                    .from('student_documents')
                    .insert({
                        student_id: user.id,
                        checklist_item_id: checklistId,
                        title: documentTitle,
                        file_url: filePath,
                        status: 'pending',
                        version: 1,
                        submission_date: new Date().toISOString()
                    })

                if (insertError) {
                    console.error("DB insert error:", insertError)
                    toast.error(`Failed to save record: ${insertError.message}`)
                    setUploading(false)
                    return
                }
            }

            toast.success(`${documentTitle} uploaded successfully!`)
            setUploading(false)
            setFile(null)
            setOpen(false)
            router.refresh() // Refresh server components to show updated data
            if (onUploadSuccess) onUploadSuccess()

        } catch (err) {
            console.error("Unexpected upload error:", err)
            toast.error("An unexpected error occurred during upload")
            setUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700">
                    <Upload className="w-3 h-3" /> {existingDocId ? 'Re-Upload' : 'Upload Now'}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileUp className="w-5 h-5 text-emerald-600" />
                        Upload: {documentTitle}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Upload Zone */}
                    <div
                        className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer bg-emerald-50/30"
                        onClick={() => document.getElementById('file-input')?.click()}
                    >
                        {file ? (
                            <div className="flex flex-col items-center gap-2">
                                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                <p className="font-medium text-emerald-700">{file.name}</p>
                                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                                <p className="font-medium text-foreground">Click to select a file</p>
                                <p className="text-xs text-muted-foreground">PDF, JPG, PNG, TXT, DOCX (Max 10MB)</p>
                            </div>
                        )}
                    </div>
                    <Input
                        id="file-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.txt,.docx"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                    />

                    {/* Rules */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-2 text-amber-700 text-xs font-medium">
                            <AlertCircle className="w-4 h-4" />
                            Upload Rules
                        </div>
                        <ul className="text-xs text-amber-600 space-y-0.5 ml-6 list-disc">
                            <li>Allowed: PDF, JPG, PNG, TXT, DOCX</li>
                            <li>Maximum file size: 10MB</li>
                            <li>Documents cannot be edited after approval</li>
                            <li>Re-upload is only allowed if rejected</li>
                        </ul>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleUpload}
                        disabled={uploading || !file}
                        className="bg-emerald-600 hover:bg-emerald-700"
                    >
                        {uploading ? "Uploading..." : "Submit for Review"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog >
    )
}
