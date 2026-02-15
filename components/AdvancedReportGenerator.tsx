'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { FileDown, Filter } from 'lucide-react'
import { useState, useMemo } from 'react'
import { generateAdvancedReport } from '@/lib/advanced-export'

interface StudentData {
    id: string
    full_name: string
    registration_number: string
    program: string
    status: 'COMPLETE' | 'IN PROGRESS' | 'NOT STARTED'
    metrics: {
        total: number
        approved: number
        pending: number
        rejected: number
    }
}

interface FilterProps {
    students: StudentData[]
}

export function AdvancedReportGenerator({ students }: FilterProps) {
    const [open, setOpen] = useState(false)
    const [selectedProgram, setSelectedProgram] = useState<string>('all')
    const [selectedStatus, setSelectedStatus] = useState<string>('all')

    // Extract unique programs
    const programs = useMemo(() =>
        ['all', ...Array.from(new Set(students.map(s => s.program)))],
        [students])

    // Filter Logic
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesProgram = selectedProgram === 'all' || student.program === selectedProgram
            const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus
            return matchesProgram && matchesStatus
        })
    }, [students, selectedProgram, selectedStatus])

    // Statistics Calculation
    const stats = useMemo(() => {
        const total = filteredStudents.length
        const active = filteredStudents.filter(s => s.status === 'IN PROGRESS').length
        const completed = filteredStudents.filter(s => s.status === 'COMPLETE').length

        const programDist: Record<string, number> = {}
        const statusDist: Record<string, number> = {}

        filteredStudents.forEach(s => {
            programDist[s.program] = (programDist[s.program] || 0) + 1
            statusDist[s.status] = (statusDist[s.status] || 0) + 1
        })

        return {
            totalStudents: total,
            activeStudents: active,
            completedStudents: completed,
            programDistribution: programDist,
            statusDistribution: statusDist
        }
    }, [filteredStudents])

    const handleExport = () => {
        const headers = ['Name', 'Reg. No', 'Program', 'Status', 'Submitted', 'Approved', 'Rejected']
        const data = filteredStudents.map(s => [
            s.full_name,
            s.registration_number,
            s.program,
            s.status,
            s.metrics.total,
            s.metrics.approved,
            s.metrics.rejected
        ])

        const filters = []
        if (selectedProgram !== 'all') filters.push(`Program: ${selectedProgram}`)
        if (selectedStatus !== 'all') filters.push(`Status: ${selectedStatus}`)

        generateAdvancedReport(
            'Comprehensive Student Report',
            {
                totalStudents: stats.totalStudents,
                activeStudents: stats.activeStudents,
                completedStudents: stats.completedStudents,
                programDistribution: stats.programDistribution,
                statusDistribution: stats.statusDistribution
            },
            headers,
            data,
            filters,
            `report_${new Date().toISOString().split('T')[0]}.pdf`
        )
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-12 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 border-none shadow-xl shadow-emerald-500/20 rounded-xl transition-all">
                    <FileDown className="w-5 h-5 mr-2" />
                    Export Report
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Generate Custom Report</DialogTitle>
                    <DialogDescription>
                        Filter data and generate a comprehensive PDF report with statistical analysis.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Program</label>
                            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Programs" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {programs.filter(p => p !== 'all').map(p => (
                                        <SelectItem key={p} value={p}>{p}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="COMPLETE">COMPLETE</SelectItem>
                                    <SelectItem value="IN PROGRESS">IN PROGRESS</SelectItem>
                                    <SelectItem value="NOT STARTED">NOT STARTED</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Live Preview Stats */}
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
                            <div className="text-xs text-slate-500">Students</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">{stats.completedStudents}</div>
                            <div className="text-xs text-emerald-600">Complete</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">{stats.activeStudents}</div>
                            <div className="text-xs text-amber-600">Active</div>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 text-center">
                        This will generate a PDF containing {stats.totalStudents} records based on current filters.
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <FileDown className="w-4 h-4 mr-2" />
                        Download PDF
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
