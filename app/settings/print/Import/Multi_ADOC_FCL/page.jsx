"use client";
import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { Check, ChevronsUpDown, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FaFilePdf as FaFilePdfIcon } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const initialDestinationCharges = [
    { attribute: "D_DTH", description: "Pickup & Clerance Charges", remarks: "Per Container" },
    { attribute: "D_BLF", description: "Custom Clearance", remarks: "Per BL" },
    { attribute: "D_DBR", description: "Handling / DO/", remarks: "Per Container" },
    { attribute: "D_DOF", description: "Terminal Handling Charge", remarks: "Per Container" },
    { attribute: "D_HC", description: "Documentation", remarks: "Per Container" },
    { attribute: "D_TDO", description: "T1 Doc", remarks: "Per Container" },
    { attribute: "D_LOC", description: "LOLO Charges", remarks: "Per Container" },
];
const initialSeaFreightCharges = [
    { attribute: "S_SeaFre", description: "Sea Freight", remarks: "Per Container" },
    { attribute: "S_ENS", description: "ENS", remarks: "Per BL" },
    { attribute: "S_ISPS", description: "ISPS", remarks: "Per Container" },
    { attribute: "S_ITT", description: "Seal Fee", remarks: "Per Container" },
];
const initialOriginCharges = [
    { attribute: "O_CCD", description: "Customs clearence", remarks: "Per Container" },
    { attribute: "O_LTG", description: "CC Fee", remarks: "Per Container" },
    { attribute: "O_THC", description: "D.O Charges", remarks: "Per Container" },
    { attribute: "O_BLC", description: "LINER CHARGES (At Actuals)", remarks: "Per BL" },
    { attribute: "O_LUS", description: "Loading / Unloading", remarks: "Per Container" },
    { attribute: "O_Halt", description: "Delivery", remarks: "" },
];

const QuotationTable = () => {
  const [sections, setSections] = useState({ origin: true, seaFreight: true, destination: true });
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [containerSizeOpen, setContainerSizeOpen] = useState(false);
  const [selectedContainerGroup, setSelectedContainerGroup] = useState("");
  const [containerSizeOptions, setContainerSizeOptions] = useState([]);
  const [USD, setUSD] = useState(0.00);
  const [EUR, setEUR] = useState(0.00);
  const [incoterms, setIncoterms] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [currency, setCurrency] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [uploadedPdfPath, setUploadedPdfPath] = useState('');
  const [remarks, setRemarks] = useState("");
  const [Dest_Port, setDest_Port] = useState("");
  const [Pref_Liners, setPref_Liners] = useState("");
  const [actual_Location, setActual_Location] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [supplierNames, setSupplierNames] = useState({ s1: 'Supplier 1', s2: 'Supplier 2', s3: 'Supplier 3' });
  const [s1DetailColumns, setS1DetailColumns] = useState([]);
  const [destinationCharges, setDestinationCharges] = useState(initialDestinationCharges);
  const [seaFreightCharges, setSeaFreightCharges] = useState(initialSeaFreightCharges);
  const [originCharges, setOriginCharges] = useState(initialOriginCharges);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    if (secureLocalStorage.getItem("sc") !== 'admin') window.location.href = "/";
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const body = { Shipment_Type: 'ADOCFCL', Transport_Type: 'import', Month_No: selectedDate.month() + 1, Year_No: selectedDate.year() };
        const response = await fetch('/api/get_locations_Adhoc_Air_Print_multi', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await response.json();
        setLocations(data.result || []);
      } catch (error) { console.error("Error fetching locations:", error); }
    };
    fetchLocations();
  }, [selectedDate]);

  useEffect(() => {
    const fetchContainerSizes = async () => {
      if (!selectedLocation) return;
      try {
        const body = { shipType: "ADOCFCL", transport_type: "import", locCode: selectedLocation, MonthNo: selectedDate.month() + 1, YearNo: selectedDate.year() };
        const response = await fetch('/api/ADOC/get_containers_multi', { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = await response.json();
        setContainerSizeOptions(data.result || []);
      } catch (error) { console.error("Error fetching container sizes:", error); }
    };
    fetchContainerSizes();
  }, [selectedLocation, selectedDate]);
  
  const handleContainerGroupSelect = (group) => {
    setSelectedContainerGroup(group);
    if (group) {
        const columns = group.split(',').map(s => `S1_${s.trim()}`).sort();
        setS1DetailColumns(columns);
    } else {
        setS1DetailColumns([]);
    }
    setContainerSizeOpen(false);
  };

  const resetData = (resetAll = true) => {
    setDestinationCharges(initialDestinationCharges.map(c => ({...c})));
    setSeaFreightCharges(initialSeaFreightCharges.map(c => ({...c})));
    setOriginCharges(initialOriginCharges.map(c => ({...c})));
    setSupplierNames({ s1: 'Supplier 1', s2: 'Supplier 2', s3: 'Supplier 3' });
    setTotals({});
    if(resetAll) {
        setIncoterms(""); setDeliveryAddress(""); setUSD(0); setEUR(0);
        setDest_Port(""); setPref_Liners(""); setRemarks(""); setUploadedPdfPath(""); setActual_Location(""); setCurrency("");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
        if (!selectedLocation || !selectedContainerGroup) {
            resetData(true);
            if(!selectedContainerGroup) setS1DetailColumns([]);
            return;
        }
        setIsLoading(true);
        resetData(true);

        try {
            const [quoteResponse, termsResponse] = await Promise.all([
                fetch("/api/prints/ADOCImportFCL_multi", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        quote_month: selectedDate.month() + 1,
                        quote_year: selectedDate.year(),
                        loc_code: selectedLocation,
                        container_sizes: selectedContainerGroup.split(',').map(s => s.trim()),
                    }),
                }),
                fetch('/api/ADOC/ADOCFCL_Terms_Print', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        Shipment_Type: 'ADOCFCL', 
                        Transport_Type: 'import', 
                        Loc_Code: selectedLocation,
                        Container_Size: selectedContainerGroup,
                        MonthNo: selectedDate.month() + 1, 
                        YearNo: selectedDate.year(),
                    }),
                })
            ]);
            
            const termsData = await termsResponse.json();
            if (termsResponse.ok && termsData.result && termsData.result.length > 0) {
                const details = termsData.result[0];
                setIncoterms(details.Incoterms || ""); 
                setDeliveryAddress(details.Delivery_Address || "");
                setCurrency(details.Currency || "INR"); 
                setRemarks(details.Remarks || "");
                setUSD(parseFloat(details.USD) || 0); 
                setEUR(parseFloat(details.EURO) || 0);
                setUploadedPdfPath(details.UploadedPDF || ""); 
                setDest_Port(details.Dest_Port || "");
                setPref_Liners(details.Pref_Liners || ""); 
                setActual_Location(details.Actual_Location || "");
            } else {
                console.error("Failed to fetch terms data or no terms found:", termsResponse.status);
            }
            
            if (!quoteResponse.ok) {
                 throw new Error(`Quote fetch failed with status ${quoteResponse.status}`);
            }
            const quoteData = await quoteResponse.json();
            if (quoteData && Array.isArray(quoteData) && quoteData.length > 0) {
                const dataMap = quoteData.reduce((acc, item) => ({ ...acc, [item.Attribute]: item }), {});
                const vendorRow = dataMap['Vendor_Name'];
                if (vendorRow) { setSupplierNames({ s1: vendorRow.S1_Total || 'Supplier 1', s2: vendorRow.S2_Total || 'Supplier 2', s3: vendorRow.S3_Total || 'Supplier 3' }); }

                const processCharges = (initialCharges) => initialCharges.map(charge => ({ ...charge, ...(dataMap[charge.attribute] || {}) }));
                setDestinationCharges(processCharges(initialDestinationCharges));
                setSeaFreightCharges(processCharges(initialSeaFreightCharges));
                setOriginCharges(processCharges(initialOriginCharges));
            } else {
                resetData(false);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            resetData(true);
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
  }, [selectedLocation, selectedContainerGroup, selectedDate]);

  useEffect(() => {
    const calculateSum = (charges, columns) => {
        const totals = {};
        columns.forEach(col => {
            totals[col] = charges.reduce((acc, charge) => acc + (parseFloat(charge[col]) || 0), 0);
        });
        return totals;
    };

    const allColumns = [...s1DetailColumns, 'S1_Total', 'S2_Total', 'S3_Total'];

    const destTotalsRaw = calculateSum(destinationCharges, allColumns);
    const seaTotalsRaw = calculateSum(seaFreightCharges, allColumns);
    const originTotalsRaw = calculateSum(originCharges, allColumns);

    const destTotalsForDisplay = {};
    const seaTotalsForDisplay = {};

    allColumns.forEach(col => {
        const destVal = parseFloat(destTotalsRaw[col]) || 0;
        if (currency && currency.toUpperCase() === 'USD') {
            destTotalsForDisplay[col] = destVal * (USD || 1);
        } else if (currency && (currency.toUpperCase() === 'EURO' || currency.toUpperCase() === 'EUR')) {
            destTotalsForDisplay[col] = destVal * (EUR || 1);
        } else {
            destTotalsForDisplay[col] = destVal; 
        }

        const seaVal = parseFloat(seaTotalsRaw[col]) || 0;
        seaTotalsForDisplay[col] = seaVal * (USD || 1);
    });

    const grandTotals = {};
    allColumns.forEach(col => {
        const totalInINR = 
            (parseFloat(destTotalsForDisplay[col]) || 0) +
            (parseFloat(seaTotalsForDisplay[col]) || 0) +
            (parseFloat(originTotalsRaw[col]) || 0);
        grandTotals[col] = totalInINR.toFixed(2);
    });
    
    const formatTotals = (totalsObj) => {
        const formatted = {};
        for (const key in totalsObj) {
            formatted[key] = (parseFloat(totalsObj[key]) || 0).toFixed(2);
        }
        return formatted;
    }

    setTotals({
        destination: formatTotals(destTotalsForDisplay), 
        seaFreight: formatTotals(seaTotalsForDisplay),   
        origin: formatTotals(originTotalsRaw),           
        grandTotal: grandTotals
    });
  }, [destinationCharges, seaFreightCharges, originCharges, s1DetailColumns, currency, USD, EUR]);

  const toggleSection = (section) => setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const tableHeaders = [[
        { content: "S.No", rowSpan: 2, styles: { valign: "middle" } },
        { content: "Sea Freight RFQ - FCL", rowSpan: 2, styles: { valign: "middle" } },
        { content: "Currency", rowSpan: 2, styles: { valign: "middle" } },
        { content: supplierNames.s1, colSpan: s1DetailColumns.length + 1, styles: { halign: "center" } },
        { content: `${supplierNames.s2} (Total)`, rowSpan: 2, styles: { valign: "middle", halign: "center" } },
        { content: `${supplierNames.s3} (Total)`, rowSpan: 2, styles: { valign: "middle", halign: "center" } },
        { content: "Remarks", rowSpan: 2, styles: { valign: "middle" } },
    ],[
        ...s1DetailColumns.map(col => ({ content: col.replace('S1_', ''), styles: { halign: "center" } })),
        { content: 'Total', styles: { halign: "center" } }
    ]];

    const tableBody = [];
    let counter = 1;
    const totalCols = s1DetailColumns.length + 7;

    const addSection = (title, sectionChar, charges, currencyName, totalRow) => {
        tableBody.push([{ content: `${sectionChar}. ${title}`, colSpan: totalCols, styles: { fontStyle: "bold", fillColor: [255, 255, 255] } }]);
        charges.forEach(charge => {
            tableBody.push([
                counter++, charge.description, `${currencyName}/Shipment`,
                ...s1DetailColumns.map(col => ({ content: (!charge[col] || charge[col] === '0' || charge[col] === 0 || charge[col] === '0.00') ? '' : charge[col], styles: { halign: 'right' } })),
                { content: (charge.S1_Total === '0.00' || !charge.S1_Total) ? '' : charge.S1_Total, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: (charge.S2_Total === '0.00' || !charge.S2_Total) ? '' : charge.S2_Total, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: (charge.S3_Total === '0.00' || !charge.S3_Total) ? '' : charge.S3_Total, styles: { halign: 'right', fontStyle: 'bold' } },
                charge.remarks
            ]);
        });
        if (totalRow && Object.keys(totalRow).length > 0) {
            tableBody.push([
                "", { content: `Total ${title}`, styles: { fontStyle: "bold" } }, "INR", 
                ...s1DetailColumns.map(col => ({ content: totalRow[col], styles: { halign: 'right', fontStyle: 'bold' } })),
                { content: totalRow.S1_Total, styles: { halign: 'right', fontStyle: 'bold' } },
                { content: totalRow.S2_Total, styles: { halign: 'right', fontStyle: 'bold' } }, 
                { content: totalRow.S3_Total, styles: { halign: 'right', fontStyle: 'bold' } }, ""
            ]);
        }
    };
    
    addSection("EX Works Charges", "A", destinationCharges, currency, totals.destination);
    addSection("Sea Freight Charges", "B", seaFreightCharges, "USD", totals.seaFreight);
    addSection("Destination Charges", "C", originCharges, "INR", totals.origin);

    if (totals.grandTotal && Object.keys(totals.grandTotal).length > 0) {
        tableBody.push([
            "", { content: "Total Shipment Cost (A+B+C)", styles: { fontStyle: "bold" } },
            { content: "INR", styles: { fontStyle: "bold" } },
            ...s1DetailColumns.map(col => ({ content: totals.grandTotal[col], styles: { halign: 'right', fontStyle: 'bold' } })),
            { content: totals.grandTotal.S1_Total, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: totals.grandTotal.S2_Total, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: totals.grandTotal.S3_Total, styles: { halign: 'right', fontStyle: 'bold' } },
            { content: "", styles: { fontStyle: 'bold' } },
        ]);
    }

    const addTermRow = (label, value) => {
        tableBody.push([{ content: label, colSpan: 2, styles: { fontStyle: "bold" } }, { content: value, colSpan: totalCols - 2 }]);
    };

    const addComplexTermRow = (label1, value1, label2, value2) => {
         tableBody.push([
            { content: label1, colSpan: 2, styles: { fontStyle: "bold" } },
            { content: value1, colSpan: 2 },
            { content: label2, styles: { fontStyle: "bold" } },
            { content: value2, colSpan: totalCols - 5 }
        ]);
    };

    addTermRow("INCO Term", incoterms);
    addTermRow("Pickup Address", deliveryAddress.replace(/<br\s*\/?>/gi, ", "));
    addTermRow("FX Rate", `USD: ${USD} | EURO: ${EUR}`);
    addTermRow("Origin Port", Dest_Port);
    // addComplexTermRow("Origin Port", Dest_Port, "Preferred Liners", Pref_Liners);
    // addTermRow("Upload PDF", uploadedPdfPath ? uploadedPdfPath.split('/').pop() : 'No PDF Uploaded');
    addTermRow("Remarks", remarks);

    doc.setFont("helvetica", "bold"); doc.setFontSize(12);
    doc.text("Comparative Statement of quotations", 5, 10);

    doc.setFont("helvetica", "normal"); doc.setFontSize(10);   
    doc.text(`Sea Import for GTI to ${locationName || "{select location}"}  shipment`, 5, 15);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);   
    doc.text(`We are following 'IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit'`, 5, 19);
    
   let dateTextWidth = doc.getStringUnitWidth(`Date: ${formattedDate}`) * doc.internal.scaleFactor;
    let xPosition = doc.internal.pageSize.width - 10;
    doc.text(`Date: ${formattedDate}`, xPosition - dateTextWidth, 10);
    const approvalText = "Approved by:                                          Checked by:                                          Prepared by:                                  ";
    let approvalTextWidth = doc.getStringUnitWidth(approvalText) * doc.internal.scaleFactor;
    doc.text(approvalText, xPosition - approvalTextWidth - 5, 20);
    doc.autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: 22,
        theme: "grid",
         margin: { left: 5, right: 5 },
        styles: { fontSize: 7, cellPadding: 1.2, lineWidth: 0.1, lineColor: [0, 0, 0] },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 6, lineWidth: 0.15,lineColor: [0, 0, 0] }, 
      //   didParseCell: function(data) {
      //       const fc = data.cell?.raw?.styles?.fillColor;
      //       if (Array.isArray(fc) && fc.length === 3 && fc[0] === 255 && fc[1] === 255 && fc[2] === 0) {
      //           data.cell.styles.textColor = [0, 0, 0];
      //       }
      //   }
    });
    doc.text("GREENTECH INDUSTRIES Business @2023.04.03 by Muni Kranth.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, { align: "center" });
    doc.save(`Quotation_${actual_Location || 'location'}_${dayjs().format('YYYYMMDD')}.pdf`);
  };

  const renderChargeRow = (item, index, currency, startNum) => (
    <tr key={item.attribute} className="border">
      <td className="py-1 px-3 border">{startNum + index}</td>
      <td className="py-1 px-3 border text-start">{item.description}</td>
      <td className="py-1 px-3 border">{currency}/Shipment</td>
      {s1DetailColumns.map(col => <td key={col} className="py-1 px-3 border text-center">{item[col] === '0.00' || item[col] === '0' ? '' : item[col]}</td>)}
      <td className="py-1 px-3 border font-bold text-center">{item.S1_Total === '0.00' || item.S1_Total === '0' ? '' : item.S1_Total}</td>
      <td className="py-1 px-3 border font-bold text-center">{item.S2_Total === '0.00' || item.S2_Total === '0' ? '' : item.S2_Total}</td>
      <td className="py-1 px-3 border font-bold text-center">{item.S3_Total === '0.00' || item.S3_Total === '0' ? '' : item.S3_Total}</td>
      <td className="py-1 px-3 border">{item.remarks}</td>
    </tr>
  );

  const renderTotalRow = (title, totalRow, currency) => (
    totalRow && Object.keys(totalRow).length > 0 && <tr className="border bg-gray-100 dark:bg-gray-700 font-bold">
      <td colSpan="2" className="py-1 px-3 border text-start">{title}</td>
      <td className="py-1 px-3 border">{currency}</td>
      {s1DetailColumns.map(col => <td key={col} className="py-1 px-3 border text-center">{totalRow[col]}</td>)}
      <td className="py-1 px-3 border text-center">{totalRow.S1_Total}</td>
      <td className="py-1 px-3 border text-center">{totalRow.S2_Total}</td>
      <td className="py-1 px-3 border text-center">{totalRow.S3_Total}</td>
      <td className="py-1 px-3 border"></td>
    </tr>
  );

  return (
    <div>
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3 space-y-2">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-2">
                 <div className="flex flex-col">
                    <h2 className="text-sm font-bold">Comparative Statement of quotations</h2>
                    <p className="text-xs text-gray-100">{`Import Print ADOC FCL rates for ${ selectedDate ? `${selectedDate.format("MMMM YY")} (${selectedDate.startOf("month").format("DD.MM.YY")} - ${selectedDate.endOf("month").format("DD.MM.YY")})` : "Loading..." }`}</p>
                    <p className="text-xs text-gray-100">Quote for GTI to {locationName || "{select location}"} | Europe shipment</p>
                 </div>
                 <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center lg:space-y-0 sm:space-x-2 space-y-2 w-full">
                     <div className="flex flex-col items-start justify-start lg:flex-row lg:items-center gap-2 w-full lg:w-auto">
                         <Button onClick={downloadPDF} variant="outline" className="bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)]" disabled={isLoading || !selectedContainerGroup}><FileText className="mr-0" /></Button>
                         <Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild>
                             <Button role="combobox" variant="outline" className="w-full lg:w-[200px] justify-between mt-1 mb-1 bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] px-3 py-1 rounded text-xs">{selectedLocation ? locations.find(loc => loc.Location_Code === selectedLocation)?.Location_Name : "Select Location..."}<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                         </PopoverTrigger><PopoverContent className="w-[200px] p-0"><Command><CommandInput placeholder="Search location..." className="h-9" /><CommandList><CommandEmpty>No location found.</CommandEmpty><CommandGroup>
                            {locations.map((loc) => (<CommandItem key={loc.Location_Code} value={loc.Location_Code} onSelect={(v) => { setSelectedLocation(loc.Location_Code); setLocationName(loc.Location_Name); setSelectedContainerGroup(""); setContainerSizeOptions([]); setS1DetailColumns([]); setOpen(false); }}>
                                {loc.Location_Name}<Check className={cn("ml-auto h-4 w-4", selectedLocation === loc.Location_Code ? "opacity-100" : "opacity-0")} /></CommandItem>))}
                         </CommandGroup></CommandList></Command></PopoverContent></Popover>
                         <Popover open={containerSizeOpen} onOpenChange={setContainerSizeOpen}><PopoverTrigger asChild>
                             <Button disabled={!selectedLocation} variant="outline" className="w-full lg:w-[200px] justify-between mt-1 mb-1 bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] px-3 py-1 rounded text-xs">
                                  <span className="truncate">
                                      {selectedContainerGroup || "Select Size(s)..."}
                                  </span>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                         </PopoverTrigger><PopoverContent className="w-[200px] p-0"><Command><CommandInput placeholder="Search size..." className="h-9" /><CommandList><CommandEmpty>No size found.</CommandEmpty><CommandGroup>
                            {containerSizeOptions.map((size, index) => (<CommandItem key={index} value={size.Container_Size} onSelect={(currentValue) => { handleContainerGroupSelect(currentValue); }}>
                                <Check className={cn("mr-2 h-4 w-4", selectedContainerGroup === size.Container_Size ? "opacity-100" : "opacity-0")} />{size.Container_Size}</CommandItem>))}
                         </CommandGroup></CommandList></Command></PopoverContent></Popover>
                     </div>
                     <div className="w-full lg:w-auto">
                         <LocalizationProvider dateAdapter={AdapterDayjs}><DatePicker label={<span style={{ color: "var(--borderclr)" }}>Select Date</span>} views={["year", "month"]} openTo="month" value={selectedDate} className="w-full"
                             sx={{ "& .MuiInputBase-root": { color: "var(--borderclr)", borderRadius: "8px", fontSize: "14px", height: "36px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--borderclr)" }, "& .MuiSvgIcon-root": { color: "var(--borderclr)" } }}
                             onChange={(newValue) => setSelectedDate(newValue)} /></LocalizationProvider>
                     </div>
                 </div>
             </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          {isLoading ? ( <div className="flex justify-center items-center h-96"><Loader2 className="h-16 w-16 animate-spin text-[var(--borderclr)]" /></div> ) : (
          <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs" style={{ fontSize: "12px", padding: "1px", whiteSpace: "nowrap" }}>
            <thead className="bg-[var(--bgBody3)] text-[var(--buttonHover)] border border-[var(--bgBody)]">
              <tr> 
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] text-orange-500 ">Sea Freight RFQ - FCL</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency</th>
                <th colSpan={s1DetailColumns.length + 1} className="py-1 px-2 border border-[var(--bgBody)]">{supplierNames.s1}</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">{supplierNames.s2} (Total)</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">{supplierNames.s3} (Total)</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                {s1DetailColumns.map(col => <th key={col} className="py-1 px-2 border border-[var(--bgBody)]">{col.replace('S1_', '')}</th>)}
                <th className="py-1 px-2 border border-[var(--bgBody)]">Total</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody3)]">
              <tr className="font-bold bg-[var(--bgBody)] border cursor-pointer" onClick={() => toggleSection("destination")}>
                <td>A.</td>
                <td colSpan={s1DetailColumns.length + 6} className="py-2 px-3 text-start flex items-center">{sections.destination ? "▼" : "▶"} Destination Charges</td>
              </tr>
              {sections.destination && destinationCharges.map((item, index) => renderChargeRow(item, index, currency, 1))}
              {sections.destination && renderTotalRow('Total Destination Charges', totals.destination, currency)}
              
              <tr className="font-bold bg-[var(--bgBody)] border cursor-pointer" onClick={() => toggleSection("seaFreight")}>
                <td>B.</td>
                <td colSpan={s1DetailColumns.length + 6} className="py-2 px-3 text-start flex items-center">{sections.seaFreight ? "▼" : "▶"} Sea Freight Charges</td>
              </tr>
              {sections.seaFreight && seaFreightCharges.map((item, index) => renderChargeRow(item, index, 'USD', destinationCharges.length + 1))}
              {sections.seaFreight && renderTotalRow('Total Sea Freight Charges', totals.seaFreight, 'USD')}
              
              <tr className="font-bold bg-[var(--bgBody)] border cursor-pointer" onClick={() => toggleSection("origin")}>
                <td>C.</td>
                <td colSpan={s1DetailColumns.length + 6} className="py-2 px-3 text-start flex items-center">{sections.origin ? "▼" : "▶"} Origin Charges</td>
              </tr>
              {sections.origin && originCharges.map((item, index) => renderChargeRow(item, index, 'INR', destinationCharges.length + seaFreightCharges.length + 1))}
              {sections.origin && renderTotalRow('Total Origin Charges', totals.origin, 'INR')}
              
              {totals.grandTotal && Object.keys(totals.grandTotal).length > 0 && <tr className="border bg-yellow-200 dark:bg-yellow-800 font-bold">
                <td colSpan="2" className="py-1 px-3 border text-start">Total Shipment Cost (A+B+C)</td>
                <td className="py-1 px-3 border">INR</td>
                {s1DetailColumns.map(col => <td key={col} className="py-1 px-3 border font-bold text-center">{totals.grandTotal[col]}</td>)}
                <td className="py-1 px-3 border text-center">{totals.grandTotal.S1_Total}</td>
                <td className="py-1 px-3 border text-center">{totals.grandTotal.S2_Total}</td>
                <td className="py-1 px-3 border text-center">{totals.grandTotal.S3_Total}</td>
                <td className="py-1 px-3 border"></td>
              </tr>}
              
               <tr>
                 <td colSpan="2" className="py-1 px-3 border text-start">INCO Term</td>
                 <td colSpan={s1DetailColumns.length + 5} className="py-1 px-3 border text-left">{incoterms}</td>
               </tr>
               <tr>
                 <td colSpan="2" className="py-1 px-3 border text-start">Pickup Address</td>             
                 <td colSpan={s1DetailColumns.length + 5} className="py-1 px-3 border text-left" dangerouslySetInnerHTML={{ __html: deliveryAddress }} />
               </tr>
               <tr>
                 <td colSpan="2" className="py-1 px-3 border text-start">FX Rate</td>
                 <td className="py-1 px-3 border text-left">USD: <span className="font-bold text-red-500">{USD}</span></td>
                 <td colSpan={s1DetailColumns.length + 4} className="py-1 px-3 border text-left">EURO: <span className="font-bold text-red-500">{EUR}</span></td>
               </tr>
                <tr>
                    <td colSpan="2" className="py-1 px-3 border text-start">Origin Port</td>
                    <td colSpan="2" className="py-1 px-3 border text-left">{Dest_Port}</td>
                    <td className="py-1 px-3 border text-start">Preferred Liners</td>
                    <td colSpan={s1DetailColumns.length + 2} className="py-1 px-3 border text-left">{Pref_Liners}</td>
                </tr>
                <tr>
                    <td colSpan="2" className="py-1 px-3 border text-start">Upload PDF</td>
                    <td colSpan={s1DetailColumns.length + 5} className="py-1 px-3 border text-left">
                        {uploadedPdfPath ? 
                        <a href={uploadedPdfPath} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                            <FaFilePdfIcon />{uploadedPdfPath.split('/').pop()}</a>
                        :<span>No PDF Uploaded</span>}
                    </td>
                </tr>
                <tr>
                    <td colSpan="2" className="py-1 px-3 border text-start">Remarks</td>
                    <td colSpan={s1DetailColumns.length + 5} className="py-1 px-3 border text-left">
                        <input readOnly type="text" placeholder="..." className="w-full bg-transparent border-none focus:outline-none text-left" value={remarks} />
                    </td>
                </tr>
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;