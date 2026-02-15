"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, FileText, Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export interface Message {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    created_at: string
    is_read?: boolean
    file_url?: string
    file_name?: string
    file_type?: string
    file_size?: number
}

interface ChatWindowProps {
    messages: Message[]
    currentUserId: string
    otherUserName: string
    onSendMessage: (content: string, file?: File) => Promise<void>
    loading?: boolean
}

export function ChatWindow({ messages, currentUserId, otherUserName, onSendMessage, loading }: ChatWindowProps) {
    const [inputValue, setInputValue] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [issending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = async () => {
        if ((!inputValue.trim() && !selectedFile) || issending) return

        setIsSending(true)
        try {
            await onSendMessage(inputValue, selectedFile || undefined)
            setInputValue('')
            setSelectedFile(null)
        } catch (error) {
            console.error(error)
            toast.error("Failed to send message")
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 rounded-3xl overflow-hidden border border-slate-100 shadow-inner">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                            <Send className="w-8 h-8 text-slate-300 ml-1" />
                        </div>
                        <p className="font-medium">No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender_id === currentUserId
                        // const isComparison = idx > 0 && messages[idx - 1].sender_id === msg.sender_id

                        return (
                            <div key={msg.id} className={cn("flex w-full animate-in slide-in-from-bottom-2 duration-300", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "flex flex-col max-w-[75%] sm:max-w-[65%]",
                                    isMe ? "items-end" : "items-start"
                                )}>
                                    <div className={cn(
                                        "px-5 py-3.5 shadow-sm relative text-sm leading-relaxed transition-all hover:shadow-md",
                                        isMe
                                            ? "bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-none shadow-emerald-500/20"
                                            : "bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-none"
                                    )}>
                                        {msg.file_url && (
                                            <div className={cn(
                                                "mb-3 p-3 rounded-xl flex items-center gap-3 w-full max-w-full overflow-hidden backdrop-blur-sm border border-white/10",
                                                isMe ? "bg-white/10" : "bg-slate-50 border-slate-200"
                                            )}>
                                                <div className={cn(
                                                    "p-2.5 rounded-lg flex-shrink-0",
                                                    isMe ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-600"
                                                )}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 overflow-hidden">
                                                    <a
                                                        href={msg.file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn("text-xs font-bold truncate block hover:underline", isMe ? "text-emerald-50" : "text-slate-900")}
                                                    >
                                                        {msg.file_name || 'Attached Document'}
                                                    </a>
                                                    <p className={cn("text-[10px] truncate opacity-80", isMe ? "text-emerald-100" : "text-slate-500")}>
                                                        {msg.file_size ? `${(msg.file_size / 1024).toFixed(0)} KB` : 'PDF File'}
                                                    </p>
                                                </div>
                                                <a href={msg.file_url} download target="_blank" className={cn("p-1.5 rounded-full hover:bg-black/10 transition-colors", isMe ? "text-white" : "text-slate-400 hover:text-emerald-600")}>
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        )}

                                        {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}

                                        <p className={cn(
                                            "text-[9px] mt-1.5 text-right font-medium tracking-wide",
                                            isMe ? "text-emerald-100/70" : "text-slate-300"
                                        )}>
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
                {selectedFile && (
                    <div className="flex items-center gap-3 mb-3 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100 mx-1 animate-in slide-in-from-bottom-2">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            <FileText className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-xs font-medium text-slate-700 truncate max-w-[200px]">{selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)} className="ml-auto text-slate-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
                <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-[24px] border border-slate-200 focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-50/50 transition-all shadow-sm">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-all duration-300"
                        title="Attach File"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

                    <div className="flex-1 py-1">
                        <Input
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message..."
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-2 h-auto py-2 text-sm placeholder:text-slate-400 min-h-[44px]"
                        />
                    </div>

                    <Button
                        onClick={handleSend}
                        disabled={issending || (!inputValue.trim() && !selectedFile)}
                        className={cn(
                            "rounded-full h-11 w-11 shrink-0 transition-all duration-300",
                            (inputValue.trim() || selectedFile)
                                ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105"
                                : "bg-slate-200 text-slate-400"
                        )}
                    >
                        {issending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send className="w-5 h-5 ml-0.5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
