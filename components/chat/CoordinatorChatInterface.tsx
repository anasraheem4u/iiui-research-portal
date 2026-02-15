"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatWindow, Message } from './ChatWindow'
import { Input } from '@/components/ui/input'
import { CheckCheck, Search, FileText, User, MoreVertical, Folder, Video, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface StudentSummary {
    id: string
    full_name: string
    avatar_url?: string
    last_message?: string
    last_message_time?: string
    unread_count?: number
}

export function CoordinatorChatInterface({ currentUserId }: { currentUserId: string }) {
    const [students, setStudents] = useState<StudentSummary[]>([])
    const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>([])
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [loadingList, setLoadingList] = useState(true)

    const supabase = createClient()

    // 1. Fetch Students and Conversations
    useEffect(() => {
        const fetchStudents = async () => {
            setLoadingList(true)

            // Fetch all students first
            const { data: allStudents, error } = await supabase
                .from('users')
                .select('id, full_name, role') // Add avatar_url if exists
                .eq('role', 'student')

            if (error) {
                console.error("Error fetching students", error)
                return
            }

            // Fetch last messages for conversation preview?
            // This is heavy. For MVP, we might skip last message preview or doing it smartly.
            // Let's try to fetch recent messages involving me.
            const { data: recentMessages } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                .order('created_at', { ascending: false })
                .limit(500) // Reasonable limit for recent chats

            // Map students with last message
            const studentsWithChat_Map = new Map<string, any>()

            // Process messages to find latest per student
            recentMessages?.forEach(msg => {
                const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id
                if (!studentsWithChat_Map.has(otherId)) {
                    studentsWithChat_Map.set(otherId, {
                        last_message: msg.content || (msg.file_url ? 'Attachment' : ''),
                        last_message_time: msg.created_at,
                        unread_count: 0 // TODO
                    })
                }
            })

            const summary: StudentSummary[] = allStudents.map(s => {
                const chatInfo = studentsWithChat_Map.get(s.id) || {}
                return {
                    id: s.id,
                    full_name: s.full_name,
                    ...chatInfo
                }
            })

            // Sort by last message time (descending), then name
            summary.sort((a, b) => {
                const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0
                const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0
                return timeB - timeA
            })

            setStudents(summary)
            setFilteredStudents(summary)
            setLoadingList(false)
        }

        fetchStudents()

        // Subscribe to NEW messages to update sidebar
        const channel = supabase.channel('coordinator_chat_sidebar')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const msg = payload.new as Message
                // If it involves me
                if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
                    const otherId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id

                    setStudents(prev => {
                        const newAcc = prev.map(s => {
                            if (s.id === otherId) {
                                return {
                                    ...s,
                                    last_message: msg.content || (msg.file_url ? 'Attachment' : ''),
                                    last_message_time: msg.created_at
                                }
                            }
                            return s
                        })
                        // Re-sort? Maybe later.
                        return newAcc
                    })
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUserId])

    // 2. Filter Search
    useEffect(() => {
        if (!searchQuery) {
            setFilteredStudents(students)
        } else {
            setFilteredStudents(students.filter(s =>
                s.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            ))
        }
    }, [searchQuery, students])

    // 3. Fetch Selected Chat
    useEffect(() => {
        if (!selectedStudentId) return

        const fetchChat = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedStudentId}),and(sender_id.eq.${selectedStudentId},receiver_id.eq.${currentUserId})`)
                .order('created_at', { ascending: true })

            if (data) setMessages(data)
            setLoading(false)
        }

        fetchChat()

        const channel = supabase.channel(`chat_${selectedStudentId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                const msg = payload.new as Message
                if (
                    (msg.sender_id === currentUserId && msg.receiver_id === selectedStudentId) ||
                    (msg.sender_id === selectedStudentId && msg.receiver_id === currentUserId)
                ) {
                    setMessages(prev => [...prev, msg])
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedStudentId, currentUserId])

    const handleSendMessage = async (content: string, file?: File) => {
        if (!selectedStudentId) return;

        let fileUrl = null
        let fileName = null
        let fileSize = null

        if (file) {
            const fileExt = file.name.split('.').pop()
            const filePath = `chat_files/${selectedStudentId}/${Date.now()}_${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('documents') // Reusing existing bucket
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
            receiver_id: selectedStudentId,
            content: content,
            file_url: fileUrl,
            file_name: fileName,
            file_size: fileSize
        })

        if (error) throw error
    }

    const selectedStudent = students.find(s => s.id === selectedStudentId)

    return (
        <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-100px)]">
            {/* Left Sidebar */}
            <div className="w-80 border-r border-slate-100 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search students..."
                            className="bg-slate-50 border-none pl-9 h-10 rounded-xl"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {loadingList ? (
                        <div className="p-4 text-center text-sm text-slate-400">Loading...</div>
                    ) : filteredStudents.map(student => (
                        <div
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            className={cn(
                                "flex items-center gap-3 p-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0",
                                selectedStudentId === student.id ? "bg-blue-50/50 border-l-4 border-l-blue-600" : "border-l-4 border-l-transparent"
                            )}
                        >
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0">
                                {student.avatar_url ? (
                                    <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover rounded-full" />
                                ) : student.full_name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className="font-semibold text-sm text-slate-900 truncate">{student.full_name}</h4>
                                    {student.last_message_time && (
                                        <span className="text-[10px] text-slate-400 shrink-0">
                                            {new Date(student.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className={cn(
                                    "text-xs truncate",
                                    selectedStudentId === student.id ? "text-blue-600 font-medium" : "text-slate-500"
                                )}>
                                    {student.last_message || "No messages yet"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30">
                {selectedStudent ? (
                    <>
                        <div className="h-16 px-6 border-b border-slate-100 bg-white flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center relative">
                                    {selectedStudent.full_name[0]}
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{selectedStudent.full_name}</h3>
                                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                        Active Now
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl">
                                    <Folder className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl">
                                    <Video className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600 bg-slate-50 rounded-xl">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <ChatWindow
                            messages={messages}
                            currentUserId={currentUserId}
                            otherUserName={selectedStudent.full_name}
                            onSendMessage={handleSendMessage}
                            loading={loading}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center flex-col text-slate-400 gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                            <User className="w-8 h-8 text-slate-300" />
                        </div>
                        <p>Select a student to start messaging</p>
                    </div>
                )}
            </div>

            {/* Right Profile Sidebar */}
            {selectedStudent && (
                <div className="w-72 border-l border-slate-100 bg-white hidden xl:flex flex-col p-6">
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-24 h-24 rounded-2xl bg-slate-100 mb-4 overflow-hidden border-4 border-white shadow-lg shadow-slate-200/50">
                            {/* Avatar */}
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-slate-400">
                                {selectedStudent.full_name[0]}
                            </div>
                        </div>
                        <h3 className="font-bold text-lg text-slate-900">{selectedStudent.full_name}</h3>
                        <p className="text-sm text-slate-500">PhD Scholar (CS)</p>

                        <div className="flex gap-2 mt-3">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md">Year 3</span>
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-md">Thesis</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Documents</h4>
                                <button className="text-[10px] text-blue-600 font-semibold hover:underline">View All</button>
                            </div>
                            <div className="space-y-3">
                                {/* Mock Documents */}
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-700">Thesis_Draft_v1.pdf</p>
                                        <p className="text-[10px] text-slate-400">Oct 12, 2023</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group hover:border-blue-200 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-blue-700">Proposal_Slides.pdf</p>
                                        <p className="text-[10px] text-slate-400">Sep 30, 2023</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-800 mb-2">Coordinator's Note</h4>
                            <p className="text-xs text-blue-600/80 italic leading-relaxed">
                                "Check methodology section for proper validation techniques before next meeting."
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
