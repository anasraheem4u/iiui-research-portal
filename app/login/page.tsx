"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Lock, Mail, Eye, EyeOff, User, Sparkles, ArrowRight, BookOpen, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function LoginPage() {
    const [role, setRole] = useState<"student" | "coordinator">("student")
    const [isVisible, setIsVisible] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (authError) {
                console.error("Auth Error:", authError.message)
                if (authError.message.includes('Database error')) {
                    toast.error("Database configuration issue. Please run the updated master_seed.sql in Supabase SQL Editor.")
                } else if (authError.message.includes('Invalid login')) {
                    toast.error("Invalid email or password. Please check your credentials.")
                } else {
                    toast.error(authError.message)
                }
                setLoading(false)
                return
            }

            if (!user) {
                toast.error("Authentication failed. No user returned.")
                setLoading(false)
                return
            }

            // Try to get role from auth metadata first (always available)
            const metadataRole = user.user_metadata?.role as string | undefined

            // Then try the users table as a secondary source
            let dbRole: string | undefined
            try {
                const { data: profile } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', user.id)
                    .single()
                dbRole = profile?.role
            } catch {
                // Silently fall back — users table may not be accessible
            }

            // Priority: DB role > metadata role > selected role toggle
            const userRole = dbRole || metadataRole || role
            toast.success(`Welcome back!`)

            // Admins create/view everything, effectively Coordinators+
            if (userRole === 'coordinator' || userRole === 'admin') {
                router.push('/dashboard/coordinator')
            } else {
                router.push('/dashboard/student')
            }

        } catch (err) {
            console.error("Unexpected error:", err)
            toast.error("An unexpected error occurred")
            setLoading(false)
        }
    }

    const fillTestCreds = (type: 'student' | 'coordinator') => {
        setRole(type)
        setEmail(type === 'student' ? 'student@iiu.edu.pk' : 'coordinator@iiu.edu.pk')
        setPassword('password123')
    }

    return (
        <div className="min-h-screen flex w-full overflow-hidden">
            {/* ===== LEFT PANEL (Visual) ===== */}
            <div className="hidden lg:flex w-5/12 relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-12 flex-col justify-between overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0">
                    {/* Dot Grid */}
                    <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] animate-dot-scroll" />
                    {/* Floating Blobs */}
                    <div className="absolute -top-20 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-blob-float" />
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-blob-float" style={{ animationDelay: '4s' }} />
                    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cyan-400/5 rounded-full blur-2xl animate-blob-float" style={{ animationDelay: '8s' }} />
                    {/* Decorative Ring */}
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 border border-white/[0.04] rounded-full animate-spin-slow" />
                    <div className="absolute -bottom-24 -right-24 w-48 h-48 border border-white/[0.06] rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                </div>

                <div className="relative z-10 animate-fade-in-left">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg shadow-emerald-500/10">
                            <GraduationCap className="h-7 w-7 text-emerald-300" />
                        </div>
                        <span className="font-bold text-xl tracking-wider">RDMS</span>
                    </div>
                    <h1 className="text-5xl font-bold leading-[1.15] mb-6">
                        Academic <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 bg-clip-text text-transparent animate-gradient-shift">
                            Excellence
                        </span>
                    </h1>
                    <p className="text-lg text-emerald-100/60 max-w-sm font-light leading-relaxed">
                        Streamlining academic research & collaboration at IIUI.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="relative z-10 space-y-3 my-8 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
                    <FeatureCard icon={<BookOpen className="w-4 h-4" />} text="Track & manage research documents" delay={0} />
                    <FeatureCard icon={<Shield className="w-4 h-4" />} text="Secure role-based access control" delay={1} />
                    <FeatureCard icon={<Sparkles className="w-4 h-4" />} text="Real-time progress monitoring" delay={2} />
                </div>

                <div className="relative z-10 text-xs text-white/30 font-medium animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
                    © 2026 IIUI. All Rights Reserved.
                </div>
            </div>

            {/* ===== RIGHT PANEL (Form) ===== */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-emerald-50/30 relative">
                {/* Subtle Background */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]" />

                <div className="w-full max-w-md space-y-8 relative z-10">
                    {/* Header */}
                    <div className="text-center space-y-3 animate-fade-in-up" style={{ opacity: 0 }}>
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-4">
                            <div className="bg-emerald-700 p-3 rounded-2xl shadow-lg shadow-emerald-500/30">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
                        <p className="text-slate-500 text-sm">Enter your credentials to access your dashboard.</p>

                        {/* Demo Helpers */}
                        <div className="flex justify-center gap-2 pt-1">
                            <button
                                type="button"
                                onClick={() => fillTestCreds('student')}
                                className="group text-[11px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-700 hover:text-white hover:border-emerald-700 transition-all duration-300 font-medium"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Student Demo
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillTestCreds('coordinator')}
                                className="group text-[11px] bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full border border-teal-100 hover:bg-teal-700 hover:text-white hover:border-teal-700 transition-all duration-300 font-medium"
                            >
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3" /> Coord Demo
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Role Toggle */}
                    <div className="animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
                        <div className="bg-white p-1 rounded-2xl flex relative shadow-sm border border-slate-200/80">
                            {/* Sliding Indicator */}
                            <div
                                className={cn(
                                    "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-emerald-700 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-500 ease-out",
                                    role === 'student' ? 'left-1' : 'left-[calc(50%+3px)]'
                                )}
                            />
                            <button
                                onClick={() => setRole('student')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl z-10 transition-colors duration-300",
                                    role === 'student' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                <User className="w-4 h-4" /> Student
                            </button>
                            <button
                                onClick={() => setRole('coordinator')}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl z-10 transition-colors duration-300",
                                    role === 'coordinator' ? 'text-white' : 'text-slate-500 hover:text-slate-700'
                                )}
                            >
                                <Shield className="w-4 h-4" /> Coordinator
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative group premium-input rounded-xl transition-all duration-300 border border-slate-200 bg-white hover:border-emerald-400">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@iiu.edu.pk"
                                    className="pl-11 py-6 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="animate-fade-in-up stagger-4" style={{ opacity: 0 }}>
                            <label className="text-sm font-semibold text-slate-700 mb-2 block" htmlFor="password">
                                Password
                            </label>
                            <div className="relative group premium-input rounded-xl transition-all duration-300 border border-slate-200 bg-white hover:border-emerald-400">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-[18px] w-[18px] text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                                </div>
                                <Input
                                    id="password"
                                    type={isVisible ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-11 pr-12 py-6 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsVisible(!isVisible)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-600 focus:outline-none transition-colors"
                                >
                                    {isVisible ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                                </button>
                            </div>
                        </div>

                        <div className="animate-fade-in-up stagger-5" style={{ opacity: 0 }}>
                            <Button
                                type="submit"
                                className={cn(
                                    "w-full py-6 text-base font-semibold rounded-xl transition-all duration-500 group",
                                    "bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 animate-gradient-shift",
                                    "shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5",
                                    loading && "opacity-80 cursor-wait"
                                )}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Sign In
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="animate-fade-in-up stagger-6" style={{ opacity: 0 }}>
                        <p className="text-center text-sm text-slate-500 mt-8">
                            New Student?{" "}
                            <Link href="/register" className="font-bold text-emerald-700 hover:text-emerald-800 link-underline transition-colors">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureCard({ icon, text, delay }: { icon: React.ReactNode, text: string, delay: number }) {
    return (
        <div
            className={cn(
                "glass-card rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in-up opacity-0",
                `stagger-${delay + 3}`
            )}
        >
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-300">
                {icon}
            </div>
            <span className="text-sm text-emerald-100/70 font-light">{text}</span>
        </div>
    )
}
