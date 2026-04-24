"use client"

import { GraduationCap, BookOpen, Quote } from "lucide-react"

export function EducationLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full bg-slate-50/30">
            <div className="relative flex items-center justify-center">
                {/* Outer Glow Ring */}
                <div className="absolute w-24 h-24 rounded-full bg-emerald-500/10 animate-ping"></div>
                <div className="absolute w-16 h-16 rounded-full bg-emerald-500/20 blur-xl animate-pulse"></div>

                {/* Animated Icons Container */}
                <div className="relative z-10 flex items-center justify-center">
                    <div className="relative animate-bounce">
                        <GraduationCap className="w-12 h-12 text-emerald-600 drop-shadow-lg" strokeWidth={1.5} />
                    </div>
                    {/* Floating secondary icons */}
                    <div className="absolute -left-8 -top-4 animate-[bounce_2s_infinite_200ms]">
                        <BookOpen className="w-6 h-6 text-emerald-400/60 rotate-[-15deg]" strokeWidth={2} />
                    </div>
                    <div className="absolute -right-8 -top-4 animate-[bounce_2s_infinite_400ms]">
                        <Quote className="w-6 h-6 text-teal-400/60 rotate-[15deg]" strokeWidth={2} />
                    </div>
                </div>
            </div>

            {/* Loading text */}
            <div className="mt-8 flex flex-col items-center gap-2">
                <span className="text-emerald-700 font-bold text-lg tracking-wide uppercase px-4 py-1 rounded-full bg-emerald-50 border border-emerald-100/50 shadow-sm animate-pulse">
                    Loading
                </span>
                <p className="text-slate-400 text-xs font-medium tracking-wider">PREPARING RESEARCH PORTAL</p>
            </div>

            {/* Progress bar line */}
            <div className="mt-6 w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-[loading_1.5s_infinite_ease-in-out] w-1/3 rounded-full"></div>
            </div>

            <style jsx global>{`
                @keyframes loading {
                    0% { margin-left: -35%; width: 35%; }
                    100% { margin-left: 100%; width: 35%; }
                }
            `}</style>
        </div>
    )
}
