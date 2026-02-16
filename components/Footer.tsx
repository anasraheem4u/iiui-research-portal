"use client"

import { Heart, Laptop } from "lucide-react"

export function Footer() {
    return (
        <footer className="w-full py-6 mt-auto border-t border-slate-100 bg-white/50 backdrop-blur-sm">
            <div className="container px-4 mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        Developed by <a href="https://obrixlabs.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors font-bold">ObrixLabs</a>
                    </span>
                    <span className="hidden md:inline text-slate-300">|</span>
                    <span className="flex items-center gap-1">
                        Copyright &copy; {new Date().getFullYear()} <span className="text-slate-700 font-bold">Malik Noman Javed</span>
                    </span>
                </div>
            </div>
        </footer>
    )
}
