import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from "moment";

export const exportAdminPdf = (transformedData, vendors, year) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const currentDate = moment().format("DD-MM-YYYY");
  const pageWidth = doc.internal.pageSize.getWidth();
  const totalColumns = 3 + (vendors.length * 4);

  const columnStyles = {
    0: { cellWidth: 8 },
    1: { cellWidth: 55 },
    2: { cellWidth: 15 },
  };
  
  let tableWidth = columnStyles[0].cellWidth + columnStyles[1].cellWidth + columnStyles[2].cellWidth;
  const fixedMargin = 5;
  const availableWidth = pageWidth - (fixedMargin * 2) - tableWidth;
  tableWidth += availableWidth; 

  const margin = (pageWidth - tableWidth) / 2;

  doc.setFontSize(7);
  doc.setTextColor(40);
  doc.setFont(undefined, 'bold');

  doc.text('Comparitive Statement of quotations', margin, 10);
  doc.text(`RFQ Chennai to GTI Import CHA rates for ${year} ( January to December )`, margin, 14);
  doc.text("We are following 'IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit'", margin, 18);

  doc.text(`Date: ${currentDate}`, pageWidth - margin, 10, { align: 'right' });

  doc.text('Approved By: ____________________', margin + (tableWidth * 0.35), 18);
  doc.text('Checked By: ____________________', margin + (tableWidth * 0.55), 18);
  doc.text('Prepared By: ____________________', margin + (tableWidth * 0.75), 18);

  doc.setFont(undefined, 'normal');

  const head = [];

  head.push([
    { 
      content: `From Chennai to GTI CHA IMPORT QUOTATION 1st JAN ${year} to 31st DEC ${year}`, 
      colSpan: totalColumns, 
      styles: { 
        halign: 'center', 
        fontStyle: 'bold', 
        fontSize: 11, 
        fillColor: '#ffffff', 
        textColor: '#000000',
        lineWidth: 0.1,
        lineColor: [0,0,0]
      } 
    }
  ]);

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
        rowData.push({ content: 'AT ACTUAL', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', valign: 'middle' } });
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

  const totalRow = [
    { content: 'TOTAL', colSpan: 2, styles: { fontStyle: 'bold', halign: 'center' } },
    { content: 'INR', styles: { fontStyle: 'bold', halign: 'left' } },
  ];
  vendors.forEach(vendor => {
    totalRow.push({ content: totals[vendor].ft20.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
    totalRow.push({ content: totals[vendor].ft40.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
    totalRow.push({ content: totals[vendor].lcl.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
    totalRow.push({ content: totals[vendor].air.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } });
  });

  doc.autoTable({
    startY: 25,
    head: head,
    body: body,
    foot: [totalRow],
    theme: 'grid',
    styles: { fontSize: 6.5, cellPadding: 1, textColor: '#000000', lineColor: [0,0,0], lineWidth: 0.1 },
    headStyles: { 
        fillColor: '#e5e7eb', 
        textColor: '#000000', 
        fontStyle: 'bold', 
        halign: 'center',
        fontSize: 7,
    },
    footStyles: {
        fillColor: '#e5e7eb',
        textColor: '#000000',
        fontStyle: 'bold',
    },
    columnStyles: columnStyles,
    margin: { left: margin, right: margin }
  });

  doc.save(`Chennai_Admin_Quotation_${year}.pdf`);
};