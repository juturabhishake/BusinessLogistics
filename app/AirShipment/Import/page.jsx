"use client";
import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";
import { FaFilePdf, FaFileExport, FaFilePdf as FaFilePdfIcon } from "react-icons/fa";
import { Check, ChevronsUpDown } from "lucide-react";
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
    destination: true ,
  });
  const [saveState, setSaveState] = useState("idle");  
  
  const [originCharges, setOriginCharges] = useState([
    { description: "Pickup", 20: "", remarks: "" },
    { description: "Custom Clearance", 20: "", remarks: "" },
    { description: "Handling / DO/ ", 20: "", remarks: "" },
    { description: "Terminal Handling Charge", 20: "", remarks: "" },
    { description: "Documentation ", 20: "", remarks: "" },
  ]);
  
  const [seaFreightCharges, setSeaFreightCharges] = useState([
    { description: "AIR freight", 20: "", remarks: "" },
    { description: "FSC (Fuel Surcharges)", 20: "", remarks: "" },
    { description: "SSC (Security Sucharge)", 20: "", remarks: "" },
    { description: "ISS Surcharge", 20: "", remarks: "" },
    { description: "X-Ray", 20: "", remarks: "" },
    { description: "AAI CHARGES", 20: "", remarks: "" },
  ]);
  
  const [destinationCharges, setDestinationCharges] = useState([
    { description: "Customs Clearence", 20: "", remarks: "" },
    { description: "CC Fee", 20: "", remarks: "" },
    { description: "D.O Charges", 20: "", remarks: "" },
    { description: "LINER CHARGES", 20: "", remarks: "" },
    { description: "Loading / Unloading", 20: "", remarks: "" },
    { description: "Delivery", 20: "", remarks: "" },
    // { description: "LOLO Charges", 20: "", remarks: "" },
  ]);
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
  const [uploadedPdfPath, setUploadedPdfPath] = useState('');
  const [weight, setWeight] = useState("");
  const [containerSize, setContainerSize] = useState("N/A");
  const [quoteDate, setquoteDate] = useState("");
  const [quoteTime, setquoteTime] = useState("");
  const [cmmQ, setcmmQ] = useState("");
  const [Request_Id, setRequest_Id] = useState(0); 
  

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
        const response = await fetch('/api/get_locations_Adhoc_Air' , {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Shipment_Type: 'Air',Transport_Type: 'import'   }),
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
          // setUSD(parseFloat(data.result[0].USD));
          // setEUR(parseFloat(data.result[0].EURO));
          console.log("OLD API USD and EURO values:", USD, EUR);
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
    console.log(formattedDate, currentDate);
    setCurrentDateInfo(formattedDate);
  }, []);
  const fetchQuotationData = async (locationCode) => {
    try {
      const response = await fetch("/api/Air/get/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Loc_Code: locationCode, sc: secureLocalStorage.getItem("sc") || "Unknown Supplier", }),
      });

      const data = await response.json();    
      console.log("Quotation ADOC Data:", data);
      if (data.result && data.result.length > 0) {
        const updatedOriginCharges = [...originCharges];
        const updatedSeaFreightCharges = [...seaFreightCharges];
        const updatedDestinationCharges = [...destinationCharges];
        
        // const fcl20 = data.result.find((item) => item.Cont_Feet === 20) || {};

        updatedOriginCharges[0][20] = data.result[0].O_PU || "";
        updatedOriginCharges[1][20] = data.result[0].O_CC || "";
        updatedOriginCharges[2][20] = data.result[0].O_HDO || "";
        updatedOriginCharges[3][20] = data.result[0].O_THC || "";
        updatedOriginCharges[4][20] = data.result[0].O_DOC || "";

        updatedSeaFreightCharges[0][20] = data.result[0].S_AirFre || "";
        updatedSeaFreightCharges[1][20] = data.result[0].S_FSC || "";
        updatedSeaFreightCharges[2][20] = data.result[0].S_SSC || "";
        updatedSeaFreightCharges[3][20] = data.result[0].S_ISS || "";
        updatedSeaFreightCharges[4][20] = data.result[0].S_Xray || "";
        updatedSeaFreightCharges[5][20] = data.result[0].S_AAI || "";


        updatedDestinationCharges[0][20] = data.result[0].D_CC || "";
        updatedDestinationCharges[1][20] = data.result[0].D_CCF || "";
        updatedDestinationCharges[2][20] = data.result[0].D_DOC || "";
        updatedDestinationCharges[3][20] = data.result[0].D_LC || "";
        updatedDestinationCharges[4][20] = data.result[0].D_LU || "";
        updatedDestinationCharges[5][20] = data.result[0].D_DEL || "";

        setRemarks(data.result[0].remarks || "");

        setOriginCharges(updatedOriginCharges);
        setSeaFreightCharges(updatedSeaFreightCharges);
        setDestinationCharges(updatedDestinationCharges);
      } else {
        setOriginCharges(originCharges.map((item) => ({ ...item, 20: "" })));
        setSeaFreightCharges(seaFreightCharges.map((item) => ({ ...item, 20: "" })));
        setDestinationCharges(destinationCharges.map((item) => ({ ...item, 20: "" })));
      }
    } catch (error) {
      console.error("Error fetching quotation data:", error);
    }
  };

  // const handleSave = () => {
  //   setSaveState("saving");
    // setTimeout(() => {
    //   setSaveState("saved");
    //   setTimeout(() => {
    //     setSaveState("idle");
    //   }, 5000);
    // }, 2000);
  // };
  const saveQuote = async (containerSize) => {

    const filterCharges = (charges) =>
      charges.map((charge) => ({
        description: charge.description,
        [containerSize]: charge[containerSize],
        remarks: charge.remarks,
      }));
  
    const quoteData = {
      supplierCode: secureLocalStorage.getItem("sc") || "Unknown Supplier",
      locationCode: selectedLocation,
      quoteMonth: new Date().getMonth() + 1,
      quoteYear: new Date().getFullYear(),
      quote_Date: quoteDate,
      cbm:cmmQ,
      originData: filterCharges(originCharges),
      seaFreightData: filterCharges(seaFreightCharges),
      destinationData: filterCharges(destinationCharges),
      totalShipmentCost: totalShipmentCost,
      totalOrigin: totalOrigin,
      totalSeaFreight: totalSeaFreight,
      totalDestination: totalDestination,
      createdBy: secureLocalStorage.getItem("un") || "Unknown",
      remarks: remarks || "",
       Request_Id:Request_Id,
    };
    console.log("Quote Data:", quoteData);
    try {
      console.log(`Saving quote : `, quoteData);
      const response = await fetch("/api/Air/save/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save quote`);
      }
      console.log(`Quote saved successfully.`);
    } catch (error) {
      console.error(`Error saving quote :`, error);
    //   alert(`Error saving quote`);
    }
  };
  const handleSave = async () => {
    if (!selectedLocation) {
      alert("Please select a location before saving.");
      return;
    }

    if(incoterms==='DAP') {
      console.log("incoterms : " , incoterms==='DAP');
      if(totalShipmentCost[20] > 0 && totalDestination[20] <= 0) {
        alert("Required Destination charges or DAP");
        return;
      }
      // if(totalShipmentCost[40] > 0 && totalDestination[40] <= 0) {
      //   alert("Required Destination charges or DAP");
      //   return;
      // }
      // if((totalShipmentCost[20] > 0 && totalShipmentCost[40] > 0) && (totalDestination[20] <= 0 || totalDestination[40] <= 0)) {
      //   alert("Destination charges are not available for DAP incoterms");
      //   return;
      // }
    }
    if(incoterms==='CIF') {
      console.log("incoterms : " , incoterms==='DAP');
      if(totalShipmentCost[20] > 0 && totalDestination[20] > 0) {
        alert("Destination charges are not allowed for CIF");
        return;
      }
      // if(totalShipmentCost[40] > 0 && totalDestination[40] > 0) {
      //   alert("Destination charges are not allowed for CIF");
      //   return;
      // }
    } 
  
  
    setSaveState("saving");
  
    try {
      await saveQuote(20);
  
      setSaveState("saved");
      setTimeout(() => {
        setSaveState("idle");
      }, 5000);
    } catch (error) {
      setSaveState("idle");
    }
  };
  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const handleInputChange = (setStateFunction, index, field, value) => {
    setStateFunction(prevCharges => {
      const updatedCharges = [...prevCharges];
      updatedCharges[index] = {
        ...updatedCharges[index],
        [field]: value === "" ? 0 : parseFloat(value), 
      };
      return updatedCharges;
    });
  };
  
  const handleOriginChange = (index, field, value) => handleInputChange(setOriginCharges, index, field, value);
  const handleSeaFreightChange = (index, field, value) => handleInputChange(setSeaFreightCharges, index, field, value);
  const handleDestinationChange = (index, field, value) => handleInputChange(setDestinationCharges, index, field, value);
  

  const calculateTotal = (charges) => {
    return charges.reduce(
      (acc, charge) => {
        acc[20] += parseFloat(charge[20] || 0);
        // acc[40] += parseFloat(charge[40] || 0);
        return acc;
      },
      { 20: 0 }
    );
  };
  const calculateUSDTotal = (charges) => {
    return charges.reduce(
      (acc, charge) => {       
        acc[20] += parseFloat(charge[20]*(currency === "EURO" ? EUR : USD) || 0);
        // acc[40] += parseFloat(charge[40]*(currency === "EURO" ? EUR : USD) || 0);
        return acc;
      },
      { 20: 0 }
    );
  };

  const calculateShipUSDTotal = (charges) => {
    return charges.reduce(
      (acc, charge) => {       
        acc[20] += parseFloat((charge[20]*(currency === "EURO" ? EUR : USD))*weight || 0);
        // acc[40] += parseFloat(charge[40]*USD || 0);
        return acc;
      },
      { 20: 0}
    );
  };

  const totalOrigin = calculateUSDTotal(originCharges);
  const totalSeaFreight = calculateShipUSDTotal(seaFreightCharges);
  const totalDestination = calculateTotal(destinationCharges);

  const totalShipmentCost = {
    20: (totalOrigin[20] + totalSeaFreight[20] + totalDestination[20]).toFixed(2),
    // 40: (totalOrigin[40] + totalSeaFreight[40] + totalDestination[40]).toFixed(2),
  };
  const fetchSupplierDetails = async (locCode) => {
      try {
        const response = await fetch('/api/Get_Terms_Adhoc_AIR', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ Shipment_Type: 'Air',Transport_Type: 'import',Loc_Code: locCode }),
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
          setRemarks(data.result[0].Remarks || "");
          setUSD(parseFloat(data.result[0].USD));
          setEUR(parseFloat(data.result[0].EURO));
          setUploadedPdfPath(data.result[0].UploadedPDF || "");
          setContainerSize(data.result[0].Container_Size || "N/A");
          setWeight(parseFloat(data.result[0].Weight) || "");
          setquoteDate(data.result[0].Request_Date);
          setquoteTime("11:00 AM");
          setcmmQ(data.result[0].Container_Size);
          setRequest_Id(data.result[0].Request_Id);
          console.log("Supplier details fetched successfully:", data.result[0]);
        }
      } catch (error) {
        console.error("Error fetching supplier details:", error);
      }
    };
  
    useEffect(() => {
      setIncoterms("");
        setTransitDays("");
        setCommodity("");
        setDeliveryAddress("");
        setDest_Port("");
        setCurrency("");
        setFree_Days("");
        setPref_Liners("");
        setAvg_Cont_Per_Mnth("");
        setHSN_Code("");
        setUSD(0);
        setEUR(0);
        setRemarks("");
        setUploadedPdfPath('');
        setContainerSize("N/A");
        setWeight("");
        setcmmQ("");       
        setquoteDate("");
        setRequest_Id(0);
        setquoteTime("");
      if (selectedLocation) {
        fetchSupplierDetails(selectedLocation);
        fetchQuotationData(selectedLocation);
      }
    }, [selectedLocation]);

  const downloadPDF = () => {
    window.location.href = "/prints/air/import";
  };
  
  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
      <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Comparitive Statement of quotations </h2>
              <p className="text-xs text-gray-100">"Air shipment Import"</p>
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
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] text-orange-500 ">Mode of Transport : Air {" "} <span className="text-red-500">
    ( {quoteDate
                      ? new Date(quoteDate).toLocaleDateString(
                          "en-GB"
                        )
                      : ""} {quoteTime})
  </span></th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency in</th>
                <th colSpan="1" className="py-1 px-2 border border-[var(--bgBody)]">Quote for  {locationName || "{select location}"} to GTI shipment</th>
                <th rowSpan="2" colSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                <th className="py-1 px-2 border border-[var(--bgBody)]">{containerSize || "N/A"}</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody3)]">
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("origin")}
              >
                <td>A.</td>
                <td colSpan="5" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} EX Works Charges
                </td>
              </tr>
            
              {sections.origin &&
                originCharges
                .filter((item) => item.description !== "Halting")
                .map((item, index) => {
                  const isHalting = item.description === "Halting";
                  return (
                  <tr key={index} className="border border border-[var(--bgBody)]">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">{currency} / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0" 
                        readOnly={isHalting}                      
                        className="w-full bg-transparent border-none focus:outline-none text-right hover:border-gray-400"
                        value={item[20]}
                        onChange={(e) => handleOriginChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td colSpan="2" className="py-1 px-3 border">
                    {item.remarks}
                      {/* <input
                        type="text"
                        readOnly={isHalting}
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleOriginChange(index, "remarks", e.target.value)}
                      /> */}
                    </td>
                  </tr>
                  );
              })}
              {sections.origin && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total EX Works Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  <td colSpan="2" className="py-1 px-3 border">{totalOrigin[20].toFixed(2)}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("seaFreight")}
              >
                <td>B.</td>
                <td colSpan="5" className="py-2 px-3 text-start flex items-center">
                  {sections.seaFreight ? "▼" : "▶"} AIR freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                seaFreightCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 6}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">{currency} / Per KG</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[20]}
                        onChange={(e) => handleSeaFreightChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td colSpan="2" className="py-1 px-3 border">
                      {item.remarks}
                      {/* <input
                        type="text"
                        readOnly
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleSeaFreightChange(index, "remarks", e.target.value)}
                      /> */}
                    </td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Air Freight Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  <td colSpan="2" className="py-1 px-3 border">{totalSeaFreight[20].toFixed(2)}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("destination")}
              >
                <td>C.</td>
                <td colSpan="5" className="py-2 px-3 text-start flex items-center">
                  {sections.destination ? "▼" : "▶"} Destination Charges
                </td>
              </tr>
              {sections.destination &&
                destinationCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 12}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[20]}
                        onChange={(e) => handleDestinationChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td colSpan="2" className="py-1 px-3 border">
                    {item.remarks}
                      {/* <input
                        type="text"
                        readOnly
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleDestinationChange(index, "remarks", e.target.value)}
                      /> */}
                    </td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Destination Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  <td colSpan="2" className="py-1 px-3 border">{totalDestination[20].toFixed(2)}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border">
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Cost in INR (A + B + C)</td>
                <td className="py-1 px-3 border"></td>
                <td colSpan="2" className="py-1 px-3 border">{totalShipmentCost[20]}</td>
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">INCO Term</td>
                <td colSpan="4" className="py-1 px-3 border text-left">{incoterms}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Location</td>
                <td colSpan="4" className="py-1 px-3 border text-left">{locationName}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border  text-start">Pickup Location</td>             
                <td colSpan="4" className="py-1 px-3 border text-left" dangerouslySetInnerHTML={{ __html: deliveryAddress }} />
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">FX Rate</td>
                <td className="py-1 px-3 border">USD</td>
                <td className="py-1 px-3 border font-bold text-red-500 text-left">{USD}</td>
                <td className="py-1 px-3 border">EURO</td>
                <td className="py-1 px-3 border font-bold text-red-500 text-left">{EUR}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Required Transit Days :</td>
                <td colSpan="1" className="py-1 px-3 border text-left">{transitDays}</td>
                <td colSpan="1" className="py-1 px-3 border text-start"></td>
                <td colSpan="2" className="py-1 px-3 border text-left"></td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Weight of cargo in kgs : </td>
              <td colSpan="4" className="py-1 px-3 border text-left">{weight}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Total Cost :</td>
                <td colSpan="4" className="py-1 px-3 border text-left">{totalShipmentCost[20]}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Payment Terms :</td>
                <td colSpan="4" className="py-1 px-3 border text-left">Monthly Basis</td>
              </tr>
             
           
             <tr>
              <td colSpan="2" className="py-1 px-3 border text-start">Upload PDF</td>
              <td colSpan="4" className="py-1 px-3 border text-left">
                {uploadedPdfPath ? 
                <a href={uploadedPdfPath} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      <FaFilePdfIcon />
                      {uploadedPdfPath.split('/').pop()}
                    </a>
                :<span>No PDF Uploaded</span>
                }
              </td>
            </tr>
              {/* <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">HSN Code :</td>
                <td colSpan="1" className="py-1 px-3 border text-left">{HSN_Code}</td>
                <td colSpan="1" className="py-1 px-3 border text-start">Average Container Requirement / Month :</td>
                <td colSpan="2" className="py-1 px-3 border text-left">{Avg_Cont_Per_Mnth}</td>
              </tr> */}
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Remarks</td>
                <td colSpan="4" className="py-1 px-3 border text-left">
                   {remarks}
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