
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare, FileText, ChevronRight, HelpCircle } from "lucide-react"

export default function HelpPage() {
    return (
        <div className="h-full w-full overflow-y-auto bg-slate-50/50 p-8 md:p-10 pb-24 space-y-8">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl ring-1 ring-white/10 p-10 md:p-12">
                <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl"></div>

                <div className="relative space-y-6 max-w-2xl">
                    <div className="flex items-center gap-3 text-emerald-400 font-medium">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="tracking-widest uppercase text-xs">Help Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">help you?</span>
                    </h1>
                    <p className="text-slate-400 text-lg font-light leading-relaxed">
                        Find answers to common questions, browse documentation, or get in touch with our support team.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative items-start">
                {/* Contact Option */}
                <div className="group relative overflow-hidden rounded-[2rem] bg-white p-8 shadow-lg ring-1 ring-slate-900/5 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 right-0 h-32 w-32 -mr-8 -mt-8 rounded-full bg-emerald-50 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>

                    <div className="relative space-y-6">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                            <Mail className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">Contact Support</h3>
                            <p className="text-slate-500 mt-2 leading-relaxed">
                                Facing technical issues or have account-related queries? Our team is ready to assist you directly efficiently.
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 group-hover:bg-emerald-50/30 group-hover:border-emerald-100 transition-colors">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Official Support Email</p>
                            <a href="mailto:anasraheem@obrixlabs.com" className="text-lg md:text-xl font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors break-all">
                                anasraheem@obrixlabs.com
                            </a>
                        </div>

                        <Button className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-900/20">
                            Send Email <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* FAQs / Documentation */}
                <div className="space-y-6">
                    <div className="rounded-[2rem] bg-white p-8 shadow-sm ring-1 ring-slate-900/5">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Guides & Tutorials</h3>
                        </div>
                        <ul className="space-y-3">
                            {['Getting Started with RDMS', 'Submitting Your Synopsis', 'Uploading Research Documents', 'Tracking Progress'].map((item, i) => (
                                <li key={i}>
                                    <button className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 text-left group transition-colors border border-transparent hover:border-slate-100">
                                        <span className="font-medium text-slate-600 group-hover:text-slate-900">{item}</span>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 p-8 shadow-lg text-white">
                        <div className="flex items-start gap-4">
                            <HelpCircle className="w-8 h-8 opacity-80" />
                            <div>
                                <h3 className="text-lg font-bold">Quick Tip</h3>
                                <p className="text-white/80 mt-2 text-sm leading-relaxed">
                                    Always ensure your PDF documents are under 10MB before uploading. You can compress them using online tools if needed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
