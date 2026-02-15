import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export type ReportStats = {
    totalStudents: number
    activeStudents: number
    completedStudents: number
    programDistribution: { [key: string]: number }
    statusDistribution: { [key: string]: number }
}

export function generateAdvancedReport(
    title: string,
    stats: ReportStats,
    headers: string[],
    data: (string | number)[][],
    filtersApplied: string[],
    filename: string = 'advanced_report.pdf'
) {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(22)
    doc.setTextColor(16, 185, 129) // Emerald-600
    doc.text(title, 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28)
    if (filtersApplied.length > 0) {
        doc.text(`Filters: ${filtersApplied.join(', ')}`, 14, 33)
    }

    // Statistics Section
    let y = 45
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text("Executive Summary", 14, y)
    y += 8

    doc.setFontSize(10)
    doc.setTextColor(50)

    // Grid layout for stats
    const col1 = 18
    const col2 = 100

    doc.text(`• Total Students: ${stats.totalStudents}`, col1, y)
    doc.text(`• Active (In Progress): ${stats.activeStudents}`, col2, y)
    y += 6
    doc.text(`• Completed: ${stats.completedStudents}`, col1, y)
    y += 10

    // Program Distribution
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text("Program breakdown", 14, y)
    y += 8
    doc.setFontSize(10)
    doc.setTextColor(50)

    let progY = y;
    Object.entries(stats.programDistribution).forEach(([prog, count]) => {
        doc.text(`• ${prog}: ${count}`, 18, progY)
        progY += 5
    })

    // Status Distribution (Parallel column if possible, otherwise below)
    let statusY = y;
    Object.entries(stats.statusDistribution).forEach(([status, count]) => {
        doc.text(`• ${status}: ${count}`, 100, statusY)
        statusY += 5
    })

    y = Math.max(progY, statusY) + 10

    // Table
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: y,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        styles: { fontSize: 8, cellPadding: 2 }
    })

    doc.save(filename)
}
