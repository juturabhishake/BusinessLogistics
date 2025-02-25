"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import secureLocalStorage from "react-secure-storage";
import { Check, ChevronsUpDown, FileText } from "lucide-react";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import jsPDF from "jspdf";
import "jspdf-autotable"; 

const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

const QuotationTable = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === secureLocalStorage.getItem("theme") || "dark";
  const [currentDateInfo, setCurrentDateInfo] = useState("");
  const [sections, setSections] = useState({
    origin: true,
    seaFreight: true,
    destination: true,
  });

  const [originCharges, setOriginCharges] = useState([
    { description: "Customs Clearance & Documentation", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Local Transportation From GTI-Chennai", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Terminal Handling Charges - Origin", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Bill of Lading Charges", remarks: "Per BL", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Loading/Unloading / SSR", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Halting", remarks: "If any", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
  ]);

  const [seaFreightCharges, setSeaFreightCharges] = useState([
    { description: "Sea Freight", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "ENS", remarks: "Per BL", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "ISPS", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Seal Fee", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
  ]);

  const [destinationCharges, setDestinationCharges] = useState([
    { description: "Destination Terminal Handling Charges", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "BL Fee", remarks: "Per BL", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Delivery by Barge/Road", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Delivery Order Fees", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Handling Charges", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "T1 Doc", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "LOLO Charges", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
  ]);

  const [suppliers, setSuppliers] = useState(Array(18).fill(""));

  const [open, setOpen] = useState(false);
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
  const [selectedDate, setSelectedDate] = useState(dayjs()); 
  const [totalA, setTotalA] = useState(Array(18).fill(""));
  const [totalB, setTotalB] = useState(Array(18).fill(""));
  const [totalC, setTotalC] = useState(Array(18).fill(""));
  const [total, setTotal] = useState(Array(18).fill(""));

  const tableRef = useRef();

  useEffect(() => {
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    if (check_sc !== 'admin') {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/get_locations', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ RFQType: 'FCL' }),
        });
        const data = await response.json();
        setLocations(data.result);
        if (data.result.length > 0) {
          setSelectedLocation(data.result[0].Location_Code);
          setLocationName(data.result[0].Location_Name);
        }
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
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); 
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const formattedDate = `${monthNames[currentMonth]} ${currentYear}`;
    setCurrentDateInfo(formattedDate);
  }, []);

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
      }
    } catch (error) {
      console.error("Error fetching supplier details:", error);
    }
  };

  const fetchQuotationData = async (locationCode, month, year, CBM) => {
    try {
      const response = await fetch("/api/prints/ExportLCL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote_month: month,
          quote_year: year,
          sc: secureLocalStorage.getItem("sc") || "Unknown Supplier",
          username: secureLocalStorage.getItem("un") || "Unknown",
          loc_code: locationCode,
          CBM: CBM,
        }),
      });

      const data = await response.json();

      console.log("Fetched Data : ", data);
      if (data.length <= 0) {
        setOriginCharges(originCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
        setSeaFreightCharges(seaFreightCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
        setDestinationCharges(destinationCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
        setSuppliers(Array(18).fill(""));
        setTotalA(Array(18).fill(""));
        setTotalB(Array(18).fill(""));
        setTotalC(Array(18).fill(""));
        setTotal(Array(18).fill(""));
        return;
      }
      if (data && data.length > 0) {
        const updatedOriginCharges = [...originCharges];
        const updatedSeaFreightCharges = [...seaFreightCharges];
        const updatedDestinationCharges = [...destinationCharges];

        for (let i = 1; i <= 6; i++) {
          const suffix = i === 1 ? "1" : i === 2 ? "2" : i === 3 ? "3" : i === 4 ? "4" : i === 5 ? "5" : "6";
          const supplierData = data.filter(item => item.Attribute.includes(`Supplier_${suffix}`));

          updatedOriginCharges.forEach((charge, index) => {
            charge[`sc${(i - 1) * 3 + 1}`] = supplierData[index]?.Supplier_1 || "";
            charge[`sc${(i - 1) * 3 + 2}`] = supplierData[index]?.Supplier_2 || "";
            charge[`sc${(i - 1) * 3 + 3}`] = supplierData[index]?.Supplier_3 || "";
          });

          updatedSeaFreightCharges.forEach((charge, index) => {
            charge[`sc${(i - 1) * 3 + 1}`] = supplierData[index]?.Supplier_1 || "";
            charge[`sc${(i - 1) * 3 + 2}`] = supplierData[index]?.Supplier_2 || "";
            charge[`sc${(i - 1) * 3 + 3}`] = supplierData[index]?.Supplier_3 || "";
          });

          updatedDestinationCharges.forEach((charge, index) => {
            charge[`sc${(i - 1) * 3 + 1}`] = supplierData[index]?.Supplier_1 || "";
            charge[`sc${(i - 1) * 3 + 2}`] = supplierData[index]?.Supplier_2 || "";
            charge[`sc${(i - 1) * 3 + 3}`] = supplierData[index]?.Supplier_3 || "";
          });
        }

        setOriginCharges(updatedOriginCharges);
        setSeaFreightCharges(updatedSeaFreightCharges);
        setDestinationCharges(updatedDestinationCharges);
      } else {
        setOriginCharges(originCharges.map((item) => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
        setSeaFreightCharges(seaFreightCharges.map((item) => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
        setDestinationCharges(destinationCharges.map((item) => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
      }
    } catch (error) {
      console.error("Error fetching quotation data:", error);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      setOriginCharges(originCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
      setSeaFreightCharges(seaFreightCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
      setDestinationCharges(destinationCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" })));
      setSuppliers(Array(18).fill(""));
      setTotalA(Array(18).fill(""));
      setTotalB(Array(18).fill(""));
      setTotalC(Array(18).fill(""));
      setTotal(Array(18).fill(""));
      fetchSupplierDetails(selectedLocation);
      const month = selectedDate.month() + 1;
      const year = selectedDate.year();
      console.log("selected Location : ", selectedLocation);
      const fetchData = async () => {
        await fetchQuotationData(selectedLocation, month, year, 20);
        await fetchQuotationData(selectedLocation, month, year, 40);
      };
  
      fetchData();
    }
  }, [selectedLocation, selectedDate]);

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const calculateTotal = (charges) => {
    return charges.reduce(
      (acc, charge) => {
        for (let i = 1; i <= 6; i++) {
          acc[i] += parseFloat(charge[`sc${i * 3 - 2}`] || 0);
          acc[i] += parseFloat(charge[`sc${i * 3 - 1}`] || 0);
          acc[i] += parseFloat(charge[`sc${i * 3}`] || 0);
        }
        return acc;
      },
      Array(7).fill(0)
    );
  };

  const totalOrigin = calculateTotal(originCharges);
  const totalSeaFreight = calculateTotal(seaFreightCharges);
  const totalDestination = calculateTotal(destinationCharges);

  const totalShipmentCost = {
    1: (totalOrigin[1] + totalSeaFreight[1] + totalDestination[1]).toFixed(2),
    2: (totalOrigin[2] + totalSeaFreight[2] + totalDestination[ 2]).toFixed(2),
    3: (totalOrigin[3] + totalSeaFreight[3] + totalDestination[3]).toFixed(2),
    4: (totalOrigin[4] + totalSeaFreight[4] + totalDestination[4]).toFixed(2),
    5: (totalOrigin[5] + totalSeaFreight[5] + totalDestination[5]).toFixed(2),
    6: (totalOrigin[6] + totalSeaFreight[6] + totalDestination[6]).toFixed(2),
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const selectedMonthYear = selectedDate.format("MMMM YYYY");
  
    const tableHeaders = [
      [
        { content: "S.No", rowSpan: 2 },
        { content: "Descriptions", rowSpan: 2 },
        { content: "Currency in", rowSpan: 2 },
        { content: "1 CBM", colSpan: 3, styles: { halign: "center" } },
        { content: "2 CBM", colSpan: 3, styles: { halign: "center" } },
        { content: "3 CBM", colSpan: 3, styles: { halign: "center" } },
        { content: "4 CBM", colSpan: 3, styles: { halign: "center" } },
        { content: "5 CBM", colSpan: 3, styles: { halign: "center" } },
        { content: "6 CBM", colSpan: 3, styles: { halign: "center" } },
        { content: "Remarks", rowSpan: 2 },
      ],
      [
        suppliers[0], suppliers[1], suppliers[2],
        suppliers[3], suppliers[4], suppliers[5],
        suppliers[6], suppliers[7], suppliers[8],
        suppliers[9], suppliers[10], suppliers[11],
        suppliers[12], suppliers[13], suppliers[14],
        suppliers[15], suppliers[16], suppliers[17],
      ],
    ];
  
    const tableBody = [];
  
    const addChargesToBody = (charges, currency) => {
      charges.forEach((charge, index) => {
        tableBody.push([
          index + 1,
          charge.description,
          `${currency} / Shipment`,
          charge.sc1 || "0",
          charge.sc2 || "0",
          charge.sc3 || "0",
          charge.sc4 || "0",
          charge.sc5 || "0",
          charge.sc6 || "0",
          charge.sc7 || "0",
          charge.sc8 || "0",
          charge.sc9 || "0",
          charge.sc10 || "0",
          charge.sc11 || "0",
          charge.sc12 || "0",
          charge.sc13 || "0",
          charge.sc14 || "0",
          charge.sc15 || "0",
          charge.sc16 || "0",
          charge.sc17 || "0",
          charge.sc18 || "0",
          charge.remarks,
        ]);
      });
    };
  
    addChargesToBody(originCharges, "INR");
    tableBody.push(["", "Total Origin Charges", "INR", ...totalA, ""]);
  
    addChargesToBody(seaFreightCharges, "USD");
    tableBody.push(["", "Total Sea Freight Charges", "USD", ...totalB, ""]);
  
    addChargesToBody(destinationCharges, "INR");
    tableBody.push(["", "Total Destination Charges", "INR", ...totalC, ""]);
  
    tableBody.push(["", "Total Shipment Cost (A + B + C)", "INR", ...total, ""]);
  
    tableBody.push([{ content: "INCO Term", colSpan: 2, styles: { fontStyle: "bold" } }, { content: incoterms, colSpan: 7 }]);
    tableBody.push([{ content: "Delivery Address", colSpan: 2, styles: { fontStyle: "bold" } }, { content: deliveryAddress, colSpan: 7, styles: { whiteSpace: "nowrap",  } }]);
    tableBody.push([{ content: "FX Rate (USD)", colSpan: 2, styles: { fontStyle: "bold" } }, { content: USD.toFixed(2), colSpan: 3 }, { content: "FX Rate (EURO)", colSpan: 2, styles: { fontStyle: "bold" } }, { content: EUR.toFixed(2), colSpan: 2 }]);
    tableBody.push([{ content: "Required Transit Days", colSpan: 2, styles: { fontStyle: "bold" } }, { content: transitDays, colSpan: 7 }]);
    tableBody.push([{ content: "Destination Port", colSpan: 2, styles: { fontStyle: "bold" } }, { content: Dest_Port, colSpan: 7 }]);
  
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Comparative Statement of Quotations", 140, 10, { align: "center" });
  
    doc.setFontSize(8);
    doc.text(`RFQ Export rates for ${selectedMonthYear} (01.${selectedMonthYear} - 28.${selectedMonthYear})`, 140, 14, { align: "center" });
    doc.text("We are following 'ATT 16949 CAPD Method 10.3 Continuous Improvement Spirit'", 140, 18, { align: "center" });
  
    doc.autoTable({
      head: tableHeaders,
      body: tableBody,
      startY: 22,
      styles: { fontSize: 7, cellPadding: 1, overflow: "linebreak" },
      headStyles: { fillColor: [204, 229, 252], textColor: [0, 0, 0], fontSize: 7, lineWidth: 0.02, lineColor: [0, 0, 0] },
      columnStyles: {
          0: { cellWidth: 10, lineWidth: 0.02, lineColor: [0, 0, 0] },
          1: { cellWidth: 60, lineWidth: 0.02, lineColor: [0, 0, 0] },
          2: { cellWidth: 21, lineWidth: 0.02, lineColor: [0, 0, 0] },
          3: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          4: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          5: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          6: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          7: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          8: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          9: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          10: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          11: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          12: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          13: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          14: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          15: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          16: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
          17: { cellWidth: 27, lineWidth: 0.02, lineColor: [0, 0, 0] },
      },
      margin: { left: 5, right: 5 },
      theme: "grid",
    });
  
    const finalY = doc.lastAutoTable.finalY + 10;
  
    doc.setFontSize(8);
    doc.text("Approved By: ______________", 10, finalY + 5);
    doc.text("Checked By: ______________", 100, finalY + 5);
    doc.text("Prepared By: ______________", doc.internal.pageSize.width - 50, finalY + 5);
  
    doc.text(`Date: ${formattedDate}`, doc.internal.pageSize.width - 50, finalY + 10);
    doc.text("GreenTech Industries ©2023.04.03 by Muni Kranth.", 140, doc.internal.pageSize.height - 8, { align: "center" });
  
    doc.save("quotation_print_ExportFCL.pdf");
  };
  
  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]" ref={tableRef}>
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3 space-y-2">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-2">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Comparative Statement of quotations</h2>
              <p className="text-xs text-gray-100">"Export Print FCL rates for {currentDateInfo}"</p>
              <p className="text-xs text-gray-100">Quote for GTI to {locationName || "{select location}"} shipment</p>
            </div>
            <div className="flex flex-col lg:flex-row justify-end items-start lg:items-center lg:space-y-0 sm:space-x-2 space-y-2">
              <div className="flex flex-row items-center justify-start lg:flex-row justify-end gap-4">
                <Button onClick={downloadPDF} variant="outline" className="bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)]">
                  <FileText className="mr-0" />
                </Button>
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
                            <CommandItem
                              key="default"
                              value=""
                              onSelect={() => {
                                setSelectedLocation("");
                                setLocationName("Select Location...");
                                setOpen(false);
                              }}
                            >
                              Select Location...
                              <Check className={cn("ml-auto", selectedLocation === "" ? "opacity-100" : "opacity-0")} />
                            </CommandItem>
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
                                <Check className={cn("ml-auto", selectedLocation === location.Location_Code ? "opacity-100" : "opacity-0")} />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={<span style={{ color: "var(--borderclr)" }}>Select</span>}
                    views={["year", "month"]}
                    openTo="month"
                    value={selectedDate}
                    className="w-full md:w-60"
                    sx={{
                      "& .MuiInputBase-root": {
                        color: "var(--borderclr)",
                        borderRadius: "8px",
                        fontSize:"14px"
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
            </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <table id="quotationTable" className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs"
          style={{ 
                fontSize: "13px", 
                padding: "1px",
                whiteSpace: "nowrap", 
                overflow: "hidden",   
                }}>
            <thead className="bg-[var(--bgBody3)] text-[var(--buttonHover)] border border-[var(--bgBody)]">
              <tr> 
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] text-orange-500 ">Sea Freight RFQ - FCL</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency in</th>
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">1 CBM</th>
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">2 CBM</th>
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">3 CBM</th>
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">4 CBM</th>
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">5 CBM</th>
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">6 CBM</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                {suppliers.map((supplier, index) => (
                  <th key={index} className="py-1 px-2 border border-[var(--bgBody)]">{supplier || `Supplier ${index + 1}`}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody3)]">
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("origin")}
              >
                <td>A.</td>
                <td colSpan="18" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} Origin Charges
                </td>
              </tr>
              {sections.origin &&
                originCharges.map((item, index) => (
                  <tr key={index} className="border border border-[var(--bgBody)]">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    {Array.from({ length: 18 }, (_, i) => (
                      <td key={i} className="py-1 px-3 border">{item[`sc${i + 1}`]}</td>
                    ))}
                    <td className="py-1 px-3 border">{item.remarks}</td>
                  </tr>
                ))}
              {sections.origin && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Origin Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  {totalA.map((total, index) => (
                    <td key={index} className="py-1 px-3 border">{total}</td>
                  ))}
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("seaFreight")}
              >
                <td>B.</td>
                <td colSpan="18" className="py-2 px-3 text-start flex items-center">
                  {sections.seaFreight ? "▼" : "▶"} Sea Freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                seaFreightCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 7}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    {Array.from({ length: 18 }, (_, i) => (
                      <td key={i} className="py-1 px-3 border">{item[`sc${i + 1}`]}</td>
                    ))}
                    <td className="py-1 px-3 border">{item.remarks}</td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Sea Freight Charges</td>
                  <td className="py-1 px-3 border">USD</td>
                  {totalB.map((total, index) => (
                    <td key={index} className="py-1 px-3 border">{total}</td>
                  ))}
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("destination")}
              >
                <td>C.</td>
                <td colSpan="18" className="py-2 px-3 text-start flex items-center">
                  {sections.destination ? "▼" : "▶"} Destination Charges
                </td>
              </tr>
              {sections.destination &&
                destinationCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 11}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">{currency} / Shipment</td>
                    {Array.from({ length: 18 }, (_, i) => (
                      <td key={i} className="py-1 px-3 border">{item[`sc${i + 1}`]}</td>
                    ))}
                    <td className="py-1 px-3 border">{item.remarks}</td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Destination Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  {totalC.map((total, index) => (
                    <td key={index} className="py-1 px-3 border">{total}</td>
                  ))}
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border">
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Shipment Cost in INR (A + B + C)</td>
                <td className="py-1 px-3 border"></td>
                {total.map((totalCost, index) => (
                  <td key={index} className="py-1 px-3 border">{totalCost}</td>
                ))}
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">INCO Term</td>
                <td colSpan="20" className="py-1 px-3 border text-left">{incoterms}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Delivery Address</td>             
                <td colSpan="20" className="py-1 px-3 border text-left" dangerouslySetInnerHTML={{ __html: deliveryAddress }} />
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">FX Rate</td>
                <td colSpan="5" className="py-1 px-3 border">USD</td>
                <td colSpan="5" className="py-1 px-3 border font-bold text-red-500 text-left">{USD}</td>
                <td colSpan="5" className="py-1 px-3 border">EURO</td>
                <td colSpan="5" className="py-1 px-3 border font-bold text-red-500 text-left">{EUR}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Required Transit Days</td>
                <td colSpan="20" className="py-1 px-3 border text-left">{transitDays}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Destination Port</td>
                <td colSpan="20" className="py-1 px-3 border text-left">{Dest_Port}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Remarks</td>
                <td colSpan="20" className="py-1 px-3 border text-left"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;