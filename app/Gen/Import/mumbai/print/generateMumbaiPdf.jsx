import jsPDF from 'jspdf';
import 'jspdf-autotable';
import secureLocalStorage from "react-secure-storage";
import moment from "moment";

export const exportMumbaiPdf = (tableData, quoteYear) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const vendorName = secureLocalStorage.getItem("un") || "VRC";
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    doc.setFontSize(9);
    doc.setTextColor(40);
    doc.setFont(undefined, 'bold');

    const currentDate = moment().format("DD-MM-YYYY");
    const signatureLine = "______________";

    doc.text('Comparitive Statement of quotations', margin, 15);
    doc.text(`Date: ${currentDate}`, pageWidth - margin, 15, { align: 'right' });
    
    doc.text(`RFQ rates for Mumbai to GTI shipment for ${quoteYear} ( January to December )`, margin, 22);
    
    doc.setFont(undefined, 'normal');
    doc.text('We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"', margin, 29);
    
    doc.setFont(undefined, 'bold');
    doc.text('Approved By:', 138, 29);
    doc.text(signatureLine, 160, 29);
    doc.text('Checked By:', 190, 29);
    doc.text(signatureLine, 210, 29);
    doc.text('Prepared By:', 240, 29);
    doc.text(signatureLine, 260, 29);

    const mainTableHead = [
        [
            { content: `January to December '${String(quoteYear).slice(2)} Quote for Mumbai to GTI`, colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fontSize: 16, cellPadding: 4 } }
        ],
        [
            { content: 'Vehicle Type', rowSpan: 2, styles: { fontSize: 14, valign: 'middle' } },
            { content: 'Currency', rowSpan: 2, styles: { fontSize: 14, valign: 'middle' } },
            { content: 'Vendor', styles: { fontSize: 14, cellPadding: 2 } }
        ],
        [
            { content: vendorName.toUpperCase(), styles: { fontSize: 14, cellPadding: 2 } }
        ]
    ];
    
    const mainTableBody = tableData.map(row => {
        const rateValue = row.rate ? (parseFloat(row.rate) || 0).toLocaleString('en-IN') : '0';
        const vehicleTypeValue = row.vehicleType.replace(' (', '\n(');
        return [vehicleTypeValue, row.currency, rateValue];
    });

    const totalRate = tableData.reduce((acc, row) => {
        return acc + (parseFloat(row.rate) || 0);
    }, 0);

    const totalRow = [
        { content: 'TOTAL', colSpan: 2, styles: { halign: 'right', valign: 'middle' } },
        { content: totalRate.toLocaleString('en-IN'), styles: { halign: 'center', valign: 'middle' } }
    ];

    mainTableBody.push(totalRow);

    doc.autoTable({
        startY: 40,
        head: mainTableHead,
        body: mainTableBody,
        theme: 'grid',
        styles: {
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'center',
            valign: 'middle',
            cellPadding: 4,
            lineColor: '#000000',
            lineWidth: 0.1,
            textColor: '#000000'
        },
        headStyles: {
            fillColor: '#ffffff',
            textColor: '#000000',
            fontStyle: 'bold',
        }
    });

    doc.save(`Mumbai_to_GTI_Quote_${quoteYear}.pdf`);
};