"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, ChevronLeft, ChevronRight, X } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    meta?: any
    mobileCard?: (row: any) => React.ReactNode
}

export function DataTable<TData, TValue>({
    columns,
    data,
    meta,
    mobileCard,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [programFilter, setProgramFilter] = React.useState<string>("all")
    const [statusFilter, setStatusFilter] = React.useState<string>("all")
    const [sessionFilter, setSessionFilter] = React.useState<string>("all")
    const [yearFilter, setYearFilter] = React.useState<string>("all")

    const table = useReactTable({
        data,
        columns,
        meta,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: (row, columnId, filterValue) => {
            const search = filterValue.toLowerCase();
            const original = row.original as any;

            // Robust search across core fields
            const nameMatch = original?.name ? String(original.name).toLowerCase().includes(search) : false;
            const emailMatch = original?.email ? String(original.email).toLowerCase().includes(search) : false;
            const regNoMatch = original?.regNo ? String(original.regNo).toLowerCase().includes(search) : false;

            return nameMatch || emailMatch || regNoMatch;
        },
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    })

    const hasProgram = table.getAllColumns().some(c => c.id === 'program')
    const hasStatus = table.getAllColumns().some(c => c.id === 'status')
    const hasBatch = table.getAllColumns().some(c => c.id === 'batch')

    // Apply batch filter (Session and Year)
    React.useEffect(() => {
        if (!hasBatch) return
        table.getColumn("batch")?.setFilterValue({ session: sessionFilter, year: yearFilter })
    }, [sessionFilter, yearFilter, table, hasBatch])

    // Apply program filter
    React.useEffect(() => {
        if (!hasProgram) return
        if (programFilter === "all") {
            table.getColumn("program")?.setFilterValue(undefined)
        } else {
            table.getColumn("program")?.setFilterValue([programFilter])
        }
    }, [programFilter, table, hasProgram])

    // Apply status filter
    React.useEffect(() => {
        if (!hasStatus) return
        if (statusFilter === "all") {
            table.getColumn("status")?.setFilterValue(undefined)
        } else {
            table.getColumn("status")?.setFilterValue([statusFilter])
        }
    }, [statusFilter, table, hasStatus])

    return (
        <div className="space-y-4 font-sans">
            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-white p-1 rounded-2xl">
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-md group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <Input
                        placeholder="Search students..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder:text-slate-400 text-sm"
                    />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* Program Filter */}
                    {hasProgram && (
                        <div className="w-full sm:w-auto min-w-[160px]">
                            <Select value={programFilter} onValueChange={setProgramFilter}>
                                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-slate-700 focus:ring-emerald-500/20 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="All Programs" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Programs</SelectItem>
                                    {/* Dynamically generated program options */}
                                    {Array.from(new Set(data.map((item: any) => item.program)))
                                        .filter(Boolean)
                                        .sort()
                                        .map((program: string) => (
                                            <SelectItem key={program} value={program}>
                                                {program}
                                            </SelectItem>
                                        ))
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Status Filter */}
                    {hasStatus && (
                        <div className="w-full sm:w-auto min-w-[140px]">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-slate-700 focus:ring-emerald-500/20 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${statusFilter === 'all' ? 'bg-slate-300' : statusFilter === 'Complete' ? 'bg-emerald-500' : statusFilter === 'Pending' ? 'bg-amber-500' : 'bg-red-500'}`} />
                                        <SelectValue placeholder="All Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="Complete">Complete</SelectItem>
                                    <SelectItem value="Pending">Pending</SelectItem>
                                    <SelectItem value="Incomplete">Incomplete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Session Filter */}
                    {hasBatch && (
                        <div className="w-full sm:w-auto min-w-[140px]">
                            <Select value={sessionFilter} onValueChange={setSessionFilter}>
                                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-slate-700 focus:ring-emerald-500/20 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="All Sessions" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Sessions</SelectItem>
                                    <SelectItem value="Spring">Spring</SelectItem>
                                    <SelectItem value="Fall">Fall</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Year Filter */}
                    {hasBatch && (
                        <div className="w-full sm:w-auto min-w-[140px]">
                            <Select value={yearFilter} onValueChange={setYearFilter}>
                                <SelectTrigger className="h-10 rounded-xl bg-white border-slate-200 text-slate-700 focus:ring-emerald-500/20 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-3.5 h-3.5 text-slate-400" />
                                        <SelectValue placeholder="All Years" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Years</SelectItem>
                                    {Array.from(new Set(data.map((item: any) => {
                                        const parts = typeof item.batch === 'string' ? item.batch.split(' ') : [];
                                        return parts[1] || "";
                                    }))).filter(Boolean).sort().map((year: any) => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(programFilter !== "all" || statusFilter !== "all" || sessionFilter !== "all" || yearFilter !== "all" || globalFilter) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 px-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            onClick={() => {
                                setProgramFilter("all")
                                setStatusFilter("all")
                                setSessionFilter("all")
                                setYearFilter("all")
                                setGlobalFilter("")
                            }}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Results Info */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Showing {table.getFilteredRowModel().rows.length} results
                </p>
                <div className="flex gap-2">
                    {/* Add export logic here if needed passed via props? */}
                </div>
            </div>


            {/* Table (Desktop) */}
            <div className="hidden md:block rounded-2xl border border-slate-200/60 overflow-x-auto bg-white shadow-sm ring-4 ring-slate-50/50">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-slate-50/80 border-b border-slate-100 hover:bg-slate-50/80">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-12 text-xs font-bold text-slate-500 uppercase tracking-wider pl-6">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="pl-6 py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-48 text-center text-slate-500"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Search className="w-8 h-8 text-slate-300" />
                                        <p>No students found matching your filters.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile Card View */}
            {mobileCard && (
                <div className="md:hidden space-y-4">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <div key={row.id}>
                                {mobileCard(row)}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500 bg-white rounded-2xl border border-slate-200/60">
                            <Search className="w-8 h-8 text-slate-300" />
                            <p>No items found.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between py-2 px-1">
                <div className="text-sm text-slate-500 font-medium">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-9 w-9 p-0 rounded-xl border-slate-200 hover:bg-white hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-all disabled:opacity-50"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
