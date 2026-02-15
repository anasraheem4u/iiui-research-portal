"use client"

import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"

export type DocHistory = {
    id: string
    title: string
    status: "approved" | "rejected" | "pending" | "missing"
    version: number
    submission_date: string
    remarks?: string
}

const columns: ColumnDef<DocHistory>[] = [
    {
        accessorKey: "title",
        header: "Document Title",
        cell: ({ row }) => <span className="font-semibold">{row.original.title}</span>
    },
    {
        accessorKey: "version",
        header: "Version",
        cell: ({ row }) => <Badge variant="outline">v{row.original.version}</Badge>
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const s = row.original.status
            if (s === 'approved') return <Badge variant="success">Approved</Badge>
            if (s === 'rejected') return <Badge variant="danger">Rejected</Badge>
            return <Badge variant="warning">{s}</Badge>
        }
    },
    {
        accessorKey: "submission_date",
        header: "Date",
        cell: ({ row }) => <span className="text-muted-foreground">{new Date(row.original.submission_date).toLocaleString()}</span>
    },
    {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => <span className="text-xs italic text-muted-foreground">{row.original.remarks || "-"}</span>
    }
]

interface HistoryTableProps {
    data: DocHistory[]
}

export function HistoryTable({ data }: HistoryTableProps) {
    return <DataTable columns={columns} data={data} />
}
