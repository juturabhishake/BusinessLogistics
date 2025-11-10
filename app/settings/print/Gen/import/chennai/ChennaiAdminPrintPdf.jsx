import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from "moment";

export const exportAdminPdf = (transformedData, vendors, year) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3'
  });

  const currentDate = moment().format("DD-MM-YYYY");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Comparitive Statement of quotations', margin, 15);
  doc.text(`RFQ Chennai to GTI Import CHA rates for ${year}`, margin, 22);
  doc.text(`Date: ${currentDate}`, pageWidth - margin, 15, { align: 'right' });

  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(`From Chennai to GTI CHA IMPORT QUOTATION ${year}`, pageWidth / 2, 35, { align: 'center' });
  
  const head = [];
  const topRow = [
    { content: 'S.NO', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
    { content: 'Particulars', rowSpan: 2, styles: { valign: 'middle' } },
    { content: 'Currency', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
  ];
  vendors.forEach(vendor => {
    topRow.push({ content: vendor.toUpperCase(), colSpan: 4, styles: { halign: 'center' } });
  });
  head.push(topRow);

  const subRow = [];
  vendors.forEach(() => {
    subRow.push({ content: '20 FT' });
    subRow.push({ content: '40 FT' });
    subRow.push({ content: 'LCL' });
    subRow.push({ content: 'AIR' });
  });
  head.push(subRow);

  const body = [];
  transformedData.forEach(row => {
    const rowData = [row.sno, row.particulars, row.currency];
    vendors.forEach(vendor => {
      const vendorData = row[vendor] || {};
      if (row.sno === 14) {
        rowData.push({ content: 'AT ACTUAL', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold' } });
      } else {
        rowData.push({ content: vendorData.ft20 || '', styles: { halign: 'right' } });
        rowData.push({ content: vendorData.ft40 || '', styles: { halign: 'right' } });
        rowData.push({ content: vendorData.lcl || '', styles: { halign: 'right' } });
        rowData.push({ content: vendorData.air || '', styles: { halign: 'right' } });
      }
    });
    body.push(rowData);
  });
  
  const totals = {};
    vendors.forEach(vendor => {
        totals[vendor] = { ft20: 0, ft40: 0, lcl: 0, air: 0 };
    });

    transformedData.forEach(row => {
        if (row.sno !== 14) {
            vendors.forEach(vendor => {
                const vendorData = row[vendor] || {};
                totals[vendor].ft20 += parseFloat(vendorData.ft20) || 0;
                totals[vendor].ft40 += parseFloat(vendorData.ft40) || 0;
                totals[vendor].lcl += parseFloat(vendorData.lcl) || 0;
                totals[vendor].air += parseFloat(vendorData.air) || 0;
            });
        }
    });

    const totalRow = [{ content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } }];
    vendors.forEach(vendor => {
        totalRow.push({ content: totals[vendor].ft20.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
        totalRow.push({ content: totals[vendor].ft40.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
        totalRow.push({ content: totals[vendor].lcl.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
        totalRow.push({ content: totals[vendor].air.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
    });
    body.push(totalRow);


  doc.autoTable({
    startY: 45,
    head: head,
    body: body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5, textColor: '#1f2937' },
    headStyles: { 
        fillColor: '#e5e7eb', 
        textColor: '#111827', 
        fontStyle: 'bold', 
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [150, 150, 150]
    },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 60 },
      2: { cellWidth: 15 },
    },
     didDrawPage: (data) => {
      doc.setFontSize(10);
      const signatureY = pageHeight - 15;
      doc.text('Prepared By', margin, signatureY);
      doc.text('Checked By', pageWidth / 2, signatureY, { align: 'center' });
      doc.text('Approved By', pageWidth - margin, signatureY, { align: 'right' });
    }
  });

  doc.save(`Chennai_Admin_Quotation_${year}.pdf`);
};