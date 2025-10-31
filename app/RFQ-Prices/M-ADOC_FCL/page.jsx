"use client";
import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";
import { FaFileExport } from "react-icons/fa";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const QuotationTable = () => {
  const [currentDateInfo, setCurrentDateInfo] = useState("");
  const [sections, setSections] = useState({ origin: true, seaFreight: true, destination: true });
  const [saveState, setSaveState] = useState("idle");
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
  const [quoteDate, setQuoteDate] = useState("");
  const [quoteTime, setQuoteTime] = useState("");
  const [Request_Id, setRequest_Id] = useState(0);
  const [isContainersLoading, setIsContainersLoading] = useState(false);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);

  const initialOriginCharges = [ { description: "Customs clearence", remarks: "Per Container" }, { description: "CC Fee", remarks: "Per Container" }, { description: "D.O Charges", remarks: "Per Container" }, { description: "LINER CHARGES", remarks: "Per BL" }, { description: "Loading / Unloading", remarks: "Per Container" }, { description: "Delivery", remarks: "" } ];
  const initialSeaFreightCharges = [ { description: "Sea Freight", remarks: "Per Container" }, { description: "ENS", remarks: "Per BL" }, { description: "ISPS", remarks: "Per Container" }, { description: "IT Transmission", remarks: "Per Container" } ];
  const initialDestinationCharges = [ { description: "Pickup & Clerance Charges", remarks: "Per Container" }, { description: "Custom Clearance", remarks: "Per BL" }, { description: "Handling / DO/ ", remarks: "Per Container" }, { description: "Terminal Handling Charge ", remarks: "Per Container" }, { description: "Documentation ", remarks: "Per Container" }, { description: "T1 Doc", remarks: "Per Container" }, { description: "LOLO Charges", remarks: "Per Container" } ];

  useEffect(() => {
    if (secureLocalStorage.getItem("sc") === 'admin') {
      window.location.href = "/";
    }
  }, []);
  
  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 20);
    const monthNames = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
    setCurrentDateInfo(`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`);
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/get_locations_Adhoc_Air_multi', {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Shipment_Type: 'ADOCFCL', Transport_Type: 'import' }),
        });
        const data = await response.json();
        setLocations(data.result || []);
      } catch (error) { console.error("Error fetching locations:", error); }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchContainerSizes = async () => {
      if (selectedLocation) {
        setIsContainersLoading(true);
        setSelectedContainerSizes([]); setContainerSizeOptions([]);
        try {
          const response = await fetch('/api/ADOC/get_containers_multi', {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shipType: "ADOCFCL", transport_type: "import", locCode: selectedLocation }),
          });
          const data = await response.json();
          setContainerSizeOptions(data.result || []);
        } catch (error) { console.error("Error fetching container sizes:", error); } 
        finally { setIsContainersLoading(false); }
      }
    };
    fetchContainerSizes();
  }, [selectedLocation]);
  
  useEffect(() => {
    const fetchAllData = async () => {
      if (selectedContainerSizes.length > 0 && selectedLocation) {
        setIsQuoteLoading(true);
        try {
            await fetchSupplierDetails();
            await fetchAllQuotationData();
        } catch (error) { console.error("Error fetching all quote data:", error); }
        finally { setIsQuoteLoading(false); }
      } else {
        resetChargesAndTerms();
      }
    };
    fetchAllData();
  }, [selectedContainerSizes, selectedLocation]);

  const resetChargesAndTerms = () => {
    const reset = (charges) => charges.map(c => ({ description: c.description, remarks: c.remarks }));
    setOriginCharges(reset(initialOriginCharges));
    setSeaFreightCharges(reset(initialSeaFreightCharges));
    setDestinationCharges(reset(initialDestinationCharges));
    setIncoterms(""); setTransitDays(""); setDeliveryAddress(""); setCurrency(""); setRemarks(""); setFree_Days(""); setUSD(0); setEUR(0); setQuoteDate(""); setQuoteTime(""); setRequest_Id(0);
  };

  const fetchAllQuotationData = async () => {
    const chargePromises = selectedContainerSizes.map(size => fetchSingleQuotationData(size));
    const results = await Promise.all(chargePromises);
    
    let combinedOrigin = initialOriginCharges.map(c => ({...c}));
    let combinedSeaFreight = initialSeaFreightCharges.map(c => ({...c}));
    let combinedDestination = initialDestinationCharges.map(c => ({...c}));

    results.forEach((data, i) => {
        const size = selectedContainerSizes[i];
        if(data){
            combinedOrigin.forEach((charge, idx) => charge[size] = data.origin[idx][size]);
            combinedSeaFreight.forEach((charge, idx) => charge[size] = data.sea[idx][size]);
            combinedDestination.forEach((charge, idx) => charge[size] = data.dest[idx][size]);
        }
    });

    setOriginCharges(combinedOrigin);
    setSeaFreightCharges(combinedSeaFreight);
    setDestinationCharges(combinedDestination);
  };

  const fetchSingleQuotationData = async (containerSize) => {
    try {
        const response = await fetch("/api/ADOC/get/get_adoc_import_fcl_quote_multi", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Loc_Code: selectedLocation, sc: secureLocalStorage.getItem("sc") || "Unknown", containerSize: containerSize }),
        });
        const data = await response.json();
        if (data.result && data.result.length > 0) {
            const res = data.result[0];
            const origin = initialOriginCharges.map(c => ({...c, [containerSize]: ""}));
            origin[0][containerSize] = res.O_CCD; origin[1][containerSize] = res.O_LTG; origin[2][containerSize] = res.O_THC; origin[3][containerSize] = res.O_BLC; origin[4][containerSize] = res.O_LUS; origin[5][containerSize] = res.O_Halt;
            
            const sea = initialSeaFreightCharges.map(c => ({...c, [containerSize]: ""}));
            sea[0][containerSize] = res.S_SeaFre; sea[1][containerSize] = res.S_ENS; sea[2][containerSize] = res.S_ISPS; sea[3][containerSize] = res.S_ITT;
            
            const dest = initialDestinationCharges.map(c => ({...c, [containerSize]: ""}));
            dest[0][containerSize] = res.D_DTH; dest[1][containerSize] = res.D_BLF; dest[2][containerSize] = res.D_DBR; dest[3][containerSize] = res.D_DOF; dest[4][containerSize] = res.D_HC; dest[5][containerSize] = res.D_TDO; dest[6][containerSize] = res.D_LOC;

            setRemarks(res.remarks || "");
            return { origin, sea, dest };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching data for ${containerSize}:`, error);
        return null;
    }
  };
  
  const handleSave = async () => {
    if (!selectedLocation || selectedContainerSizes.length === 0 || !quoteDate) {
      alert("Please select a location, container sizes, and ensure quote date is loaded before saving.");
      return;
    }
    setSaveState("saving");

    const parseValue = (charges, description, size) => parseFloat(charges.find(c => c.description === description)?.[size] || 0);

    const quotesToSave = selectedContainerSizes.map(size => {
        const totalOriginForSize = originCharges.reduce((acc, c) => acc + parseFloat(c[size] || 0), 0);
        const totalSeaFreightForSize = seaFreightCharges.reduce((acc, c) => acc + parseFloat(c[size] || 0), 0) * USD;
        const totalDestinationForSize = destinationCharges.reduce((acc, c) => acc + parseFloat(c[size] || 0), 0) * (currency === "EURO" ? EUR : USD);
        const totalShipmentCostForSize = totalOriginForSize + totalSeaFreightForSize + totalDestinationForSize;
        
        const formattedDate = new Date(quoteDate).toISOString().split('T')[0];

        return {
            Supplier_Code: secureLocalStorage.getItem("sc") || "Unknown",
            Location_Code: selectedLocation,
            Quote_Date: formattedDate,
            Container_Size: size,
            
            O_CCD: parseValue(originCharges, "Customs clearence", size),
            O_LTG: parseValue(originCharges, "CC Fee", size),
            O_THC: parseValue(originCharges, "D.O Charges", size),
            O_BLC: parseValue(originCharges, "LINER CHARGES", size),
            O_LUS: parseValue(originCharges, "Loading / Unloading", size),
            O_Halt: parseValue(originCharges, "Delivery", size),
            O_Total_Chg: totalOriginForSize,

            S_SeaFre: parseValue(seaFreightCharges, "Sea Freight", size),
            S_ENS: parseValue(seaFreightCharges, "ENS", size),
            S_ISPS: parseValue(seaFreightCharges, "ISPS", size),
            S_ITT: parseValue(seaFreightCharges, "IT Transmission", size),
            S_Total_Chg: totalSeaFreightForSize,
            
            D_DTH: parseValue(destinationCharges, "Pickup & Clerance Charges", size),
            D_BLF: parseValue(destinationCharges, "Custom Clearance", size),
            D_DBR: parseValue(destinationCharges, "Handling / DO/ ", size),
            D_DOF: parseValue(destinationCharges, "Terminal Handling Charge ", size),
            D_HC: parseValue(destinationCharges, "Documentation ", size),
            D_TDO: parseValue(destinationCharges, "T1 Doc", size),
            D_LOC: parseValue(destinationCharges, "LOLO Charges", size),
            D_Total_Chg: totalDestinationForSize,

            Total_Ship_Cost: totalShipmentCostForSize,
            
            Created_By: secureLocalStorage.getItem("un") || "Unknown",
            Updated_By: secureLocalStorage.getItem("un") || "Unknown",
            remarks: remarks,
            Request_Id: Request_Id,
        };
    });

    try {
        const response = await fetch("/api/ADOC/save/save_adoc_import_fcl_quote_multi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quotes: quotesToSave }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || `Failed to save quotes. Status: ${response.status}`);
        }

        setSaveState("saved");
        setTimeout(() => setSaveState("idle"), 5000);

    } catch (error) {
        console.error("Error saving quotes:", error);
        setSaveState("idle");
        alert(`An error occurred while saving quotes: ${error.message}`);
    }
  };
  
  const handleInputChange = (setStateFunction, index, field, value) => {
    setStateFunction(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
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
    totals.total = Object.values(totals).reduce((acc, val) => acc + val, 0);
    return totals;
  };
  
  const totalOrigin = calculateTotals(originCharges);
  const totalSeaFreight = calculateTotals(seaFreightCharges, false, true);
  const totalDestination = calculateTotals(destinationCharges, true);
  const totalShipmentCost = {};
  selectedContainerSizes.forEach(size => { totalShipmentCost[size] = (totalOrigin[size] || 0) + (totalSeaFreight[size] || 0) + (totalDestination[size] || 0); });
  totalShipmentCost.total = Object.values(totalShipmentCost).reduce((acc, val) => acc + val, 0);

  const fetchSupplierDetails = async () => {
    if (!selectedLocation) return Promise.resolve();
    try {
      const response = await fetch('/api/ADOC/ADOCFCL_Terms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Shipment_Type: 'ADOCFCL', Transport_Type: 'import', Loc_Code: selectedLocation, Container_Size: selectedContainerSizes.join(',') }),
      });
      const data = await response.json();
      if (data.result && data.result.length > 0) {
        const details = data.result[0];
        setIncoterms(details.Incoterms || ""); setTransitDays(details.Transit_Days || ""); setDeliveryAddress(details.Delivery_Address || ""); setCurrency(details.Currency || ""); setFree_Days(details.Free_Days || ""); setRemarks(details.Remarks || ""); setUSD(parseFloat(details.USD) || 0); setEUR(parseFloat(details.EURO) || 0); setQuoteDate(details.Request_Date || ""); setQuoteTime("11:00 AM"); setRequest_Id(details.Request_Id || 0);
      }
    } catch (error) { console.error("Error fetching supplier details:", error); }
  };

  const downloadPDF = () => { window.location.href = "/prints/ADOC/import/fcl"; };
  
  return (
    <div>
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex flex-col">
                <h2 className="text-sm font-bold">Comparitive Statement of quotations</h2>
                <p className="text-xs text-gray-100">"RFQ Import rates for {currentDateInfo}"</p>
                <p className="text-xs text-gray-100">We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"</p>
              </div>
              <div className="flex flex-col items-start justify-start lg:flex-row justify-end gap-2">
                <div className="flex flex-col lg:flex-row gap-2">
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button role="combobox" variant="outline" className="mt-1 mb-1 bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] px-3 py-1 rounded" style={{ minWidth: "80px", fontSize:"12px" }}>
                        {selectedLocation ? locations.find(loc => loc.Location_Code === selectedLocation)?.Location_Name : "Select Location..."}
                        <ChevronsUpDown className="opacity-50" />
                      </Button> 
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command><CommandInput placeholder="Search location..." className="h-9" /><CommandList><CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>{locations.map((location) => (<CommandItem key={location.Location_Code} value={location.Location_Code} onSelect={(val) => { setSelectedLocation(val === selectedLocation ? "" : val); setLocationName(val === selectedLocation ? "" : location.Location_Name); setOpen(false); }}>{location.Location_Name}<Check className={cn("ml-auto", selectedLocation === location.Location_Code ? "opacity-100" : "opacity-0")}/></CommandItem>))}</CommandGroup>
                      </CommandList></Command>
                    </PopoverContent>
                  </Popover>
                  <Popover open={containerSizeOpen} onOpenChange={setContainerSizeOpen}>
                    <PopoverTrigger asChild>
                      <Button disabled={!selectedLocation || isContainersLoading} role="combobox" variant="outline" className="mt-1 mb-1 bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] px-3 py-1 rounded" style={{ minWidth: "120px", fontSize:"12px" }}>
                        {isContainersLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (selectedContainerSizes.length > 0 ? selectedContainerSizes.join(', ') : "Select Size...")}
                        {!isContainersLoading && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command><CommandInput placeholder="Search size..." className="h-9" /><CommandList><CommandEmpty>No size found.</CommandEmpty>
                        <CommandGroup>{containerSizeOptions.map((size, index) => (<CommandItem key={index} value={size.Container_Size} onSelect={() => { setSelectedContainerSizes(size.Container_Size.split(',').map(s=>s.trim())); setContainerSizeOpen(false); }}>{size.Container_Size}<Check className={cn("ml-auto h-4 w-4", selectedContainerSizes.join(',') === size.Container_Size ? "opacity-100" : "opacity-0")}/></CommandItem>))}</CommandGroup>
                      </CommandList></Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleSave} disabled={!selectedLocation || selectedContainerSizes.length === 0 || saveState !== 'idle' || isQuoteLoading}
                    className="mt-0 lg:mt-0 flex items-center justify-center bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] text-sm px-3 py-3 rounded" style={{ minWidth: "80px" }} >
                    {saveState === "idle" && <FiSave size={16} />}
                    {saveState === "saving" && <FiLoader size={16} className="animate-spin" />}
                    {saveState === "saved" && <FiCheck size={16} />}
                  </button>
                  <Button onClick={downloadPDF} variant="outline" className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                    <FaFileExport />
                  </Button>
                </div>
              </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          {isQuoteLoading ? (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <span>Loading Quotation Data... Please Wait.</span>
            </div>
          ) : selectedContainerSizes.length > 0 ? (
            <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs">
              <thead className="bg-[var(--bgBody3)] text-[var(--buttonHover)] border border-[var(--bgBody)]">
                <tr> 
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Sea Freight Import - Adhoc FCL {" "} <span className="text-red-500">({quoteDate ? new Date(quoteDate).toLocaleDateString("en-GB") : ""} {quoteTime})</span></th>
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency in</th>
                  <th colSpan={selectedContainerSizes.length + 1} className="py-1 px-2 border border-[var(--bgBody)]">Quote for GTI to {locationName || "{select location}"} shipment</th>
                  <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
                </tr>
                <tr>
                  {selectedContainerSizes.map(size => <th key={size} className="py-1 px-2 border border-[var(--bgBody)]">{size}</th>)}
                  <th className="py-1 px-2 border border-[var(--bgBody)]">Total</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--bgBody3)]">
                  {[{ title: "EX Works Charges", data: destinationCharges, handler: handleInputChange.bind(null, setDestinationCharges), totals: totalDestination, section: "destination", prefix: 'A' },
                    { title: "Sea Freight Charges", data: seaFreightCharges, handler: handleInputChange.bind(null, setSeaFreightCharges), totals: totalSeaFreight, section: "seaFreight", prefix: 'B' },
                    { title: "Destination Charges", data: originCharges, handler: handleInputChange.bind(null, setOriginCharges), totals: totalOrigin, section: "origin", prefix: 'C' }
                  ].map(({ title, data, handler, totals, section, prefix }, sectionIndex) => (
                      <React.Fragment key={section}>
                          <tr className="font-bold bg-[var(--bgBody)] border cursor-pointer" onClick={() => setSections(p => ({...p, [section]: !p[section]}))}>
                              <td>{prefix}.</td><td colSpan={selectedContainerSizes.length + 3} className="py-2 px-3 text-start flex items-center">{sections[section] ? "▼" : "▶"} {title}</td>
                          </tr>
                          {sections[section] && data.map((item, index) => (
                              <tr key={index} className="border">
                                  <td className="py-1 px-3 border">{sectionIndex * 10 + index + 1}</td>
                                  <td className="py-1 px-3 border text-start">{item.description}</td>
                                  <td className="py-1 px-3 border">{section === "seaFreight" ? "USD" : section === "destination" ? currency : "INR"} / Shipment</td>
                                  {selectedContainerSizes.map(size => ( <td key={size} className="py-1 px-3 border"> <input type="number" placeholder="0" className="w-full bg-transparent border-none focus:outline-none text-right" value={item[size] || ""} onChange={(e) => handler(index, size, e.target.value)} /> </td> ))}
                                  <td className="py-1 px-3 border font-bold">{(selectedContainerSizes.reduce((a,c) => a + parseFloat(item[c]||0), 0)).toFixed(2)}</td>
                                  <td className="py-1 px-3 border">{item.remarks}</td>
                              </tr>
                          ))}
                          {sections[section] && (
                              <tr className="border">
                                  <td colSpan="2" className="font-bold py-1 px-3 border">Total {title}</td>
                                  <td className="py-1 px-3 border">INR</td>
                                  {selectedContainerSizes.map(size => <td key={size} className="py-1 px-3 border font-bold">{totals[size]?.toFixed(2)}</td>)}
                                  <td className="py-1 px-3 border font-bold">{totals.total?.toFixed(2)}</td>
                                  <td className="py-1 px-3 border"></td>
                              </tr>
                          )}
                      </React.Fragment>
                  ))}
                  <tr className="border">
                      <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Shipment Cost in INR (A + B + C)</td>
                      <td className="py-1 px-3 border"></td>
                      {selectedContainerSizes.map(size => <td key={size} className="py-1 px-3 border font-bold">{totalShipmentCost[size]?.toFixed(2)}</td>)}
                      <td className="py-1 px-3 border font-bold">{totalShipmentCost.total?.toFixed(2)}</td>
                      <td className="py-1 px-3 border"></td>
                  </tr>
                 <tr>
                  <td colSpan="2" className="py-1 px-3 border text-start">INCO Term</td>
                  <td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">{incoterms}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="py-1 px-3 border  text-start">Delivery Address</td>             
                  <td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left" dangerouslySetInnerHTML={{ __html: deliveryAddress }} />
                </tr>
                <tr>
                  <td colSpan="2" className="py-1 px-3 border text-start">FX Rate</td>
                  <td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">USD: <span className="font-bold text-red-500">{USD}</span> <span className="ml-4">EURO: <span className="font-bold text-red-500">{EUR}</span></span></td>
                </tr>
                <tr>
                  <td colSpan="2" className="py-1 px-3 border text-start">Required Transit Days:</td>
                  <td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">{transitDays}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="py-1 px-3 border text-start">Free Days Requirement at Destination:</td>
                  <td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left">{Free_Days}</td>
                </tr>
                <tr>
                  <td colSpan="2" className="py-1 px-3 border text-start">Remarks</td>
                  <td colSpan={selectedContainerSizes.length + 3} className="py-1 px-3 border text-left"> <input type="text" placeholder="..." className="w-full bg-transparent border-none focus:outline-none text-left" value={remarks} onChange={(e) => setRemarks(e.target.value)} /> </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center h-96 text-gray-400">
              <p>Please select a location and container size to view the quotation details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;