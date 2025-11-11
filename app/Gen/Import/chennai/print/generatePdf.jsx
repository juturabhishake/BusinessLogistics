import jsPDF from 'jspdf';
import 'jspdf-autotable';
import secureLocalStorage from "react-secure-storage";
import moment from "moment";

export const exportToPdf = (tableData, selectedYear) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const currentYear = selectedYear;
  const currentDate = moment().format("DD-MM-YYYY");
  const supplierName = secureLocalStorage.getItem("un") || "SHRI CHANDRA";
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;

  doc.setFontSize(9);
  doc.setTextColor(40);

  doc.text('Comparitive Statement of quotations', margin, 15);
  doc.text(`RFQ Chennai to GTI Import CHA rates for ${currentYear} ( January to December )`, margin, 20);
  doc.text("We are following 'IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit'", margin, 25);
  doc.text(`Date: ${currentDate}`, pageWidth - margin, 15, { align: 'right' });
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('From Chennai to GTI CHA IMPORT QUOTATION', pageWidth / 2, 38, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(supplierName.toUpperCase(), pageWidth / 2, 45, { align: 'center' });

  const head = [['S.NO', 'Particulars', 'Currency', '20 FT', '40 FT', 'LCL', 'AIR']];

  const body = tableData.map(row => {
    if (row.sno === 14) {
      return [row.sno, row.particulars, row.currency, { content: 'AT ACTUAL', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold' } }];
    }

    const ft20Value = row.ft20 ? (parseFloat(row.ft20) || 0).toFixed(2) : '';
    const ft40Value = row.ft40 ? (parseFloat(row.ft40) || 0).toFixed(2) : '';
    const lclValue = row.lcl ? (parseFloat(row.lcl) || 0).toFixed(2) : '';
    const airValue = row.air ? (parseFloat(row.air) || 0).toFixed(2) : '';

    return [row.sno, row.particulars, row.currency, ft20Value, ft40Value, lclValue, airValue];
  });

  const totals = tableData.reduce((acc, row) => {
    if(row.isEditable){
        acc.ft20 += parseFloat(row.ft20) || 0;
        acc.ft40 += parseFloat(row.ft40) || 0;
        acc.lcl += parseFloat(row.lcl) || 0;
        acc.air += parseFloat(row.air) || 0;
    }
    return acc;
  }, { ft20: 0, ft40: 0, lcl: 0, air: 0 });

  const totalRow = [
      { content: 'TOTAL', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: totals.ft20.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: totals.ft40.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: totals.lcl.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: totals.air.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } },
  ];
  body.push(totalRow);

  doc.autoTable({
    startY: 50,
    head: head,
    body: body,
    theme: 'grid',
    styles: {
        fontSize: 8,
        cellPadding: 1.5,
        textColor: '#1f2937',
        valign: 'middle',
    },
    headStyles: {
      fillColor: '#e5e7eb',
      textColor: '#111827',
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 65 },
      2: { halign: 'center', cellWidth: 18 },
      3: { halign: 'right' },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
    didDrawPage: (data) => {
      doc.setFontSize(10);
      const signatureY = pageHeight - 15;
      
      doc.text('Prepared By', margin, signatureY);
      doc.text('Checked By', pageWidth / 2, signatureY, { align: 'center' });
      doc.text('Approved By', pageWidth - margin, signatureY, { align: 'right' });
    }
  });

  doc.save(`Chennai_GTI_Import_Quotation_${currentYear}.pdf`);
};