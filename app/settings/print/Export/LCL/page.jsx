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
    { description: "Customs Clearance & Documentation", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Local Transportation From GTI-Chennai", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Terminal Handling Charges - Origin", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Bill of Lading Charges", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Loading/Unloading / SSR", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "CFS Charges (At Actual)", remarks: "At Actual", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
  ]);

  const [seaFreightCharges, setSeaFreightCharges] = useState([
    { description: "Sea Freight", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "FSC (Fuel Surcharge)", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    // { description: "ISPS", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    // { description: "Seal Fee", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
  ]);

  const [destinationCharges, setDestinationCharges] = useState([
    { description: "Custom Clearance", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "CC Fee", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "D.O Charges ", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "AAI Charges", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Loading/Unloading", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    { description: "Delivery", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
    // { description: "LOLO Charges", remarks: "", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "", sc7: "", sc8: "", sc9: "", sc10: "", sc11: "", sc12: "", sc13: "", sc14: "", sc15: "", sc16: "", sc17: "", sc18: "" },
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
  const [selectedDate, setSelectedDate] = useState(); 
  const [totalA, setTotalA] = useState(Array(18).fill(""));
  const [totalB, setTotalB] = useState(Array(18).fill(""));
  const [totalC, setTotalC] = useState(Array(18).fill(""));
  const [total, setTotal] = useState(Array(18).fill(""));
  let curr = "";

  const tableRef = useRef();

  useEffect(() => {
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    if (check_sc !== 'admin') {
      window.location.href = "/";
    }
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
      try {
        const response = await fetch('/api/get_locations', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ RFQType: 'LCL' }),
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

    const fetchCurrency = async () => {
      try {
        const month = selectedDate ? selectedDate.month() + 1 : new Date().getMonth() + 1;
        const year = selectedDate ? selectedDate.year() : new Date().getFullYear();
        console.log('Curr Month:', month);  
        console.log('Curr Year:', year);  
        const response = await fetch('/api/get_currency_MonthYear',{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Month: month,Year :  year}),
        });
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          setUSD(parseFloat(data.result[0].USD));
          setEUR(parseFloat(data.result[0].EURO));
        } else {
          setUSD(0);
          setEUR(0);
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
      }
    };
  
    useEffect(() => {
      fetchCurrency();
    }, []);
  
    useEffect(() => {
      fetchCurrency();
    }, [selectedDate]);

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
        curr = data.result[0].Currency;
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

        if (data.length <= 0) {
            setSuppliers(prev => [...prev]);
            setTotalA(prev => [...prev]);
            setTotalB(prev => [...prev]);
            setTotalC(prev => [...prev]);
            setTotal(prev => [...prev]);
            return;
        }

        const updatedOriginCharges = [...originCharges];
        const updatedSeaFreightCharges = [...seaFreightCharges];
        const updatedDestinationCharges = [...destinationCharges];

        if (CBM >= 1 && CBM <= 6) {
            setSuppliers(prev => {
                const newSuppliers = [...prev];
                for (let i = 0; i < 3; i++) {
                    newSuppliers[(CBM - 1) * 3 + i] = data.find(item => item.Attribute === "Vendor_Name")?.[`Supplier_${i + 1}`] || prev[(CBM - 1) * 3 + i];
                }
                return newSuppliers;
            });

            ["O_CCD", "O_LTG", "O_THC", "O_BLC", "O_LUS", "O_CFS"].forEach((attribute, index) => {
                for (let i = 0; i < 3; i++) {
                    updatedOriginCharges[index][`sc${(CBM - 1) * 3 + i + 1}`] =
                        data.find(item => item.Attribute === attribute)?.[`Supplier_${i + 1}`] || updatedOriginCharges[index][`sc${(CBM - 1) * 3 + i + 1}`];
                }
            });

            ["S_SeaFre", "S_FSC"].forEach((attribute, index) => {
                for (let i = 0; i < 3; i++) {
                    updatedSeaFreightCharges[index][`sc${(CBM - 1) * 3 + i + 1}`] =
                        data.find(item => item.Attribute === attribute)?.[`Supplier_${i + 1}`] || updatedSeaFreightCharges[index][`sc${(CBM - 1) * 3 + i + 1}`];
                }
            });

            ["D_CUC", "D_CCF", "D_DOC", "D_AAI", "D_LU", "D_Del"].forEach((attribute, index) => {
                for (let i = 0; i < 3; i++) {
                    updatedDestinationCharges[index][`sc${(CBM - 1) * 3 + i + 1}`] =
                        data.find(item => item.Attribute === attribute)?.[`Supplier_${i + 1}`] || updatedDestinationCharges[index][`sc${(CBM - 1) * 3 + i + 1}`];
                }
            });

            setTotalA(prev => {
                const newTotalA = [...prev];
                for (let i = 0; i < 3; i++) {
                    newTotalA[(CBM - 1) * 3 + i] =
                        data.find(item => item.Attribute === "O_Total_Chg")?.[`Supplier_${i + 1}`] || prev[(CBM - 1) * 3 + i];
                }
                return newTotalA;
            });

            setTotalB(prev => {
                const newTotalB = [...prev];
                for (let i = 0; i < 3; i++) {
                    newTotalB[(CBM - 1) * 3 + i] =
                        data.find(item => item.Attribute === "S_Total_Chg")?.[`Supplier_${i + 1}`] || prev[(CBM - 1) * 3 + i];
                }
                return newTotalB;
            });

            setTotalC(prev => {
                const newTotalC = [...prev];
                for (let i = 0; i < 3; i++) {
                    newTotalC[(CBM - 1) * 3 + i] =
                        data.find(item => item.Attribute === "D_Total_Chg")?.[`Supplier_${i + 1}`] || prev[(CBM - 1) * 3 + i];
                }
                return newTotalC;
            });

            setTotal(prev => {
                const newTotal = [...prev];
                for (let i = 0; i < 3; i++) {
                    newTotal[(CBM - 1) * 3 + i] =
                        data.find(item => item.Attribute === "Total_Ship_Cost")?.[`Supplier_${i + 1}`] || prev[(CBM - 1) * 3 + i];
                }
                return newTotal;
            });
        }

        setOriginCharges(updatedOriginCharges);
        setSeaFreightCharges(updatedSeaFreightCharges);
        setDestinationCharges(updatedDestinationCharges);
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
      const month = selectedDate ? selectedDate.month() + 1 : new Date().getMonth() + 1;
      const year = selectedDate ? selectedDate.year() : new Date().getFullYear();
      console.log("selected Location : ", selectedLocation);
      const fetchData = async () => {
        await fetchQuotationData(selectedLocation, month, year, 1);
        await fetchQuotationData(selectedLocation, month, year, 2);
        await fetchQuotationData(selectedLocation, month, year, 3);
        await fetchQuotationData(selectedLocation, month, year, 4);
        await fetchQuotationData(selectedLocation, month, year, 5);
        await fetchQuotationData(selectedLocation, month, year, 6);
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
    console.log("curr :", curr);
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const startDate = selectedDate.startOf("month").format("DD");
    const endDate = selectedDate.endOf("month").format("DD");
    const selectedMonthYear = selectedDate.format("MMMM YYYY");

    const tableHeaders = [
        [
            { content: "S.No", rowSpan: 2, styles: { valign: "middle" } },
            { content: "Descriptions", rowSpan: 2,styles: { valign: "middle" } },
            { content: "Currency", rowSpan: 2, styles: { valign: "middle" } },
            ...Array.from({ length: 6 }, (_, i) => ({ content: `${i + 1} CBM`, colSpan: 3, styles: { halign: "center" } })),
          
        ],
      //   [
      //     // Dynamically add supplier names
      //     ...suppliers.slice(0, 18).map(supplier => ({
      //         content: supplier,
      //         styles: { halign: "center" }  // Center-align the supplier names in the table
      //     }))
      // ]
      [
        // ...suppliers.slice(0, 6).map(supplier => ({ content: supplier, styles: { halign: "center" } }))
        ...suppliers.slice(0, 18).map((supplier) => {
          // Here, val is assumed to be the supplier value
          const val = supplier;
    
          return {
            content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "",
            styles: { halign: "center",valign: "middle" }  // Center-align the supplier names
          };
        })
      ]     
  
    ];

    const tableBody = [];

    const addSectionHeader = (sectionName) => {
        tableBody.push([
            { content: sectionName, colSpan: 20, styles: { halign: "left", fontStyle: "bold", fillColor: [255, 255, 255] } }
        ]);
    };

    const addChargesToBody = (charges, currency) => {
      charges.forEach((charge, index) => {
          tableBody.push([
              index + 1,
              charge.description,
              currency,
              ...Array.from({ length: 18 }, (_, i) => {
                  const val = charge[`sc${i + 1}`];
                  return {
                      content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "",
                      styles: { halign: "center" }
                  };
              }),
          ]);
      });
  };
  

    addSectionHeader("A) ORIGIN CHARGES");
    addChargesToBody(originCharges, "INR / Shipmt");
    tableBody.push([
      { content: "", styles: { halign: "center" } },
      { content: "Total Origin Charges", styles: { halign: "center" } },
      { content: "INR", styles: { halign: "center" } },
      // ...totalA.map(val => ({ content: val, styles: { halign: "center" } })),
      ...totalA.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
      { content: "", styles: { halign: "center" } }
  ]);
  

    addSectionHeader("B) SEA FREIGHT CHARGES");
    addChargesToBody(seaFreightCharges, "USD / Shipmt");
    tableBody.push([
      { content: "", styles: { halign: "center" } },
      { content: "Total Sea Freight Charges", styles: { halign: "center" } },
      { content: "INR", styles: { halign: "center" } },
      // ...totalB.map(val => ({ content: val, styles: { halign: "center" } })),
      ...totalB.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
      { content: "", styles: { halign: "center" } }
  ]);
  

    addSectionHeader("C) DESTINATION CHARGES");
    addChargesToBody(destinationCharges, currency+" / Shipmt");
    tableBody.push([
      { content: "", styles: { halign: "center" } },
      { content: "Total Destination Charges", styles: { halign: "center" } },
      { content: "INR", styles: { halign: "center" } },
      // ...totalC.map(val => ({ content: val, styles: { halign: "center" } })),
      ...totalC.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
      { content: "", styles: { halign: "center" } }
  ]);

  tableBody.push([
    { content: "", styles: { halign: "center" } },
    { content: "TOTAL SHIPMENT COST (A + B + C)", styles: { halign: "center" } },
    { content: "INR", styles: { halign: "center" } },
    // ...total.map(val => ({ content: val, styles: { halign: "center" } })),
    ...total.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
    { content: "", styles: { halign: "center" } }
]);


    tableBody.push([{ content: "INCO Term", colSpan: 3, styles: { fontStyle: "bold" } }, { content: incoterms, colSpan: 18 }]);

    tableBody.push([{ content: "Delivery Address", colSpan: 3, styles: { fontStyle: "bold" } },
        { content: deliveryAddress.replace(/\n/g, " "), colSpan: 18, styles: { fontSize: 6, whiteSpace: "nowrap" } }
    ]);

    tableBody.push([{ content: "FX Rate", colSpan: 3, styles: { fontStyle: "bold" } },
        { content: "USD", styles: { halign: "center" } },
        { content: USD.toFixed(2), colSpan: 2, styles: { halign: "center" } },
        { content: "EURO", styles: { halign: "center" } },
        { content: EUR.toFixed(2), colSpan: 3, styles: { halign: "center" } },
        { content: "", colSpan: 13,}
    ]);

    tableBody.push([{ content: "Destination Port", colSpan: 3, styles: { fontStyle: "bold" } },
        { content: Dest_Port, colSpan: 4 },
        { content: "Required Transit Days", colSpan: 3, styles: { fontStyle: "bold" } },
        { content: transitDays, colSpan: 11 }
    ]);

    tableBody.push([{ content: "Remarks", colSpan: 3, styles: { fontStyle: "bold" } }, { content: '', colSpan: 18 }]);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Comparative Statement of Quotations", 5, 8);

    doc.setFontSize(8);
    doc.text(`RFQ Export rates for ${selectedMonthYear} (${startDate}.${selectedMonthYear} - ${endDate}.${selectedMonthYear})`, 5, 12);
    doc.text(`Quote for GTI to ${locationName} shipment`, 5, 16);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("We follow 'IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit'", 5, 20);
    doc.setFontSize(8);
    let dateTextWidth = doc.getStringUnitWidth(`Date: ${formattedDate}`) * doc.internal.scaleFactor;
    let xPosition = doc.internal.pageSize.width - 10;
    doc.text(`Date: ${formattedDate}`, xPosition - dateTextWidth, 8);

    const approvalText = "Approved by:                                          Checked by:                                          Prepared by:                                  ";
    let approvalTextWidth = doc.getStringUnitWidth(approvalText) * doc.internal.scaleFactor;
    doc.text(approvalText, xPosition - approvalTextWidth - 5, 18);

    const startY = 22;

    doc.autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: startY,
        styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak",lineWidth: 0.05 },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 7, lineWidth: 0.05 },
        columnStyles: {
            0: { cellWidth: 8 },
            1: { cellWidth: 45 },
            2: { cellWidth: 20 },
            ...Array.from({ length: 18 }, (_, i) => ({ [i + 3]: { cellWidth: 12 } })).reduce((a, b) => ({ ...a, ...b }), {}),
          
        },
        margin: { left: 3, right: 3 },
        theme: "grid",
    });

    doc.text("GREENTECH INDUSTRIES Business ©2023.04.03 by Muni Kranth.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: "center" });

    doc.save("quotation_print_ExportFCL.pdf");
};

  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]" ref={tableRef}>
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3 space-y-2">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-2">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Comparative Statement of quotations</h2>
              <p className="text-xs text-gray-100">
                {`Export Print LCL rates for 
                  ${selectedDate 
                    ? `${selectedDate.format("MMMM YYYY")} (${selectedDate.startOf("month").format("DD")}.${selectedDate.format("MMMM YYYY")} - ${selectedDate.endOf("month").format("DD")}.${selectedDate.format("MMMM YYYY")})` 
                    : "Loading..."
                  }`
                }
                </p>
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
                  <td className="py-1 px-3 border">INR</td>
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
                    <td className="py-1 px-3 border">{index + 9}</td>
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