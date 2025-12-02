import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from "moment";

export const exportPuneAdminPdf = (tableData, vendorColumns, quoteYear) => {
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    doc.setFontSize(9);
    doc.setTextColor(40);
    doc.setFont(undefined, 'bold');

    doc.text('Comparitive Statement of quotations', margin, 15);
    doc.text(`Date : ${moment(`01-01-${quoteYear}`).format("DD-MMM-YYYY")}`, pageWidth - margin, 15, { align: 'right' });

    doc.text(`RFQ rates for Pune to GTI shipment (01.01.${quoteYear} - 31.12.${quoteYear})`, margin, 22);
    // doc.text('Page 01 of 01', pageWidth - margin, 22, { align: 'right' });
    
    doc.setFont(undefined, 'normal');
    doc.text('We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"', margin, 29);
    
    doc.setFont(undefined, 'bold');
    doc.text('Approved By: ____________', 135, 29);
    doc.text('Checked By: ____________', 180, 29);
    doc.text('Prepared By: ____________', 225, 29);

    const mainTableHead = [
        [
            { content: `January to December '${quoteYear} Quote for Pune to GTI`, colSpan: vendorColumns.length + 2, styles: { fontSize: 16 } }
        ],
        [
            { content: 'Vehicle Type', rowSpan: 2, styles: { valign: 'middle', fontSize: 12 } },
            { content: 'Currency', rowSpan: 2, styles: { valign: 'middle', fontSize: 12 } },
            { content: 'Vendor', colSpan: vendorColumns.length, styles: { fontSize: 14 } }
        ],
        vendorColumns
    ];
    
    const mainTableBody = tableData.map(row => {
        const vehicleTypeValue = row.Vehicle_Type.replace(' (', '\n(');
        const rates = vendorColumns.map(vendor => (parseFloat(row[vendor]) || 0).toLocaleString('en-IN'));
        return [vehicleTypeValue, row.Currency, ...rates];
    });

    // const totals = vendorColumns.reduce((acc, vendor) => {
    //     acc[vendor] = tableData.reduce((sum, row) => sum + (parseFloat(row[vendor]) || 0), 0);
    //     return acc;
    // }, {});

    // const totalRow = [
    //     { content: 'TOTAL', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold' } },
    //     ...vendorColumns.map(vendor => totals[vendor].toLocaleString('en-IN'))
    // ];
    // mainTableBody.push(totalRow);

    doc.autoTable({
        startY: 40,
        head: mainTableHead,
        body: mainTableBody,
        theme: 'grid',
        headStyles: { 
            fontStyle: 'bold', 
            halign: 'center', 
            valign: 'middle',
            fontSize: 12, 
            cellPadding: 2, 
            fillColor: '#FFFFFF', 
            textColor: '#000000'
        },
        styles: { 
            fontStyle: 'bold', 
            fontSize: 10, 
            halign: 'center', 
            valign: 'middle', 
            cellPadding: 3, 
            lineColor: '#444', 
            lineWidth: 0.1 
        },
        // columnStyles: {
        //     0: { halign: 'left' },
        // }
    });
 doc.text("GREENTECH INDUSTRIES Business @2023.04.03 by Muni Kranth.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, { align: "center" });
    doc.save(`GTI_to_Pune_Admin_Quote_${quoteYear}.pdf`);
};