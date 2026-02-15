"use client"

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    content: string
    sender_id: string
    receiver_id: string
    created_at: string
}

interface ChatDialogProps {
    currentUserId: string
    otherUserId: string
    otherUserName: string
    trigger?: React.ReactNode
}

export function ChatDialog({ currentUserId, otherUserId, otherUserName, trigger }: ChatDialogProps) {
    const supabase = createClient()
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let channel: any

        if (isOpen && currentUserId && otherUserId) {
            setLoading(true)
            fetchMessages().finally(() => setLoading(false))

            // Realtime Subscription
            channel = supabase
                .channel(`chat:${currentUserId}-${otherUserId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    // Filter: Only messages involving these two users
                    // Unfortunately, Supabase realtime filter string support is limited.
                    // We'll trust the RLS policies and client-side filtering if needed, 
                    // or rely on fetching.
                    // Actually, let's just refresh on ANY insert for now to be safe and simple.
                }, (payload: any) => {
                    const msg = payload.new as Message
                    if (
                        (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
                        (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
                    ) {
                        setMessages(prev => {
                            // Avoid duplicates
                            if (prev.some(m => m.id === msg.id)) return prev
                            return [...prev, msg]
                        })
                        scrollToBottom()
                    }
                })
                .subscribe()
        }

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [isOpen, currentUserId, otherUserId])

    const scrollToBottom = () => {
        setTimeout(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight
            }
        }, 100)
    }

    async function fetchMessages() {
        if (!currentUserId || !otherUserId) return

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
            .order('created_at', { ascending: true })

        if (error) {
            console.error("Fetch messages error:", error)
        } else if (data) {
            setMessages(data)
            scrollToBottom()
        }
    }

    async function sendMessage() {
        if (!newMessage.trim()) return

        const content = newMessage.trim()
        setNewMessage("") // Optimistic clear

        // Optimistic UI update
        const tempId = Math.random().toString()
        const optimisticMsg: Message = {
            id: tempId,
            sender_id: currentUserId,
            receiver_id: otherUserId,
            content: content,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, optimisticMsg])
        scrollToBottom()

        const { error, data } = await supabase.from('messages').insert({
            sender_id: currentUserId,
            receiver_id: otherUserId,
            content: content
        }).select().single()

        if (error) {
            toast.error("Failed to send message")
            // Revert optimistic update? Or just fetch.
            fetchMessages()
        } else if (data) {
            // Replace optimistic with real
            setMessages(prev => prev.map(m => m.id === tempId ? data : m))
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Chat
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b bg-slate-50/50">
                    <DialogTitle className="flex items-center gap-2 text-base">
                        <div className="bg-emerald-100 p-1.5 rounded-full">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        Chat with {otherUserName}
                    </DialogTitle>
                </DialogHeader>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 scroll-smooth"
                >
                    {loading && messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                            <MessageCircle className="w-12 h-12 opacity-20" />
                            <p className="text-sm">No messages yet.</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.sender_id === currentUserId
                            return (
                                <div key={msg.id || i} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                    <div className={cn(
                                        "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm relative group",
                                        isMe
                                            ? "bg-emerald-600 text-white rounded-br-sm"
                                            : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
                                    )}>
                                        {msg.content}
                                        <div className={cn(
                                            "text-[9px] mt-1 text-right opacity-70",
                                            isMe ? "text-emerald-100" : "text-slate-400"
                                        )}>
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className="p-3 border-t bg-white flex gap-2 items-center">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 border-slate-200 focus-visible:ring-emerald-500 rounded-full px-4"
                    />
                    <Button
                        onClick={sendMessage}
                        size="icon"
                        className="bg-emerald-600 hover:bg-emerald-700 rounded-full w-10 h-10 shrink-0"
                        disabled={!newMessage.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
