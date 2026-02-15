"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatWindow, Message } from './ChatWindow'
import { Search, User, Settings, Phone, Video, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export function StudentChatInterface({ currentUserId, initialCoordinator }: {
    currentUserId: string,
    initialCoordinator?: { id: string, full_name: string, email?: string } | null
}) {
    const [coordinator, setCoordinator] = useState(initialCoordinator || null)
    const [messages, setMessages] = useState<Message[]>([])
    const [loading, setLoading] = useState(true)

    const supabase = createClient()


    // 2. Fetch Messages & Subscribe
    useEffect(() => {
        if (!coordinator) return

        const fetchMessages = async () => {
            setLoading(true)
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${coordinator.id}),and(sender_id.eq.${coordinator.id},receiver_id.eq.${currentUserId})`)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
            setLoading(false)
        }
        fetchMessages()

        const channel = supabase.channel(`student_chat_${currentUserId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const msg = payload.new as Message
                if (
                    (msg.sender_id === currentUserId && msg.receiver_id === coordinator.id) ||
                    (msg.sender_id === coordinator.id && msg.receiver_id === currentUserId)
                ) {
                    setMessages(prev => [...prev, msg])
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [coordinator, currentUserId])

    const handleSendMessage = async (content: string, file?: File) => {
        if (!coordinator) return

        let fileUrl = null
        let fileName = null
        let fileSize = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const filePath = `chat_files/${currentUserId}/${Date.now()}_${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('documents')
                .upload(filePath, file)

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw new Error("File upload failed: " + uploadError.message);
            }

            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath)
            fileUrl = publicUrl
            fileName = file.name
            fileSize = file.size
        }

        const { error } = await supabase.from('messages').insert({
            sender_id: currentUserId,
            receiver_id: coordinator.id,
            content: content,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize
        })

        if (error) {
            toast.error("Failed to send message")
            console.error(error)
        }
    }

    return (
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-100px)]">
            {/* Inner Sidebar */}
            <div className="w-72 border-r border-slate-100 bg-slate-50/50 flex flex-col hidden md:flex">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Your Contact</h2>

                    {coordinator ? (
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer ring-2 ring-blue-500/10">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {coordinator.full_name[0]}
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-bold text-slate-800 text-sm truncate">{coordinator.full_name}</h3>
                                <p className="text-xs text-blue-600 truncate">Research Department</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 text-center text-slate-400 text-sm">
                            No Coordinator Assigned
                        </div>
                    )}
                </div>

                <div className="mt-auto p-4 border-t border-slate-100">
                    <button className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white text-slate-500 hover:text-slate-800 text-sm font-medium transition-all">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {coordinator ? (
                    <>
                        {/* Header */}
                        <div className="h-20 px-6 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h1 className="text-lg font-bold text-slate-900">Contact Research Coordinator</h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <p className="text-xs text-slate-500">Active Support Channel • MS/PhD Inquiries</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                    <Search className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <ChatWindow
                            messages={messages}
                            currentUserId={currentUserId}
                            otherUserName={coordinator.full_name}
                            onSendMessage={handleSendMessage}
                            loading={loading}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col gap-4 text-slate-400">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                            <User className="w-8 h-8 opacity-50" />
                        </div>
                        <p>You haven't been assigned a coordinator yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
