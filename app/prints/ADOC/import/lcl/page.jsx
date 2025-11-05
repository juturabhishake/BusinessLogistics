"use client";
import React, { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";
import { FaFilePdf, FaFilePdf as FaFilePdfIcon } from "react-icons/fa";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

const QuotationTable = () => {
  const [currentDateInfo, setCurrentDateInfo] = useState("");
  const [sections, setSections] = useState({
    origin: true,
    seaFreight: true,
    destination: true ,
  });
  const [saveState, setSaveState] = useState("idle");  
  
  const [originCharges, setOriginCharges] = useState([
      { description: "Customs Clearance & Documentation", 20: "", remarks: "" },
      { description: "Local Transportation From Shipper -port", 20: "", remarks: "Per BL" },
      { description: "Terminal Handling Charges", 20: "", remarks: "" },
      { description: "Bill of Lading Charges", 20: "", remarks: "" },
      { description: "Loading/Unloading / SSR", 20: "", remarks: "" },
      // { description: "Delivery", 20: "", remarks: "" },
    ]);
  
    const [seaFreightCharges, setSeaFreightCharges] = useState([
      { description: "Sea Freight", 20: "", remarks: "" },
      { description: "FSC (Fuel Surcharge)", 20: "", remarks: "" },
      { description: "SSC (Security Surcharge))", 20: "", remarks: "" },
    ]);
    
    const [destinationCharges, setDestinationCharges] = useState([
      { description: "Custom Clearance", 20: "", remarks: "Per Shipment" },
      { description: "CC Fee", 20: "", remarks: "Per Shipment" },
      { description: "D.O Charges per BL", 20: "", remarks: "Per Shipment" },
      { description: "CFS Charges", 20: "", remarks: "Per BL" },
      { description: "Loading/Unloading", 20: "", remarks: "Per Shipment" },
      { description: "Delivery", 20: "", remarks: "If any" },
      // { description: "CFS Charges", 20: "", remarks: "At Actual" },
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
  const [selectedDate, setSelectedDate] = useState(); 
  const [uploadedPdfPath, setUploadedPdfPath] = useState('');
  const [weight, setWeight] = useState("");
  const [containerSize, setContainerSize] = useState("N/A");

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
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); 
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      
      const formattedDate = `${monthNames[currentMonth]} ${currentYear}`;
      setCurrentDateInfo(formattedDate);
    }, []);
  useEffect(() => {
      const fetchLatestMonthYear = async () => {
        try {
          const response = await fetch("/api/get_latest_month_year");
    
          const result = await response.json();
          if (result.result && result.result.length > 0) {
            const { latest_month, latest_year } = result.result[0];
            if (latest_month && latest_year) {
              setSelectedDate(dayjs(`${latest_year}-${latest_month}-01`));
            } else {
              setSelectedDate(dayjs());
            }
          } else {
            setSelectedDate(dayjs());
          }
        } catch (error) {
          console.error("Error fetching latest month and year:", error);
          setSelectedDate(dayjs());
        }
      };
    
      fetchLatestMonthYear();
    }, []);
  useEffect(() => {
        const fetchLocations = async () => {
          if (!selectedDate) return;
          try {
           const selectedMonth = dayjs(selectedDate).month() + 1;
           const selectedYear = dayjs(selectedDate).year();
           const response = await fetch('/api/get_locations_Adhoc_Air_Print' , {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ Shipment_Type: 'ADOCLCL',Transport_Type: 'import'   ,Month_No:selectedMonth ,Year_No: selectedYear  }),
            });
            const data = await response.json();
            setLocations(data.result);
            setSelectedLocation("");
            setLocationName("");
            setContainerSize("");
            // setContainerSize([]);
          } catch (error) {
            console.error("Error fetching locations:", error);
          }
        };
    
        fetchLocations();
      }, [selectedDate]);

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
      console.log("fetching Data...");
      console.log("Location code:", locationCode);
      console.log("sc", secureLocalStorage.getItem("sc"));
      console.log("month and year", selectedDate);
      const selectedMonth = dayjs(selectedDate).month() + 1;
      const selectedYear = dayjs(selectedDate).year();
      const response = await fetch("/api/userPrints/ADOC_Import_LCL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loc_code: locationCode,
          sc: secureLocalStorage.getItem("sc") || "Unknown Supplier",
          quote_month: selectedMonth,
          quote_year: selectedYear,
        }),
      });
      const data = await response.json(); 
      console.log("Fetched data:", data);   
      if (data && data.length > 0) {
        console.log("Usestates updating...");
        const updatedOriginCharges = [...originCharges];
        const updatedSeaFreightCharges = [...seaFreightCharges];
        const updatedDestinationCharges = [...destinationCharges];
        
        // const fcl20 = data.find((item) => item.Cont_Feet === 20) || {};
        // const fcl40 = data.find((item) => item.Cont_Feet === 40) || {};

        updatedOriginCharges[0][20] = data[0].D_CCD || "";
        updatedOriginCharges[1][20] = data[0].D_LTS || "";
        updatedOriginCharges[2][20] = data[0].D_THC || "";
        updatedOriginCharges[3][20] = data[0].D_BLC || "";
        updatedOriginCharges[4][20] = data[0].D_LUS || "";
        // updatedOriginCharges[5][20] = data[0].O_Halt || "";

        updatedSeaFreightCharges[0][20] = data[0].S_SeaFre || "";
        updatedSeaFreightCharges[1][20] = data[0].S_FSC || "";
        updatedSeaFreightCharges[2][20] = data[0].S_SSC || "";
        // updatedSeaFreightCharges[3][20] = data[0].S_ITT || "";

        updatedDestinationCharges[0][20] = data[0].O_CC || "";
        updatedDestinationCharges[1][20] = data[0].O_CCF || "";
        updatedDestinationCharges[2][20] = data[0].O_DOC || "";
        updatedDestinationCharges[3][20] = data[0].O_CFS || "";
        updatedDestinationCharges[4][20] = data[0].O_LU || "";
        updatedDestinationCharges[5][20] = data[0].O_Del || "";
        // updatedDestinationCharges[6][20] = data[0].D_LOC || "";

        setRemarks(data[0].remarks || "");
        console.log("fetched successfully");
        setOriginCharges(updatedOriginCharges);
        console.log("Updated Origin Charges:", updatedOriginCharges);
        setSeaFreightCharges(updatedSeaFreightCharges);
        console.log("Updated Sea Freight Charges:", updatedSeaFreightCharges);
        setDestinationCharges(updatedDestinationCharges);
        console.log("Updated Destination Charges:", updatedDestinationCharges);
      } else {
        console.log("fetched failed");
        setOriginCharges(originCharges.map((item) => ({ ...item, 20: ""})));
        setSeaFreightCharges(seaFreightCharges.map((item) => ({ ...item, 20: ""})));
        setDestinationCharges(destinationCharges.map((item) => ({ ...item, 20: ""})));
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
      containerSize,
      originData: filterCharges(originCharges),
      seaFreightData: filterCharges(seaFreightCharges),
      destinationData: filterCharges(destinationCharges),
      totalShipmentCost: totalShipmentCost[containerSize],
      totalOrigin: totalOrigin[containerSize],
      totalSeaFreight: totalSeaFreight[containerSize],
      totalDestination: totalDestination[containerSize],
      createdBy: secureLocalStorage.getItem("un") || "Unknown",
      remarks: remarks || "",
    };
  
    try {
      console.log(`Saving quote for ${containerSize}ft:`, quoteData);
      const response = await fetch("/api/SaveFCLQuote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(quoteData),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to save quote for ${containerSize}ft`);
      }
      console.log(`Quote for ${containerSize}ft saved successfully.`);
    } catch (error) {
      console.error(`Error saving quote for ${containerSize}ft:`, error);
      alert(`Error saving quote for ${containerSize}ft`);
    }
  };
  const handleSave = async () => {
    if (!selectedLocation) {
      alert("Please select a location before saving.");
      return;
    }

    // if(incoterms==='DAP') {
    //   console.log("incoterms : " , incoterms==='DAP');
    //   if(totalShipmentCost[20] > 0 && totalDestination[20] <= 0) {
    //     alert("Destination charges are not available for DAP incoterms");
    //     return;
    //   }
    //   if(totalShipmentCost[40] > 0 && totalDestination[40] <= 0) {
    //     alert("Destination charges are not available for DAP incoterms");
    //     return;
    //   }
    //   if((totalShipmentCost[20] > 0 && totalShipmentCost[40] > 0) && (totalDestination[20] <= 0 || totalDestination[40] <= 0)) {
    //     alert("Destination charges are not available for DAP incoterms");
    //     return;
    //   }
    // }
    // if(incoterms==='CIF') {
    //   console.log("incoterms : " , incoterms==='DAP');
    //   if(totalShipmentCost[20] !== 0 && totalShipmentCost[40] !== 0 ) {
    //     alert("Destination charges are not available for DAP incoterms");
    //     return;
    //   }
    // }
  
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
        acc[40] += parseFloat(charge[40] || 0);
        return acc;
      },
      { 20: 0, 40: 0 }
    );
  };
  const calculateUSDTotal = (charges) => {
    return charges.reduce(
      (acc, charge) => {       
        acc[20] += parseFloat(charge[20]*(currency === "EURO" ? EUR : USD) || 0);
        acc[40] += parseFloat(charge[40]*(currency === "EURO" ? EUR : USD) || 0);
        return acc;
      },
      { 20: 0, 40: 0 }
    );
  };

  const calculateShipUSDTotal = (charges) => {
    return charges.reduce(
      (acc, charge) => {       
        acc[20] += parseFloat(charge[20]*USD || 0);
        acc[40] += parseFloat(charge[40]*USD || 0);
        return acc;
      },
      { 20: 0, 40: 0 }
    );
  };

  const totalOrigin = calculateTotal(originCharges);
  const totalSeaFreight = calculateShipUSDTotal(seaFreightCharges);
  const totalDestination = calculateUSDTotal(destinationCharges);

  const totalShipmentCost = {
    20: (totalOrigin[20] + totalSeaFreight[20] + totalDestination[20]).toFixed(2),
    40: (totalOrigin[40] + totalSeaFreight[40] + totalDestination[40]).toFixed(2),
  };
  const fetchSupplierDetails = async (locCode) => {
          try {
            const selectedMonth = dayjs(selectedDate).month() + 1;
            const selectedYear = dayjs(selectedDate).year();
            const response = await fetch('/api/ADOC/ADOCFCL_Terms_Print', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ Shipment_Type: 'ADOCLCL',Transport_Type: 'import',Loc_Code: locCode , Container_Size: 'LCL' ,MonthNo: selectedMonth,YearNo: selectedYear }),
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
          if (selectedLocation) {
            fetchSupplierDetails(selectedLocation);
            fetchQuotationData(selectedLocation);
          }
        }, [selectedLocation]);
  useEffect(() => {
    if (selectedLocation && selectedDate) {
      fetchSupplierDetails(selectedLocation);
      fetchQuotationData(selectedLocation);
    }
  }, [selectedLocation, selectedDate]);
  useEffect(() => {
    if (selectedDate) {
      fetchSupplierDetails(selectedLocation);
      fetchQuotationData(selectedLocation);
    }
  }, [selectedDate]);

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  
    const now = moment().add(0, 'days');
    const formattedDate = now.format("DD-MM-YYYY");
    const startDate = selectedDate.clone().startOf("month").format("DD");
    const endDate = selectedDate.clone().endOf("month").format("DD");
    const selectedMonthYear = selectedDate.format("MMMM YYYY");
  
    const tableHeaders = [
      [
        { content: "S.No", rowSpan: 2, styles: { valign: "middle" } },
        { content: "Descriptions", rowSpan: 2, styles: { valign: "middle" } },
        { content: "Currency in", rowSpan: 2, styles: { valign: "middle" } },
        { content: `Quote for GTI to ${locationName || "{select location}"}`, colSpan: 2, styles: { halign: "center" } },
        { content: "Remarks",  rowSpan: 2, styles: { valign: "middle" } },
      ],
      [
        { content: containerSize || "N/A", colSpan: 2, styles: { halign: "center" } },
      ]
    ];
  
    const tableBody = [];
  
    const addSectionHeader = (sectionName) => {
      tableBody.push([
        { content: sectionName, colSpan: 10, styles: { halign: "left", fontStyle: "bold", fillColor: [255, 255, 255] } }
      ]);
    };
  
    const addChargesToBody = (charges, currency) => {
      charges.forEach((charge, index) => {
        tableBody.push([
          index + 1,
          charge.description,
          `${currency} / Shipment`,
          { 
            content: (charge[20] === 0 || charge[20] === '0.00' || charge[20] === '0' || charge[20] === 0.00) ? "" : (charge[20] || ""), 
            colSpan: 2,
            styles: { halign: "center" } 
          },
          charge.remarks || "", 
        ]);
      });
    };
  
  
    addSectionHeader("A) ORIGIN CHARGES");
    addChargesToBody(originCharges, "INR");
    tableBody.push([
      "",
      { content: "Total Origin Charges (INR)", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
      { 
        content: [0, "0.00", "0", 0.0].includes(totalOrigin[20]) ? "" : (totalOrigin[20] ?? 0).toFixed(2), 
        colSpan: 2,
        styles: { halign: "center" } 
      },
      // "", "", ""
    ]);
  
    addSectionHeader("B) SEA FREIGHT CHARGES");
    addChargesToBody(seaFreightCharges, "USD");
    tableBody.push([
      "",
      { content: "Total Sea Freight Charges (INR)", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
      { 
        content: [0, "0.00", "0", 0.0].includes(totalSeaFreight[20]) ? "" : (totalSeaFreight[20] ?? 0).toFixed(2), 
        colSpan: 2,
        styles: { halign: "center" } 
      },
      ""
    ]);
  
    addSectionHeader("C) DESTINATION CHARGES");
    addChargesToBody(destinationCharges, currency);
    tableBody.push([
      "",
      { content: "Total Destination Charges (INR)", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
      { 
        content: [0, "0.00", "0", 0.0].includes(totalDestination[20]) ? "" : (totalDestination[20] ?? 0).toFixed(2), 
        colSpan: 2,
        styles: { halign: "center" } 
      },
      ""
    ]);
  
    tableBody.push([
      "",
      { content: "TOTAL SHIPMENT COST (A + B + C)", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
      {content: totalShipmentCost[20], colSpan: 2,  styles: { halign: "center" } },
      // "", "", "",
      ""
    ]);
  
    tableBody.push([{ content: "INCO Term", colSpan: 2, styles: { fontStyle: "bold" } }, { content: incoterms, colSpan: 8 }]);
  
    const cleanedDeliveryAddress = deliveryAddress.replace(/\n/g, " ");
    const maxDeliveryAddressLength = 50;
    const trimmedAddress = cleanedDeliveryAddress.length > maxDeliveryAddressLength
      ? cleanedDeliveryAddress.slice(0, maxDeliveryAddressLength) + '...'
      : cleanedDeliveryAddress;
  
    tableBody.push([
      { content: "Delivery Address", colSpan: 2, styles: { fontStyle: "bold" } },
      { content: trimmedAddress, colSpan: 8, styles: { fontSize: 7 } }
    ]);
  
    tableBody.push([
      { content: "FX Rate", colSpan: 2, styles: { fontStyle: "bold" } },
      { content: "USD", styles: { halign: "center" } },
      { content: USD.toFixed(2), colSpan: 1, styles: { halign: "center" } },
      { content: "EURO", styles: { halign: "center" } },
      { content: EUR.toFixed(2), colSpan: 1, styles: { halign: "center" } }
    ]);
  
    tableBody.push([{ content: "Destination Port : ", colSpan: 2, styles: { fontStyle: "bold" } }, 
      { content: Dest_Port, colSpan: 8 }]);
    tableBody.push([{ content: "Required Transit Days : ", colSpan: 2, styles: { fontStyle: "bold" } }, { content: transitDays, colSpan: 8 }]);
    tableBody.push([{ content: "Weight of cargo : ", colSpan: 2, styles: { fontStyle: "bold" } }, { content: weight, colSpan: 8 }]);
    tableBody.push([{ content: "Free Days Requirement at Destination : ", colSpan: 2, styles: { fontStyle: "bold" } }, { content: Free_Days, colSpan: 8 }]);
    tableBody.push([{ content: "Preffered Liners : ", colSpan: 2, styles: { fontStyle: "bold" } }, { content: Pref_Liners, colSpan: 8 }]);
    tableBody.push([{ content: "HSN Code : ", colSpan: 2, styles: { fontStyle: "bold" } }, { content: HSN_Code, colSpan: 8 }]);
    tableBody.push([{ content: "Required CBM : ", colSpan: 2, styles: { fontStyle: "bold" } }, { content: Avg_Cont_Per_Mnth, colSpan: 8 }]);
  
    tableBody.push([{ content: "Remarks", colSpan: 2, styles: { fontStyle: "bold" } }, { content: remarks, colSpan: 8 }]);
      
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Greentech Industries (India) Pvt. Ltd", 5, 10, { align: "left" });
  
    doc.setFontSize(8);
    doc.text(`Adhoc Import rates`, 5, 14, { align: "left" });
    const loc = locationName.split('|')[0].trim();
    doc.text(`Quote for GTI to ${loc} LCL shipment`, 5, 18, { align: "left" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
   
  
    let dateTextWidth = doc.getStringUnitWidth(`Date: ${formattedDate}`) * doc.internal.scaleFactor;
    let xPosition = doc.internal.pageSize.width - 10;
    doc.text(`Date: ${formattedDate}`, xPosition - dateTextWidth, 10);

  
    doc.autoTable({
      head: tableHeaders,
      body: tableBody,
      startY: 28,
      styles: { fontSize: 7, cellPadding: 1.2, overflow: "linebreak", lineWidth: 0.05 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 6, lineWidth: 0.05 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 60 },
        2: { cellWidth: 25 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
      },
      margin: { left: 10, right: 5 },
      theme: "grid",
    });

//     const pageHeight = doc.internal.pageSize.height; // Get page height
// const marginBottom = 20; // Adjust as needed

// // Define positions
// const marginLeft = 10;
// const columnSpacing = 65; // Adjust based on required spacing
// const textYPosition = pageHeight - marginBottom; // Position near bottom

// // Draw text at bottom
// doc.text("Approved by:", marginLeft, textYPosition);
// doc.text("Checked by:", marginLeft + columnSpacing, textYPosition);
// doc.text("Prepared by:", marginLeft + 2 * columnSpacing, textYPosition);

  
    doc.save("quotation_print_ADOCImportLCL.pdf");
  };
  
  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
      <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Comparitive Statement of quotations </h2>
              <p className="text-xs text-gray-100">"RFQ Import rates for { dayjs(selectedDate).format("MMMM YYYY")}"</p>
              <p className="text-xs text-gray-100">We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"</p>
            </div>
            <div className="flex flex-col items-center justify-start lg:flex-row justify-end gap-4 sm:gap-0 lg:gap-4 mt-4 lg:mt-0">
            <div>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                    label={<span style={{ color: "var(--borderclr)" }}>Select</span>}
                    views={["year", "month"]}
                    openTo="month"
                    value={selectedDate}
                    className="w-[200px] md:w-21"
                    sx={{
                        "& .MuiInputBase-root": {
                          color: "var(--borderclr)",
                          borderRadius: "8px",
                          fontSize:"14px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "var(--borderclr)"
                        },
                        "& .MuiSvgIcon-root": {
                          color: "var(--borderclr)",
                        },
                      }}
                    onChange={(newValue) => setSelectedDate(newValue)}
                  />
                </LocalizationProvider>
              </div>
              <div className="flex flex-row lg:flex-row items-center justify-start lg:justify-end gap-4">
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
              <div>
                {/* <button
                  hidden
                  onClick={handleSave}
                  className="mt-0 lg:mt-0 flex items-center justify-center bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] text-sm px-3 py-3 rounded"
                  style={{ minWidth: "80px" }}
                >
                  {saveState === "idle" && <FiSave size={16} />}
                  {saveState === "saving" && <FiLoader size={16} className="animate-spin" />}
                  {saveState === "saved" && <FiCheck size={16} />}
                </button> */}
                <Button onClick={downloadPDF} variant="outline" className="flex items-center px-4 py-2 bg-red-500 text-white rounded">
                  <FaFilePdf className="" />
                </Button>
              </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs">
            <thead className="bg-[var(--bgBody3)] text-[var(--buttonHover)] border border-[var(--bgBody)]">
              <tr> 
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] text-orange-500 ">Sea Freight RFQ - FCL</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency in</th>
                <th colSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Quote for GTI to {locationName || "{select location}"} Air shipment</th>
                <th colSpan="2" rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                <th colSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">{containerSize || "N/A"}</th>
                {/* <th className="py-1 px-2 border border-[var(--bgBody)]">40 ft</th> */}
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody3)]">
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("origin")}
              >
                <td>A.</td>
                <td colSpan="5" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} Origin Charges
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
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    <td colSpan="2" className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0" 
                        readOnly                    
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
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Origin Charges</td>
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
                  {sections.seaFreight ? "▼" : "▶"} Sea Freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                seaFreightCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 6}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td colSpan="2" className="py-1 px-3 border">
                      <input
                        readOnly
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
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Sea Freight Charges</td>
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
                    <td className="py-1 px-3 border">{index + 9}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">{currency} / Shipment</td>
                    <td colSpan="2" className="py-1 px-3 border">
                      <input
                        readOnly
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
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Shipment Cost in INR (A + B + C)</td>
                <td className="py-1 px-3 border"></td>
                <td colSpan="2" className="py-1 px-3 border">{totalShipmentCost[20]}</td>
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">INCO Term</td>
                <td colSpan="4" className="py-1 px-3 border text-left">{incoterms}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border  text-start">Delivery Address</td>             
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
                <td colSpan="1" className="py-1 px-3 border text-start">Free Days Requirement at Destination :</td>
                <td colSpan="2" className="py-1 px-3 border text-left">{Free_Days}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Weight of cargo in kgs : </td>
                <td colSpan="4" className="py-1 px-3 border text-left">{weight}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Destination Port</td>
                <td colSpan="1" className="py-1 px-3 border text-left">{Dest_Port}</td>
                <td colSpan="1" className="py-1 px-3 border text-start">Preffered Liners</td>
                <td colSpan="2" className="py-1 px-3 border text-left">{Pref_Liners}</td>
              </tr>
             
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">HSN Code :</td>
                <td colSpan="1" className="py-1 px-3 border text-left">{HSN_Code}</td>
                <td colSpan="1" className="py-1 px-3 border text-start">Required CBM :</td>
                <td colSpan="2" className="py-1 px-3 border text-left">{Avg_Cont_Per_Mnth}</td>
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
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Remarks</td>
                <td colSpan="4" className="py-1 px-3 border text-left">
                    <input
                        readOnly
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