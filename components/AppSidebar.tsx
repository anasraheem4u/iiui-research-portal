"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    FolderOpen,
    History,
    Bell,
    Users,
    BarChart,
    HelpCircle,
    LogOut,
    MessageSquare,
    ChevronLeft,
    Menu,
    X,
    Megaphone
} from 'lucide-react'

interface AppSidebarProps {
    role: 'student' | 'coordinator' | 'admin'
    user?: {
        name: string
        email?: string
        avatarUrl?: string
        program?: string
    }
}

export function AppSidebar({ role, user }: AppSidebarProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    const studentLinks = [
        { href: '/dashboard/student', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/student/announcements', label: 'Announcements', icon: Megaphone },
        { href: '/dashboard/student/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/student/research', label: 'My Research', icon: FolderOpen },
        { href: '/dashboard/student/history', label: 'Upload History', icon: History },
    ]

    const coordinatorLinks = [
        { href: '/dashboard/coordinator', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/coordinator/announcements', label: 'Announcements', icon: Megaphone },
        { href: '/dashboard/coordinator/messages', label: 'Messages', icon: MessageSquare },
        { href: '/dashboard/coordinator/reports', label: 'Reports', icon: BarChart },
    ]

    const links = role === 'student' ? studentLinks : coordinatorLinks

    return (
        <>
            {/* Mobile Header Trigger */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-40 shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-white p-1 rounded-md shadow-sm">
                        <Image src="/images/IIUI_Logo.png" alt="IIUI Logo" width={24} height={24} className="w-6 h-6 object-contain" />
                    </div>
                    <span className="font-bold text-white tracking-tight">RDMS</span>
                </div>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                    {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-50 h-screen transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none border-r border-slate-800",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Logo Area */}
                <div className="h-20 flex items-center px-6 border-b border-slate-800/60 bg-slate-900/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-lg shadow-lg shadow-emerald-500/20">
                            <Image src="/images/IIUI_Logo.png" alt="IIUI Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                        </div>
                        <div className="leading-tight">
                            <h1 className="font-bold text-white text-lg tracking-tight">RDMS</h1>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">IIUI Portal</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Main Menu</p>

                    {links.map((link) => {
                        const Icon = link.icon
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20"
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white transition-colors")} />
                                <span>{link.label}</span>
                                {isActive && (
                                    <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full opacity-50"></div>
                                )}
                            </Link>
                        )
                    })}

                    <div className="pt-8 pb-2">
                        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 font-mono">Preferences</p>
                    </div>



                    <Link href="/dashboard/help" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all group">
                        <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                        <span>Help & Support</span>
                    </Link>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer group">
                        <div className="w-10 h-10 rounded-full overflow-hidden relative border border-slate-700 group-hover:border-emerald-500 transition-colors">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-emerald-400 font-bold text-sm">
                                    {user?.name?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.program || role}</p>
                        </div>
                        <Link href="/login" className="text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-slate-700/50 rounded-lg">
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>
        </>
    )
}
