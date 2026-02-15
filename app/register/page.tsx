"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GraduationCap, Mail, Lock, User, CheckCircle2, ArrowRight, Sparkles, BookOpen, FileCheck2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Program = { id: string, name: string, type: string }
type Batch = { id: string, name: string }

export default function RegisterPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [fetchingData, setFetchingData] = useState(true)
    const [step, setStep] = useState(1) // Multi-step form

    // Form State
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [fullName, setFullName] = useState("")
    const [regNo, setRegNo] = useState("")
    const [programId, setProgramId] = useState("")
    const [batchId, setBatchId] = useState("")
    const [department, setDepartment] = useState("")

    // Data State
    const [programs, setPrograms] = useState<Program[]>([])
    const [batches, setBatches] = useState<Batch[]>([])
    const [coordinators, setCoordinators] = useState<{ id: string, full_name: string }[]>([])
    const [coordinatorId, setCoordinatorId] = useState("")
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setFetchingData(true)
            setError(null)

            const { data: pData, error: pError } = await supabase.from('programs').select('id, name, type')
            const { data: bData, error: bError } = await supabase.from('batches').select('id, name')
            const { data: cData, error: cError } = await supabase.rpc('get_coordinators')

            if (pError || bError) {
                console.error("Error fetching registration data:", { pError, bError })
                setError("Failed to load form data. Please ensure database is setup.")
            } else {
                if (pData) setPrograms(pData)
                if (bData) setBatches(bData)
                if (cData) setCoordinators(cData)
            }
            if (cError) console.warn("Failed to fetch coordinators (RPC possibly missing)", cError)

            setFetchingData(false)
        }
        fetchData()
    }, [supabase])

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!programId) { toast.error("Please select a Program."); setLoading(false); return }
            if (!batchId) { toast.error("Please select a Batch."); setLoading(false); return }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        registration_number: regNo,
                        program_id: programId,
                        batch_id: batchId,
                        department: department,
                        coordinator_id: coordinatorId,
                        role: 'student'
                    }
                }
            })

            if (error) { toast.error(error.message); setLoading(false); return }

            if (data.user) {
                toast.success("Account created! Redirecting to login...")
                router.push("/login")
            } else {
                toast.success("Account created. Check email for confirmation.")
                router.push("/login")
            }
        } catch (err) {
            console.error(err)
            toast.error("Registration failed. Please try again.")
            setLoading(false)
        }
    }

    const canProceedStep1 = fullName && regNo && email && password.length >= 6
    const canProceedStep2 = programId && batchId && department && coordinatorId

    return (
        <div className="min-h-screen flex w-full overflow-hidden">
            {/* ===== LEFT PANEL (Visual) ===== */}
            <div className="hidden lg:flex w-5/12 relative bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-12 flex-col justify-between overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] animate-dot-scroll" />
                    <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-blob-float" />
                    <div className="absolute bottom-20 -left-10 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-blob-float" style={{ animationDelay: '5s' }} />
                    <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-cyan-400/5 rounded-full blur-2xl animate-blob-float" style={{ animationDelay: '9s' }} />
                    {/* Decorative Rings */}
                    <div className="absolute top-16 right-16 w-32 h-32 border border-white/[0.04] rounded-full animate-spin-slow" />
                    <div className="absolute top-20 right-20 w-24 h-24 border border-white/[0.06] rounded-full animate-spin-slow" style={{ animationDirection: 'reverse' }} />
                </div>

                <div className="relative z-10 animate-fade-in-left">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-lg shadow-emerald-500/10">
                            <GraduationCap className="h-7 w-7 text-emerald-300" />
                        </div>
                        <span className="font-bold text-xl tracking-wider">RDMS</span>
                    </div>
                    <h2 className="text-4xl font-bold leading-tight mb-4">
                        Join the <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-green-300 to-cyan-300 bg-clip-text text-transparent animate-gradient-shift">
                            Community
                        </span>
                    </h2>
                    <p className="text-emerald-100/50 text-sm font-light leading-relaxed max-w-xs">
                        Create your student profile at IIUI and start managing your research journey.
                    </p>
                </div>

                {/* Feature Cards */}
                <div className="relative z-10 space-y-3 my-8 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
                    <FeatureCard icon={<BookOpen className="w-4 h-4" />} text="Submit & track documents" idx={3} />
                    <FeatureCard icon={<FileCheck2 className="w-4 h-4" />} text="Real-time approval status" idx={4} />
                    <FeatureCard icon={<Users className="w-4 h-4" />} text="Connect with coordinators" idx={5} />
                </div>

                <div className="relative z-10 space-y-3 animate-fade-in-up stagger-6" style={{ opacity: 0 }}>
                    <p className="text-xs text-white/30">Already registered?</p>
                    <Link href="/login" className="text-emerald-300 hover:text-white font-semibold text-sm flex items-center gap-1.5 transition-all duration-300 group">
                        Sign in to your account
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            {/* ===== RIGHT PANEL (Form) ===== */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-slate-50 to-emerald-50/20 relative">
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:24px_24px]" />

                <div className="w-full max-w-lg relative z-10">
                    {/* Header */}
                    <div className="mb-8 animate-fade-in-up" style={{ opacity: 0 }}>
                        <div className="lg:hidden flex justify-center mb-4">
                            <div className="bg-emerald-700 p-3 rounded-2xl shadow-lg shadow-emerald-500/30">
                                <GraduationCap className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 text-center lg:text-left">Student Registration</h1>
                        <p className="text-slate-500 text-sm mt-1.5 text-center lg:text-left">Create your profile in two simple steps.</p>

                        {/* Error Banner */}
                        {error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 flex items-start gap-2 animate-fade-in-scale">
                                <span className="font-bold shrink-0">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-3 mb-8 animate-fade-in-up stagger-1" style={{ opacity: 0 }}>
                        <StepDot num={1} active={step === 1} completed={step > 1} onClick={() => setStep(1)} />
                        <div className={cn("flex-1 h-0.5 rounded-full transition-all duration-500", step > 1 ? "bg-blue-500" : "bg-slate-200")} />
                        <StepDot num={2} active={step === 2} completed={false} onClick={() => canProceedStep1 ? setStep(2) : null} />
                    </div>

                    <form onSubmit={handleRegister}>
                        {/* Step 1: Personal Info */}
                        {step === 1 && (
                            <div className="space-y-5 animate-fade-in-right" key="step1">
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                                    <User className="w-3.5 h-3.5" /> Step 1 — Personal Information
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <FormField label="Full Name" icon={<User className="h-[18px] w-[18px]" />}>
                                        <Input
                                            placeholder="John Doe"
                                            className="pl-11 py-6 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            required
                                        />
                                    </FormField>
                                    <FormField label="Registration No.">
                                        <Input
                                            placeholder="e.g. 211234"
                                            className="pl-4 py-6 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                                            value={regNo}
                                            onChange={e => setRegNo(e.target.value)}
                                            required
                                        />
                                    </FormField>
                                </div>

                                <FormField label="Email Address" icon={<Mail className="h-[18px] w-[18px]" />}>
                                    <Input
                                        type="email"
                                        placeholder="name@iiu.edu.pk"
                                        className="pl-11 py-6 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <FormField label="Password" icon={<Lock className="h-[18px] w-[18px]" />}>
                                    <Input
                                        type="password"
                                        placeholder="Min 6 characters"
                                        className="pl-11 py-6 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </FormField>

                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!canProceedStep1}
                                    className={cn(
                                        "w-full py-6 text-base font-semibold rounded-xl transition-all duration-500 group mt-2",
                                        "bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-600 animate-gradient-shift",
                                        "shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5",
                                    )}
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        Continue to Step 2
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Academic Info */}
                        {step === 2 && (
                            <div className="space-y-5 animate-fade-in-right" key="step2">
                                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
                                    <BookOpen className="w-3.5 h-3.5" /> Step 2 — Academic Details
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Program</label>
                                        <Select value={programId} onValueChange={setProgramId}>
                                            <SelectTrigger
                                                disabled={fetchingData || programs.length === 0}
                                                className="py-6 rounded-xl border-slate-200 bg-white hover:border-blue-300 transition-all"
                                            >
                                                <SelectValue placeholder={fetchingData ? "Loading..." : programs.length === 0 ? "No Programs" : "Select Program"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {programs.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.type})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Batch</label>
                                        <Select value={batchId} onValueChange={setBatchId}>
                                            <SelectTrigger
                                                disabled={fetchingData || batches.length === 0}
                                                className="py-6 rounded-xl border-slate-200 bg-white hover:border-blue-300 transition-all"
                                            >
                                                <SelectValue placeholder={fetchingData ? "Loading..." : batches.length === 0 ? "No Batches" : "Select Batch"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {batches.map(b => (
                                                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <FormField label="Department">
                                    <Input
                                        placeholder="e.g. Computer Science"
                                        className="pl-4 py-6 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm"
                                        value={department}
                                        onChange={e => setDepartment(e.target.value)}
                                        required
                                    />
                                </FormField>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Select Coordinator</label>
                                    <Select value={coordinatorId} onValueChange={setCoordinatorId}>
                                        <SelectTrigger
                                            disabled={fetchingData || coordinators.length === 0}
                                            className="py-6 rounded-xl border-slate-200 bg-white hover:border-emerald-400 transition-all"
                                        >
                                            <SelectValue placeholder={fetchingData ? "Loading..." : coordinators.length === 0 ? "No Coordinators Found" : "Select Your Coordinator"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {coordinators.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500">Your account will be approved by this coordinator.</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setStep(1)}
                                        className="flex-1 py-6 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || !canProceedStep2 || !!error}
                                        className={cn(
                                            "flex-[2] py-6 text-base font-semibold rounded-xl transition-all duration-500 group",
                                            "bg-gradient-to-r from-emerald-700 via-green-600 to-emerald-700 animate-gradient-shift",
                                            "shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5",
                                            loading && "opacity-80 cursor-wait"
                                        )}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                                Creating...
                                            </span>
                                        ) : (
                                            <span className="flex items-center justify-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                Create Account
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-8 animate-fade-in-up stagger-7" style={{ opacity: 0 }}>
                        Already registered?{" "}
                        <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 link-underline transition-colors">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

/* ===== SUB-COMPONENTS ===== */

function StepDot({ num, active, completed, onClick }: { num: number, active: boolean, completed: boolean, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 shrink-0",
                active && "bg-gradient-to-br from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/30 scale-110",
                completed && "bg-blue-500 text-white",
                !active && !completed && "bg-slate-200 text-slate-500 hover:bg-slate-300"
            )}
        >
            {completed ? <CheckCircle2 className="w-5 h-5" /> : num}
        </button>
    )
}

function FeatureCard({ icon, text, idx }: { icon: React.ReactNode, text: string, idx: number }) {
    return (
        <div className={cn("glass-card rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in-up opacity-0", `stagger-${idx}`)}>
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-300">{icon}</div>
            <span className="text-sm text-emerald-100/70 font-light">{text}</span>
        </div>
    )
}

function FormField({ label, icon, children }: { label: string, icon?: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">{label}</label>
            <div className="relative group premium-input rounded-xl transition-all duration-300 border border-slate-200 bg-white hover:border-emerald-400">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-400 group-focus-within:text-emerald-600 transition-colors">{icon}</span>
                    </div>
                )}
                {children}
            </div>
        </div>
    )
}
