'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { exportTableToPDF } from '@/lib/export-utils'
import { useEffect, useState } from 'react'

interface ExportButtonProps {
    title: string
    headers: string[]
    data: (string | number)[][]
    filename?: string
    label?: string
    className?: string
}

export function ExportButton({ title, headers, data, filename = 'report.pdf', label = 'Export PDF', className }: ExportButtonProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null // Client-side only

    const handleExport = () => {
        // Ensure data is array of arrays
        const tableData = data.map(row =>
            Array.isArray(row) ? row : Object.values(row)
        )
        exportTableToPDF(title, headers, tableData as (string | number)[][], filename)
    }

    return (
        <Button
            onClick={handleExport}
            className={`bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm ${className}`}
            size="sm"
        >
            <Download className="w-4 h-4" />
            {label}
        </Button>
    )
}
