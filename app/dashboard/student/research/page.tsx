import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { EditResearchModal } from "@/components/EditResearchModal"
import { FileText, User, GraduationCap, PlusCircle } from "lucide-react"

export default async function MyResearchPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch profile
    const { data: profile } = await supabase
        .from('users')
        .select(`*, programs(name)`)
        .eq('id', user.id)
        .single()

    // Fetch User Research Details
    const { data: research } = await supabase
        .from('research_details')
        .select('*')
        .eq('student_id', user.id)
        .single()

    const hasResearch = research && research.title

    return (
        <div className="flex-1 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Research</h1>
                        <p className="text-slate-500 mt-2">Manage your thesis topic, abstract, and supervisor details.</p>
                    </div>
                </div>

                {!hasResearch ? (
                    <Card className="border-dashed border-2 bg-slate-50/50">
                        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-4">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                                <GraduationCap className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900">No Research Topic Added</h3>
                            <p className="text-slate-500 max-w-md">
                                You haven't added your research details yet. Please propose a topic to get started with your thesis journey.
                            </p>
                            <div className="pt-4">
                                <EditResearchModal studentId={user.id} research={null} />
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                        <CardHeader className="border-b bg-slate-50/50 pb-8">
                            <div className="flex flex-col md:flex-row justify-between gap-4 md:items-start">
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                                            {profile?.programs?.name || "Program"}
                                        </Badge>
                                        <Badge variant="outline" className="border-slate-300 text-slate-600">
                                            {research.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-2xl md:text-3xl font-serif text-slate-900 leading-tight">
                                        {research.title}
                                    </CardTitle>
                                </div>
                                <div className="flex-shrink-0">
                                    <EditResearchModal studentId={user.id} research={research} />
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
                            {/* Main Content */}
                            <div className="md:col-span-2 space-y-8">
                                <div>
                                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        <FileText className="w-4 h-4" /> Abstract
                                    </h3>
                                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-slate-700 leading-relaxed text-justify">
                                        {research.abstract || <span className="text-slate-400 italic">No abstract provided yet.</span>}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
                                        Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {research.keywords && research.keywords.length > 0 ? (
                                            research.keywords.map((k: string) => (
                                                <Badge key={k} variant="secondary" className="px-3 py-1 bg-white border shadow-sm text-slate-700">
                                                    {k}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400 italic">No keywords added.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar / Supervisors */}
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Supervision Team</h3>

                                    <div className="space-y-6">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Primary Supervisor</p>
                                                <p className="font-medium text-slate-900">{research.supervisor_name || "Not Assigned"}</p>
                                                <p className="text-xs text-slate-500">Department of Computer Science</p>
                                            </div>
                                        </div>

                                        {research.co_supervisor_name && (
                                            <div className="flex gap-3 pt-4 border-t border-slate-200">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-400 uppercase font-semibold mb-0.5">Co-Supervisor</p>
                                                    <p className="font-medium text-slate-900">{research.co_supervisor_name}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 text-yellow-800 text-sm">
                                    <h4 className="font-bold flex items-center gap-2 mb-2">
                                        <GraduationCap className="w-4 h-4" /> Next Milestone
                                    </h4>
                                    <p>Submit your proposal defense request by end of this month.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
