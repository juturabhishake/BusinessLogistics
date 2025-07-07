"use client";
import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";
import { FaFilePdf, FaFileExport } from "react-icons/fa";
import { Check, ChevronsUpDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";

const QuotationTable = () => {
  const [currentDateInfo, setCurrentDateInfo] = useState("");
  const [sections, setSections] = useState({
    origin: true,
    seaFreight: true,
    destination: true,
  });
  const [saveState, setSaveState] = useState("idle");
  const [originData, setOriginData] = useState(
    Array(6).fill({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" })
  );
  const [seaFreightData, setSeaFreightData] = useState(
    Array(2).fill({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" })
  );
  const [destinationData, setDestinationData] = useState(
    Array(6).fill({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" })
  );
  const [totals, setTotals] = useState({
    origin: { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 },
    seaFreight: { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 },
    destination: { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 },
  });
  const [open, setOpen] = React.useState(false)
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [USD, setUSD] = useState(0.00);
  const [EUR, setEUR] = useState(0.00);
  const [incoterms, setIncoterms] = useState("");
  const [transitDays, setTransitDays] = useState("");
  const [Commodity, setCommodity] = useState("");
  const [Dest_Port, setDest_Port] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [currency, setCurrency] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [Free_Days, setFree_Days] = useState(""); 
  const [Avg_Cont_Per_Mnth, setAvg_Cont_Per_Mnth] = useState(""); 
  const [HSN_Code, setHSN_Code] = useState(""); 
  const [Pref_Liners, setPref_Liners] = useState(""); 
  

  useEffect(() => {
    let flag = false
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    flag = (check_sc === 'admin')
    console.log("is admin : ", isAdmin, flag, check_sc)
    if(flag) {
      // secureLocalStorage.clear();
      window.location.href = "/";
    }
  }, []);
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/get_locations_venders' , {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ RFQType: 'LCL', sc: secureLocalStorage.getItem("sc") || "Unknown Supplier" }),
        });
        const data = await response.json();
        setLocations(data.result);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        const response = await fetch('/api/get_currency');
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          setUSD(parseFloat(data.result[0].USD));
          setEUR(parseFloat(data.result[0].EURO));
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
      }
    };

    fetchCurrency();
  }, []);

  useEffect(() => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 20); 
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); 
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    // const formattedDate = `${monthNames[currentMonth]} ${currentYear} - ${monthNames[currentMonth + 3]} ${currentYear}`;
    const formattedDate = `${monthNames[currentMonth]} ${currentYear}`;
    console.log(formattedDate);
    setCurrentDateInfo(formattedDate);
  }, []);

  const handleInputChange = (section, rowIndex, column, value) => {
    let updatedData;
  
    if (section === "origin") {
      updatedData = originData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [column]: value };
        }
        return row;
      });
      setOriginData(updatedData);
    } else if (section === "seaFreight") {
      updatedData = seaFreightData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [column]: value };
        }
        return row;
      });
      setSeaFreightData(updatedData);
    } else if (section === "destination") {
      updatedData = destinationData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [column]: value };
        }
        return row;
      });
      setDestinationData(updatedData);
    }
  
    const newTotals = {
      ...totals,
      [section]: updatedData.reduce(
        (acc, row) => {
          acc["1CBM"] += parseFloat(row["1CBM"] || 0);
          acc["2CBM"] += parseFloat(row["2CBM"] || 0);
          acc["3CBM"] += parseFloat(row["3CBM"] || 0);
          acc["4CBM"] += parseFloat(row["4CBM"] || 0);
          acc["5CBM"] += parseFloat(row["5CBM"] || 0);
          acc["6CBM"] += parseFloat(row["6CBM"] || 0);
          return acc;
        },
        { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 }
      ),
    };
    setTotals(newTotals);
  };   

  // const handleSave = () => {
  //   setSaveState("saving");
  //   setTimeout(() => {
  //     setSaveState("saved");
  //     setTimeout(() => {
  //       setSaveState("idle");
  //     }, 5000);
  //   }, 2000);
  // };
  const fetchLCLQuote = async (locCode) => {
    try {
      const response = await fetch('/api/get_LCL_QUOTE', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Loc_Code: locCode , sc: secureLocalStorage.getItem("sc") || "Unknown Supplier"}),
      });
  
      if (!response.ok) {
        throw new Error(`API call failed with status: ${response.status}`);
      }
  
      const data = await response.json();

      if (!data.result || !Array.isArray(data.result)) {
        throw new Error("Invalid API response format");
      }
  
     // if (data.result && data.result.length > 0) {
        const origin = Array(6).fill(null).map(() => ({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" }));
        const seaFreight = Array(2).fill(null).map(() => ({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" }));
        const destination = Array(6).fill(null).map(() => ({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" }));
  
        data.result.forEach((item) => {
          const cbmKey = `${item.CBM}CBM`;
          if (item.CBM <= 6) {
            if (origin[0]) origin[0][cbmKey] = item.O_CCD || "0";
            if (origin[1]) origin[1][cbmKey] = item.O_LTG || "0";
            if (origin[2]) origin[2][cbmKey] = item.O_THC || "0";
            if (origin[3]) origin[3][cbmKey] = item.O_BLC || "0";
            if (origin[4]) origin[4][cbmKey] = item.O_LUS || "0";
            if (origin[5]) origin[5][cbmKey] = item.O_CFS || "0";
  
            // if (item.CBM <= 2) {
            if (seaFreight[0]) seaFreight[0][cbmKey] = item.S_SeaFre || "0";
            if (seaFreight[1]) seaFreight[1][cbmKey] = item.S_FSC || "0";
            // }
  
            if (destination[0]) destination[0][cbmKey] = item.D_CUC || "0";
            if (destination[1]) destination[1][cbmKey] = item.D_CCF || "0";
            if (destination[2]) destination[2][cbmKey] = item.D_DOC || "0";
            if (destination[3]) destination[3][cbmKey] = item.D_AAI || "0";
            if (destination[4]) destination[4][cbmKey] = item.D_LU || "0";
            if (destination[5]) destination[5][cbmKey] = item.D_Del || "0";
          } 
          setRemarks(item.remarks || "");
        });
        setOriginData(origin);
        setSeaFreightData(seaFreight);
        setDestinationData(destination);
        
        console.log("Updated state data:", { originData, seaFreightData, destinationData });
      // } else {
      //   console.log("No LCL Quote data found for the selected location.");
      // }
    } catch (error) {
      console.error("Error fetching LCL Quote data:", error);
      alert(`Error fetching LCL Quote data: ${error.message}`);
    }
  };
  useEffect(() => {
    const calculateTotals = (data) => {
      return data.reduce(
        (acc, row) => {
          acc["1CBM"] += parseFloat(row["1CBM"] || 0);
          acc["2CBM"] += parseFloat(row["2CBM"] || 0);
          acc["3CBM"] += parseFloat(row["3CBM"] || 0);
          acc["4CBM"] += parseFloat(row["4CBM"] || 0);
          acc["5CBM"] += parseFloat(row["5CBM"] || 0);
          acc["6CBM"] += parseFloat(row["6CBM"] || 0);
          return acc;
        },
        { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 }
      );
    };
  
    setTotals({
      origin: calculateTotals(originData),
      seaFreight: calculateTotals(seaFreightData),
      destination: calculateTotals(destinationData),
    });
  }, [originData, seaFreightData, destinationData]);
  
  const saveQuote = async (cbm) => {
    const parseNumber = (value) => parseFloat(value) || 0;
  
    const createChargeObject = (charges, field) => charges.reduce((acc, charge, idx) => {
      acc[field[idx]] = parseNumber(charge[cbm]);
      return acc;
    }, {});
  
    const quoteData = {
      Supplier_Code: secureLocalStorage.getItem("sc") || "Unknown Supplier",
      Location_Code: selectedLocation,
      Quote_Month: new Date().getMonth() + 1,
      Quote_Year: new Date().getFullYear(),
      CBM: parseInt(cbm.replace("CBM", "")),
      O_CCD: parseNumber(originData[0][cbm]),
      O_LTG: parseNumber(originData[1][cbm]),
      O_THC: parseNumber(originData[2][cbm]),
      O_BLC: parseNumber(originData[3][cbm]),
      O_LUS: parseNumber(originData[4][cbm]),
      O_CFS: parseNumber(originData[5][cbm]),
      O_Total_Chg: totals.origin[cbm],
  
      S_SeaFre: parseNumber(seaFreightData[0][cbm]),
      S_FSC: parseNumber(seaFreightData[1][cbm]),
      S_Total_Chg: totals.seaFreight[cbm]*USD,
  
      D_CUC: parseNumber(destinationData[0][cbm]),
      D_CCF: parseNumber(destinationData[1][cbm]),
      D_DOC: parseNumber(destinationData[2][cbm]),
      D_AAI: parseNumber(destinationData[3][cbm]),
      D_LU: parseNumber(destinationData[4][cbm]),
      D_Del: parseNumber(destinationData[5][cbm]),
      D_Total_Chg: totals.destination[cbm]*(currency === "EURO" ? EUR : USD),
  
      Total_Ship_Cost: totalShipmentCost[cbm],
      Created_By: secureLocalStorage.getItem("un") || "Unknown",
      remarks: remarks || "",
    };
  
    try {
      console.log(`Saving quote for ${cbm}:`, quoteData);
      const response = await fetch("/api/saveLCLQuote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save quote for ${cbm}`);
      }
  
      console.log(`Quote for ${cbm} saved successfully.`);
    } catch (error) {
      console.error(`Error saving quote for ${cbm}:`, error);
      alert(`Error saving quote for ${cbm}`);
    }
  };
  const handleSave = async () => {
    if (!selectedLocation) {
      alert("Please select a location before saving.");
      return;
    }
    if(incoterms==='DAP') {
      console.log("incoterms : " , incoterms==='DAP');
      if(totalShipmentCost["1CBM"] > 0 && totalDestinationCostInINR["1CBM"] <= 0) {
        alert("Required Destination charges or DAP");
        return;
      }
      if(totalShipmentCost["2CBM"] > 0 && totalDestinationCostInINR["2CBM"] <= 0) {
        alert("Required Destination charges or DAP");
        return;
      }
      if(totalShipmentCost["3CBM"] > 0 && totalDestinationCostInINR["3CBM"] <= 0) {
        alert("Required Destination charges or DAP");
        return;
      }
      if(totalShipmentCost["4CBM"] > 0 && totalDestinationCostInINR["4CBM"] <= 0) {
        alert("Required Destination charges or DAP");
        return;
      }
      if(totalShipmentCost["5CBM"] > 0 && totalDestinationCostInINR["5CBM"] <= 0) {
        alert("Required Destination charges or DAP");
        return;
      }
      if(totalShipmentCost["6CBM"] > 0 && totalDestinationCostInINR["6CBM"] <= 0) {
        alert("Required Destination charges or DAP");
        return;
      }
    
    }

    setSaveState("saving");
  
    try {
      for (let i = 1; i <= 6; i++) {
        await saveQuote(`${i}CBM`);
      }
  
      setSaveState("saved");
  
      setTimeout(() => {
        setSaveState("idle");
      }, 5000);
    } catch (error) {
      console.error("Error saving quotes:", error);
      alert("Error saving quotes. Please try again.");
      setSaveState("idle");
    }
  };
  

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const totalShipmentCost = {
    "1CBM": (totals.origin["1CBM"] + totals.seaFreight["1CBM"]*USD + totals.destination["1CBM"]*(currency === "EURO" ? EUR : USD)).toFixed(2),
    "2CBM": (totals.origin["2CBM"] + totals.seaFreight["2CBM"]*USD + totals.destination["2CBM"]*(currency === "EURO" ? EUR : USD)).toFixed(2),
    "3CBM": (totals.origin["3CBM"] + totals.seaFreight["3CBM"]*USD + totals.destination["3CBM"]*(currency === "EURO" ? EUR : USD)).toFixed(2),
    "4CBM": (totals.origin["4CBM"] + totals.seaFreight["4CBM"]*USD + totals.destination["4CBM"]*(currency === "EURO" ? EUR : USD)).toFixed(2),
    "5CBM": (totals.origin["5CBM"] + totals.seaFreight["5CBM"]*USD + totals.destination["5CBM"]*(currency === "EURO" ? EUR : USD)).toFixed(2),
    "6CBM": (totals.origin["6CBM"] + totals.seaFreight["6CBM"]*USD + totals.destination["6CBM"]*(currency === "EURO" ? EUR : USD)).toFixed(2),
  };
  const fetchSupplierDetails = async (locCode) => {
    try {
      const response = await fetch('/api/GET_Supplier_LOC_details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Loc_Code: locCode }),
      });
      const data = await response.json();
      if (data.result && data.result.length > 0) {
        setIncoterms(data.result[0].Incoterms);
        setTransitDays(data.result[0].Transit_Days);
        setCommodity(data.result[0].Commodity);
        setDeliveryAddress(data.result[0].Delivery_Address);
        setDest_Port(data.result[0].Dest_Port);
        setCurrency(data.result[0].Currency);
        setFree_Days(data.result[0].Free_Days);
        setPref_Liners(data.result[0].Pref_Liners);
        setAvg_Cont_Per_Mnth(data.result[0].Avg_Cont_Per_Mnth);
        setHSN_Code(data.result[0].HSN_Code);
        console.log("Supplier details fetched successfully:", data.result[0]);
      }
    } catch (error) {
      console.error("Error fetching supplier details:", error);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchSupplierDetails(selectedLocation);
      fetchLCLQuote(selectedLocation);
    }
  }, [selectedLocation]);
  
  const totalDestinationCostInINR = {  

    "1CBM": (totals.destination["1CBM"] * (currency === "EURO" ? EUR : USD)).toFixed(2),
    "2CBM": (totals.destination["2CBM"] * (currency === "EURO" ? EUR : USD)).toFixed(2),
    "3CBM": (totals.destination["3CBM"] * (currency === "EURO" ? EUR : USD)).toFixed(2),
    "4CBM": (totals.destination["4CBM"] * (currency === "EURO" ? EUR : USD)).toFixed(2),
    "5CBM": (totals.destination["5CBM"] * (currency === "EURO" ? EUR : USD)).toFixed(2),
    "6CBM": (totals.destination["6CBM"] * (currency === "EURO" ? EUR : USD)).toFixed(2),
  };
  

  const totalSeaFreightCostInINR = {
    "1CBM": (totals.seaFreight["1CBM"] * USD).toFixed(2),
    "2CBM": (totals.seaFreight["2CBM"] * USD).toFixed(2),
    "3CBM": (totals.seaFreight["3CBM"] * USD).toFixed(2),
    "4CBM": (totals.seaFreight["4CBM"] * USD).toFixed(2),
    "5CBM": (totals.seaFreight["5CBM"] * USD).toFixed(2),
    "6CBM": (totals.seaFreight["6CBM"] * USD).toFixed(2),
  };
  const downloadPDF = () => {
    window.location.href = "/prints/export/LCL";
  };
  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
      <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Comparitive Statement of quotations</h2>
              <p className="text-xs text-gray-100">"RFQ Export rates for {currentDateInfo}"</p>
              <p className="text-xs text-gray-100">We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"</p>
            </div>
            <div className="flex flex-col items-center justify-start lg:flex-row justify-end gap-4">
              <div className="flex flex-row items-center justify-between lg:flex-row justify-end">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button role="combobox" aria-expanded={open} variant="outline" className="mt-1 mb-1 bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] px-3 py-1 rounded" style={{ minWidth: "80px", fontSize:"12px" }}>
                      {selectedLocation ? locations.find(loc => loc.Location_Code === selectedLocation).Location_Name : "Select Location..."}
                      <ChevronsUpDown className="opacity-50" />
                    </Button> 
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search location..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                          {locations.map((location) => (
                            <CommandItem
                              key={location.Location_Code}
                              value={location.Location_Code}
                              onSelect={(currentValue) => {
                                setSelectedLocation(currentValue === selectedLocation ? "" : currentValue);
                                setLocationName(currentValue === selectedLocation ? "" : location.Location_Name);
                                setOpen(false);
                              }}
                            >
                              {location.Location_Name}
                              <Check
                                className={cn(
                                  "ml-auto",
                                  selectedLocation === location.Location_Code ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="mt-0 lg:mt-0 flex items-center justify-center bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] text-sm px-3 py-3 rounded"
                  style={{ minWidth: "80px" }}
                >
                  {saveState === "idle" && <FiSave size={16} />}
                  {saveState === "saving" && <FiLoader size={16} className="animate-spin" />}
                  {saveState === "saved" && <FiCheck size={16} />}
                </button>
                <Button onClick={downloadPDF} variant="outline" className="flex items-center px-4 py-2 bg-green-500 text-white rounded">
                  <FaFileExport className="" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs">
            <thead className="bg-[var(--bgBody3)] text-[var(--buttonHover)] border border-[var(--bgBody)]">
              <tr>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] w-[240px] text-orange-500 ">Sea Freight Export LCL</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] w-[130px]">Forwarders</th>
                <th colSpan="6" className="py-1 px-2 border border-[var(--bgBody)]">Quote for GTI to {locationName || "{Select Location}"} LCL shipment</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[120px]">1 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[120px]">2 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[120px]">3 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[120px]">4 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[120px]">5 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[120px]">6 CBM</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody3)]">
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("origin")}
              >
                <td>A</td>
                <td colSpan="9" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} Origin Charges
                </td>
              </tr>
              {sections.origin &&
                ["Customs Clearance & Documentation", "Local Transportation From GTI-Chennai", "Terminal Handling Charges - Origin", "Bill of Lading Charges", "Loading/Unloading / SSR", "CFS Charges"].map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    {[...Array(6)].map((_, i) => {
                       const isCFS = item === "CFS Charges";
                       return (
                      <td key={i} className="py-1 px-3 border">
                        <input value={originData[index][`${i + 1}CBM`]}  readOnly={isCFS} onChange={(e) => handleInputChange("origin", index, (i + 1) + "CBM", e.target.value)} type="number" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                      </td>
                       )
})}
                    <td className="py-1 px-3 border text-left">{item === "CFS Charges" ? "AT ACTUAL" : ""}</td>
                  </tr>
                ))}
              {sections.origin && (
                <tr className="border font-bold">
                   <td className="py-1 px-3 border"></td>
                   <td className="py-1 px-3 border">Total Origin Cost</td>
                   <td className="py-1 px-3 border">INR</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input value={totals.origin[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"><input  type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("seaFreight")}
              >
                <td>B</td>
                <td colSpan="9" className="py-2 px-3 text-start flex items-center">
                  {sections.seaFreight ? "▼" : "▶"} Sea Freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                ["Sea Freight", "FSC (Fuel Surcharge)"].map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 7}</td>
                    <td className="py-1 px-3 border text-start">{item}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="py-1 px-3 border">
                        <input value={seaFreightData[index][`${i + 1}CBM`]} type="number" onChange={(e) => handleInputChange("seaFreight", index, (i + 1) + "CBM", e.target.value)} className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                      </td>
                    ))}
                    <td className="py-1 px-3 border"></td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border font-bold">                
                  <td className="py-1 px-3 border"></td>
                   <td className="py-1 px-3 border">Total Sea Freight Cost</td>
                   <td className="py-1 px-3 border">INR</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input value={totalSeaFreightCostInINR[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  {/* <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td> */}
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("destination")}
              >
                <td>C</td>
                <td colSpan="9" className="py-2 px-3 text-start flex items-center">
                  {sections.destination ? "▼" : "▶"} Destination Charges
                </td>
              </tr>
              {sections.destination &&
                ["Custom Clearance", "CC Fee", "D.O Charges per BL", "AAI Charges", "Loading/Unloading", "Delivery"].map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 9}</td>
                    <td className="py-1 px-3 border text-start">{item}</td>
                    <td className="py-1 px-3 border">{currency} / Shipment</td>
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="py-1 px-3 border">
                        <input value={destinationData[index][`${i + 1}CBM`]} type="number" onChange={(e) => handleInputChange("destination", index, (i + 1) + "CBM", e.target.value)} className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                      </td>
                    ))}
                    {/* <td className="py-1 px-3 border"><input type="text" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td> */}
                    <td className="py-1 px-3 border"></td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border font-bold">
                   <td className="py-1 px-3 border"></td>
                   <td className="py-1 px-3 border">Total Destination Cost</td>
                   <td className="py-1 px-3 border">INR</td>                
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input value={totalDestinationCostInINR[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border font-bold">
                <td colSpan="3" className="py-1 px-3 border text-start">Total Shipment Cost in INR (A+B+C)</td>
                {[...Array(6)].map((_, i) => (
                  <td key={i} className="py-1 px-3 border">
                    <input value={totalShipmentCost[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                  </td>
                ))}
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">INCO Term:</td>
                <td colSpan="7" className="py-1 px-3 border text-left">{incoterms}</td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Delivery Address:</td>                
                <td colSpan="7" className="py-1 px-3 border text-left" dangerouslySetInnerHTML={{ __html: deliveryAddress }} />
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">FX Rate:</td>
                <td className="py-1 px-3 border">USD</td>
                <td className="py-1 px-3 border font-bold text-red-500 text-left">{USD}</td>
                <td className="py-1 px-3 border">EURO</td>
                <td colSpan="4" className="py-1 px-3 border font-bold text-red-500 text-left">{EUR}</td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Required Transit Days:</td>
                <td colSpan="2" className="py-1 px-3 border text-left">{transitDays}</td>
                <td colSpan="2" className="py-1 px-3 border text-start">Free Days Requirement at Destination :</td>
                <td colSpan="3" className="py-1 px-3 border text-left">{Free_Days}</td>
              </tr>
              {/* <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Estimated Transit Days Given by Forwarder:</td>
                <td colSpan="7" className="py-1 px-3 border"></td>
              </tr> */}
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Destination Port:</td>
                <td colSpan="2" className="py-1 px-3 border text-left">{Dest_Port}</td>
                <td colSpan="2" className="py-1 px-3 border text-start">Preffered Liners :</td>
                <td colSpan="3" className="py-1 px-3 border text-left">{Pref_Liners}</td>
              </tr>
              <tr>
                <td colSpan="3" className="py-1 px-3 border text-start">HSN Code :</td>
                <td colSpan="2" className="py-1 px-3 border text-left">{HSN_Code}</td>
                <td colSpan="2" className="py-1 px-3 border text-start">Avg Container Requirement / Month :</td>
                <td colSpan="3" className="py-1 px-3 border text-left">{Avg_Cont_Per_Mnth}</td>
              </tr>
              <tr>
                <td colSpan="3" className="py-1 px-3 border text-start">Remarks :</td>
              <td colSpan="7" className="py-1 px-3 border text-left">
                    <input
                        type="text"
                        placeholder="..."                       
                        className="w-full bg-transparent border-none focus:outline-none text-left hover:border-gray-400"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                      />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;