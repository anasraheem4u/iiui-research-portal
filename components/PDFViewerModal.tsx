"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText, Download, ZoomIn, ZoomOut } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface PDFViewerModalProps {
    documentTitle: string
    fileUrl: string | null
}

export function PDFViewerModal({ documentTitle, fileUrl }: PDFViewerModalProps) {
    const [open, setOpen] = useState(false)
    const [signedUrl, setSignedUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [zoom, setZoom] = useState(100)

    const fileExt = fileUrl?.split('.').pop()?.toLowerCase() || ''
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt)
    const isDocx = ['docx', 'doc'].includes(fileExt)

    async function loadPDF() {
        if (!fileUrl) return
        setLoading(true)

        const supabase = createClient()
        const { data, error } = await supabase.storage
            .from('documents')
            .createSignedUrl(fileUrl, 3600) // 1 hour expiry

        if (data?.signedUrl) {
            setSignedUrl(data.signedUrl)
        }
        setLoading(false)
    }

    function handleOpen(isOpen: boolean) {
        setOpen(isOpen)
        if (isOpen && fileUrl) {
            loadPDF()
        }
    }

    async function handleDownload() {
        if (!signedUrl) return
        window.open(signedUrl, '_blank')
    }

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-emerald-600"
                    title="View PDF"
                    disabled={!fileUrl}
                >
                    <FileText className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[85vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        {documentTitle}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setZoom(z => Math.max(50, z - 25))}
                        >
                            <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground w-12 text-center">{zoom}%</span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setZoom(z => Math.min(200, z + 25))}
                        >
                            <ZoomIn className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1"
                            onClick={handleDownload}
                            disabled={!signedUrl}
                        >
                            <Download className="w-4 h-4" /> Download
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-gray-100 p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center space-y-2">
                                <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                                <p>Loading document...</p>
                            </div>
                        </div>
                    ) : signedUrl ? (
                        isDocx ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center space-y-4">
                                    <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto">
                                        <FileText className="w-10 h-10 text-blue-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground">Preview Not Available</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Word documents cannot be previewed directly.
                                        </p>
                                    </div>
                                    <Button onClick={() => window.open(signedUrl, '_blank')} variant="outline" className="gap-2">
                                        <Download className="w-4 h-4" /> Download to View
                                    </Button>
                                </div>
                            </div>
                        ) : isImage ? (
                            <div className="flex justify-center min-h-full p-8" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                                <img
                                    src={signedUrl}
                                    alt={documentTitle}
                                    className="max-w-full shadow-lg rounded-lg object-contain"
                                    style={{ maxHeight: 'none' }}
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
                                <iframe
                                    src={`${signedUrl}#toolbar=0`}
                                    className="w-full bg-white rounded-lg shadow-lg border"
                                    style={{ height: '100vh', minHeight: '600px', maxWidth: '800px' }}
                                    title={documentTitle}
                                />
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            <div className="text-center space-y-2">
                                <FileText className="w-16 h-16 mx-auto text-gray-300" />
                                <p>No document available to preview</p>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
