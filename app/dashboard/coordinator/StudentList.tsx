"use client"

import { DataTable } from "@/components/ui/data-table"
import { columns, Student } from "./columns" // Import columns and Student type
import { StudentMobileCard } from "./StudentMobileCard" // Import Mobile Card component

interface StudentListProps {
    data: Student[]
    currentUserId?: string
}

export function StudentList({ data, currentUserId }: StudentListProps) {
    return (
        <DataTable
            columns={columns}
            data={data}
            meta={{ currentUserId }}
            mobileCard={(row) => <StudentMobileCard student={row.original} currentUserId={currentUserId} />}
        />
    )
}
