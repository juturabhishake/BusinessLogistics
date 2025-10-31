"use client";
import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { FaFilePdf } from "react-icons/fa";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const QuotationPrintTable = () => {
  const [sections, setSections] = useState({ origin: true, seaFreight: true, destination: true });
  const [originCharges, setOriginCharges] = useState([]);
  const [seaFreightCharges, setSeaFreightCharges] = useState([]);
  const [destinationCharges, setDestinationCharges] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [containerSizeOpen, setContainerSizeOpen] = useState(false);
  const [selectedContainerSizes, setSelectedContainerSizes] = useState([]);
  const [containerSizeOptions, setContainerSizeOptions] = useState([]);
  const [USD, setUSD] = useState(0.00);
  const [EUR, setEUR] = useState(0.00);
  const [incoterms, setIncoterms] = useState("");
  const [transitDays, setTransitDays] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [currency, setCurrency] = useState("");
  const [remarks, setRemarks] = useState("");
  const [Free_Days, setFree_Days] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isDataLoading, setIsDataLoading] = useState(false);
  
  const initialOriginCharges = [ { description: "Customs clearence", remarks: "Per Container" }, { description: "CC Fee", remarks: "Per Container" }, { description: "D.O Charges", remarks: "Per Container" }, { description: "LINER CHARGES (At Actuals)", remarks: "Per BL" }, { description: "Loading / Unloading", remarks: "Per Container" }, { description: "Delivery", remarks: "" } ];
  const initialSeaFreightCharges = [ { description: "Sea Freight", remarks: "Per Container" }, { description: "ENS", remarks: "Per BL" }, { description: "ISPS", remarks: "Per Container" }, { description: "IT Transmission", remarks: "Per Container" } ];
  const initialDestinationCharges = [ { description: "Pickup & Clerance Charges", remarks: "Per Container" }, { description: "Custom Clearance", remarks: "Per BL" }, { description: "Handling / DO/ ", remarks: "Per Container" }, { description: "Terminal Handling Charge ", remarks: "Per Container" }, { description: "Documentation ", remarks: "Per Container" }, { description: "T1 Doc", remarks: "Per Container" }, { description: "LOLO Charges", remarks: "Per Container" } ];

  useEffect(() => {
    if (secureLocalStorage.getItem("sc") === 'admin') {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const selectedMonth = dayjs(selectedDate).month() + 1;
        const selectedYear = dayjs(selectedDate).year();
        const response = await fetch('/api/get_locations_Adhoc_Air_multi', {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Shipment_Type: 'ADOCFCL', Transport_Type: 'import', Month_No: selectedMonth, Year_No: selectedYear }),
        });
        const data = await response.json();
        setLocations(data.result || []);
      } catch (error) { console.error("Error fetching locations:", error); }
    };
    if (selectedDate) fetchLocations();
  }, [selectedDate]);

  useEffect(() => {
    const fetchContainerSizes = async () => {
      if (selectedLocation && selectedDate) {
        try {
          const selectedMonth = dayjs(selectedDate).month() + 1;
          const selectedYear = dayjs(selectedDate).year();
          const response = await fetch('/api/ADOC/get_containers_multi', {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipType: "ADOCFCL", transport_type: "import", locCode: selectedLocation, MonthNo: selectedMonth, YearNo: selectedYear }),
          });
          const data = await response.json();
          setContainerSizeOptions(data.result || []);
        } catch (error) { console.error("Error fetching container sizes:", error); }
      }
    };
    fetchContainerSizes();
  }, [selectedLocation, selectedDate]);
  
  const resetChargesAndTerms = () => {
    const reset = (charges) => charges.map(c => ({ description: c.description, remarks: c.remarks }));
    setOriginCharges(reset(initialOriginCharges));
    setSeaFreightCharges(reset(initialSeaFreightCharges));
    setDestinationCharges(reset(initialDestinationCharges));
    setIncoterms(""); setTransitDays(""); setDeliveryAddress(""); setCurrency(""); setRemarks(""); setFree_Days(""); setUSD(0); setEUR(0);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (selectedLocation && selectedContainerSizes.length > 0 && selectedDate) {
        setIsDataLoading(true);
        try {
          await fetchSupplierDetails();
          await fetchAllQuotationData();
        } catch (error) { console.error("Error fetching data:", error); } 
        finally { setIsDataLoading(false); }
      } else {
        resetChargesAndTerms();
      }
    };
    fetchAllData();
  }, [selectedLocation, selectedContainerSizes, selectedDate]);

  const fetchSupplierDetails = async () => {
    try {
      const selectedMonth = dayjs(selectedDate).month() + 1;
      const selectedYear = dayjs(selectedDate).year();
      const response = await fetch('/api/ADOC/ADOCFCL_Terms_Print', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Shipment_Type: 'ADOCFCL', Transport_Type: 'import', Loc_Code: selectedLocation, Container_Size: selectedContainerSizes.join(','), MonthNo: selectedMonth, YearNo: selectedYear }),
      });
      const data = await response.json();
      if (data.result && data.result.length > 0) {
        const details = data.result[0];
        setIncoterms(details.Incoterms || ""); setTransitDays(details.Transit_Days || ""); setDeliveryAddress(details.Delivery_Address || ""); setCurrency(details.Currency || ""); setFree_Days(details.Free_Days || ""); setRemarks(details.Remarks || ""); setUSD(parseFloat(details.USD) || 0); setEUR(parseFloat(details.EURO) || 0);
      }
    } catch (error) { console.error("Error fetching supplier details:", error); }
  };

  const fetchAllQuotationData = async () => {
    try {
      const selectedMonth = dayjs(selectedDate).month() + 1;
      const selectedYear = dayjs(selectedDate).year();
      const response = await fetch("/api/userPrints/ADOC_Import_FCL_multi", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loc_code: selectedLocation, sc: secureLocalStorage.getItem("sc"), quote_month: selectedMonth, quote_year: selectedYear, container_sizes: selectedContainerSizes.join(',') }),
      });
      const data = await response.json();
      let combinedOrigin = initialOriginCharges.map(c => ({ ...c }));
      let combinedSeaFreight = initialSeaFreightCharges.map(c => ({ ...c }));
      let combinedDestination = initialDestinationCharges.map(c => ({ ...c }));

      if (data && data.length > 0) {
        data.forEach(item => {
          const size = item.Container_Size;
          if (selectedContainerSizes.includes(size)) {
            combinedOrigin[0][size] = item.O_CCD; combinedOrigin[1][size] = item.O_LTG; combinedOrigin[2][size] = item.O_THC; combinedOrigin[3][size] = item.O_BLC; combinedOrigin[4][size] = item.O_LUS; combinedOrigin[5][size] = item.O_Halt;
            combinedSeaFreight[0][size] = item.S_SeaFre; combinedSeaFreight[1][size] = item.S_ENS; combinedSeaFreight[2][size] = item.S_ISPS; combinedSeaFreight[3][size] = item.S_ITT;
            combinedDestination[0][size] = item.D_DTH; combinedDestination[1][size] = item.D_BLF; combinedDestination[2][size] = item.D_DBR; combinedDestination[3][size] = item.D_DOF; combinedDestination[4][size] = item.D_HC; combinedDestination[5][size] = item.D_TDO; combinedDestination[6][size] = item.D_LOC;
          }
        });
      }
      setOriginCharges(combinedOrigin);
      setSeaFreightCharges(combinedSeaFreight);
      setDestinationCharges(combinedDestination);
    } catch (error) { console.error("Error fetching quotation data:", error); resetChargesAndTerms(); }
  };

  const calculateTotals = (charges, isUSD = false, isSeaFreight = false) => {
    const totals = {};
    selectedContainerSizes.forEach(size => {
      totals[size] = charges.reduce((acc, charge) => {
        const val = parseFloat(charge[size] || 0);
        if (isSeaFreight) return acc + (val * USD);
        if (isUSD) return acc + (val * (currency === "EURO" ? EUR : USD));
        return acc + val;
      }, 0);
    });
    totals.total = Object.values(totals).reduce((acc, val) => acc + (val || 0), 0);
    return totals;
  };

  const totalOrigin = calculateTotals(originCharges);
  const totalSeaFreight = calculateTotals(seaFreightCharges, false, true);
  const totalDestination = calculateTotals(destinationCharges, true);
  const totalShipmentCost = {};
  selectedContainerSizes.forEach(size => { totalShipmentCost[size] = (totalOrigin[size] || 0) + (totalSeaFreight[size] || 0) + (totalDestination[size] || 0); });
  totalShipmentCost.total = Object.values(totalShipmentCost).reduce((acc, val) => acc + (val || 0), 0);

  const downloadPDF = () => {
    if (selectedContainerSizes.length === 0) {
        alert("Please select at least one container size.");
        return;
    }
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Comparitive Statement of quotations", 15, 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`"RFQ Import rates for ${dayjs(selectedDate).format("MMMM YYYY")}"`, 15, 15);
    doc.text(`We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"`, 15, 20);

    const tableHeaders = [
        ["S.No", "Descriptions", "Currency", ...selectedContainerSizes, "Total", "Remarks"]
    ];

    const tableBody = [];
    let sno = 1;

    const addSectionToPdf = (title, charges, currencyType, totals) => {
        tableBody.push([{ content: title, colSpan: tableHeaders[0].length, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }]);
        charges.forEach(item => {
            const row = [sno++, item.description, `${currencyType} / Shipment`];
            let rowTotal = 0;
            selectedContainerSizes.forEach(size => {
                const value = parseFloat(item[size] || 0);
                row.push(value.toFixed(2));
                rowTotal += value;
            });
            row.push(rowTotal.toFixed(2));
            row.push(item.remarks);
            tableBody.push(row);
        });
        const totalRow = [{ content: `Total ${title}`, colSpan: 2, styles: { fontStyle: 'bold' } }, 'INR'];
        selectedContainerSizes.forEach(size => totalRow.push(totals[size] ? totals[size].toFixed(2) : "0.00"));
        totalRow.push(totals.total ? totals.total.toFixed(2) : "0.00");
        totalRow.push("");
        tableBody.push(totalRow);
    };

    addSectionToPdf("A) EX Works Charges", destinationCharges, currency, totalDestination);
    addSectionToPdf("B) Sea Freight Charges", seaFreightCharges, "USD", totalSeaFreight);
    addSectionToPdf("C) Destination Charges", originCharges, "INR", totalOrigin);

    const finalCostRow = [{ content: 'TOTAL SHIPMENT COST (A+B+C)', colSpan: 2, styles: { fontStyle: 'bold', fillColor: [220, 220, 220] } }, 'INR'];
    selectedContainerSizes.forEach(size => finalCostRow.push(totalShipmentCost[size] ? totalShipmentCost[size].toFixed(2) : "0.00"));
    finalCostRow.push(totalShipmentCost.total ? totalShipmentCost.total.toFixed(2) : "0.00");
    finalCostRow.push("");
    tableBody.push(finalCostRow);

    // Terms & Conditions section added to the table body
    const cleanedAddress = deliveryAddress.replace(/<br\s*\/?>/gi, "\n");
    tableBody.push([{ content: "INCO Term", colSpan: 2 }, { content: incoterms, colSpan: selectedContainerSizes.length + 2 }]);
    tableBody.push([{ content: "Delivery Address", colSpan: 2 }, { content: cleanedAddress, colSpan: selectedContainerSizes.length + 2 }]);
    tableBody.push([{ content: "Required Transit Days:", colSpan: 2 }, { content: transitDays, colSpan: selectedContainerSizes.length + 2 }]);
    tableBody.push([{ content: "Free Days at Destination:", colSpan: 2 }, { content: Free_Days, colSpan: selectedContainerSizes.length + 2 }]);
    tableBody.push([{ content: "FX Rate", colSpan: 2 }, { content: `USD: ${USD.toFixed(2)}, EURO: ${EUR.toFixed(2)}`, colSpan: selectedContainerSizes.length + 2 }]);
    tableBody.push([{ content: "Remarks", colSpan: 2 }, { content: remarks, colSpan: selectedContainerSizes.length + 2 }]);

    doc.autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 7, cellPadding: 1.5, overflow: 'linebreak' },
        headStyles: { fillColor: [200, 200, 200], textColor: 0, fontStyle: 'bold' },
        didParseCell: function (data) {
            // Apply right alignment to all columns starting from index 3
            if (data.column.index >= 3 && data.section === 'body') {
                data.cell.styles.halign = 'right';
            }
        }
    });
    
    doc.save(`Quotation_FCL_Print_${locationName}.pdf`);
  };
  
  return (
    <div>
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Comparitive Statement of quotations</h2>
              <p className="text-xs text-gray-100">"RFQ Import rates for {dayjs(selectedDate).format("MMMM YYYY")}"</p>
              <p className="text-xs text-gray-100">We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"</p>
            </div>
            <div className="flex flex-col lg:flex-row items-center justify-end gap-2 mt-2 lg:mt-0">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker label={<span style={{ color: "var(--borderclr)" }}>Select Month</span>} views={["year", "month"]} openTo="month" value={selectedDate} sx={{ "& .MuiInputBase-root": { color: "var(--borderclr)", borderRadius: "8px", fontSize: "14px" }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--borderclr)" }, "& .MuiSvgIcon-root": { color: "var(--borderclr)" } }} onChange={(newValue) => setSelectedDate(newValue)} />
              </LocalizationProvider>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button role="combobox" variant="outline" className="bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] px-3 py-1 rounded w-[200px] justify-between" style={{fontSize:"12px"}}>
                    {selectedLocation ? locations.find(loc => loc.Location_Code === selectedLocation)?.Location_Name : "Select Location..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0"><Command><CommandInput placeholder="Search location..." /><CommandList><CommandEmpty>No location found.</CommandEmpty><CommandGroup>{locations.map((location) => (<CommandItem key={location.Location_Code} value={location.Location_Code} onSelect={(val) => { setSelectedLocation(val); setLocationName(location.Location_Name); setOpen(false); setSelectedContainerSizes([]) }}>{location.Location_Name}<Check className={cn("ml-auto", selectedLocation === location.Location_Code ? "opacity-100" : "opacity-0")} /></CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
              </Popover>
              <Popover open={containerSizeOpen} onOpenChange={setContainerSizeOpen}>
                <PopoverTrigger asChild>
                  <Button disabled={!selectedLocation} role="combobox" variant="outline" className="bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] px-3 py-1 rounded w-[200px] justify-between" style={{fontSize:"12px"}}>
                    {selectedContainerSizes.length > 0 ? selectedContainerSizes.join(', ') : "Select Size(s)..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0"><Command><CommandInput placeholder="Search size..." /><CommandList><CommandEmpty>No size found.</CommandEmpty><CommandGroup>{containerSizeOptions.map((sizeOpt, index) => (<CommandItem key={index} value={sizeOpt.Container_Size} onSelect={() => { setSelectedContainerSizes(sizeOpt.Container_Size.split(',').map(s => s.trim())); setContainerSizeOpen(false); }}>{sizeOpt.Container_Size}<Check className={cn("ml-auto h-4 w-4", selectedContainerSizes.join(',') === sizeOpt.Container_Size ? "opacity-100" : "opacity-0")} /></CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
              </Popover>
              <Button onClick={downloadPDF} variant="outline" className="bg-red-500 text-white rounded hover:bg-red-600"><FaFilePdf /></Button>
            </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          {isDataLoading ? (<div className="flex items-center justify-center h-96 text-gray-400"><Loader2 className="mr-2 h-8 w-8 animate-spin" /><span>Loading Data...</span></div>) : selectedContainerSizes.length > 0 ? (
            <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs">
              <thead className="bg-[var(--bgBody3)] text-[var(--buttonHover)] border border-[var(--bgBody)]">
                <tr>
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Sea Freight Import - Adhoc FCL</th>
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency in</th>
                  <th colSpan={selectedContainerSizes.length + 1} className="py-1 px-2 border border-[var(--bgBody)]">Quote for GTI to {locationName || "{loc}"} shipment</th>
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
                </tr>
                <tr>
                    {selectedContainerSizes.map(size => <th key={size} className="py-1 px-2 border border-[var(--bgBody)]">{size}</th>)}
                    <th className="py-1 px-2 border border-[var(--bgBody)]">Total</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bgBody3)]">
                {[{ title: "EX Works Charges", data: destinationCharges, totals: totalDestination, section: "destination", currency: currency },
                  { title: "Sea Freight Charges", data: seaFreightCharges, totals: totalSeaFreight, section: "seaFreight", currency: 'USD' },
                  { title: "Destination Charges", data: originCharges, totals: totalOrigin, section: "origin", currency: 'INR' }
                ].map(({ title, data, totals, section, currency }, sectionIndex) => (
                    <React.Fragment key={section}>
                      <tr className="font-bold bg-[var(--bgBody)] border cursor-pointer" onClick={() => setSections(p => ({ ...p, [section]: !p[section] }))}><td>{['A', 'B', 'C'][sectionIndex]}.</td><td colSpan={selectedContainerSizes.length + 3} className="py-2 px-3 text-start flex items-center">{sections[section] ? "▼" : "▶"} {title}</td></tr>
                      {sections[section] && data.map((item, index) => (
                        <tr key={index} className="border">
                          <td className="py-1 px-3 border">{index + 1}</td>
                          <td className="py-1 px-3 border text-start">{item.description}</td>
                          <td className="py-1 px-3 border">{currency} / Shipment</td>
                          {selectedContainerSizes.map(size => (<td key={size} className="py-1 px-3 border text-right">{item[size] || '0.00'}</td>))}
                          <td className="py-1 px-3 border font-bold text-right">{(selectedContainerSizes.reduce((a,c) => a + parseFloat(item[c]||0), 0)).toFixed(2)}</td>
                          <td className="py-1 px-3 border">{item.remarks}</td>
                        </tr>
                      ))}
                      {sections[section] && (<tr className="border"><td colSpan="2" className="font-bold py-1 px-3 border">Total {title}</td><td className="py-1 px-3 border">INR</td>
                          {selectedContainerSizes.map(size => <td key={size} className="py-1 px-3 border font-bold text-right">{totals[size]?.toFixed(2)}</td>)}
                          <td className="py-1 px-3 border font-bold text-right">{totals.total?.toFixed(2)}</td>
                          <td className="py-1 px-3 border"></td></tr>)}
                    </React.Fragment>
                ))}
                <tr className="border font-bold bg-[var(--bgBody)]"><td colSpan="2" className="py-1 px-3 border text-start">Total Shipment Cost in INR (A+B+C)</td><td className="py-1 px-3 border"></td>
                  {selectedContainerSizes.map(size => <td key={size} className="py-1 px-3 border font-bold text-right">{totalShipmentCost[size]?.toFixed(2)}</td>)}
                  <td className="py-1 px-3 border font-bold text-right">{totalShipmentCost.total?.toFixed(2)}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
                <tr><td colSpan={2} className="py-1 px-3 border text-start">INCO Term</td><td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">{incoterms}</td></tr>
                <tr><td colSpan={2} className="py-1 px-3 border text-start">Delivery Address</td><td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left" dangerouslySetInnerHTML={{ __html: deliveryAddress }} /></tr>
                <tr><td colSpan={2} className="py-1 px-3 border text-start">FX Rate</td><td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">USD: <span className="font-bold text-red-500">{USD.toFixed(2)}</span><span className="ml-4">EURO: <span className="font-bold text-red-500">{EUR.toFixed(2)}</span></span></td></tr>
                <tr><td colSpan={2} className="py-1 px-3 border text-start">Required Transit Days:</td><td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">{transitDays}</td></tr>
                <tr><td colSpan={2} className="py-1 px-3 border text-start">Free Days Requirement at Destination:</td><td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">{Free_Days}</td></tr>
                <tr><td colSpan={2} className="py-1 px-3 border text-start">Remarks</td><td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">{remarks}</td></tr>
              </tbody>
            </table>
          ) : (<div className="flex items-center justify-center h-96 text-gray-400"><p>Please select a date, location, and container size(s) to view details.</p></div>)}
        </div>
      </div>
    </div>
  );
};

export default QuotationPrintTable;