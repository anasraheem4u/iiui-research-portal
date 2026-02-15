import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function exportTableToPDF(
    title: string,
    headers: string[],
    data: (string | number)[][],
    filename: string = 'report.pdf'
) {
    const doc = new jsPDF()

    // Title
    doc.setFontSize(18)
    doc.text(title, 14, 22)

    // Subtitle / Date
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30)
    doc.text('Research Management Dashboard (RDMS)', 14, 35)

    // Footer Template
    const pageCount = doc.getNumberOfPages();

    // Table
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: 40,
        theme: 'grid',
        styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [5, 150, 105], // emerald-600
            textColor: 255,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [240, 253, 244] // emerald-50
        },
        didDrawPage: (data: any) => {
            // Footer
            const str = 'Page ' + doc.getCurrentPageInfo().pageNumber;
            doc.setFontSize(8);

            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            doc.text(str, data.settings.margin.left, pageHeight - 10);
        }
    })

    doc.save(filename)
}
