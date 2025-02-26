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
import html2canvas from "html2canvas";
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
    { description: "Customs Clearance & Documentation", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Local Transportation From GTI-Chennai", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Terminal Handling Charges - Origin", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Bill of Lading Charges", remarks: "Per BL", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Loading/Unloading / SSR", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Halting", remarks: "If any", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
  ]);

  const [seaFreightCharges, setSeaFreightCharges] = useState([
    { description: "Sea Freight", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "ENS", remarks: "Per BL", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "ISPS", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Seal Fee", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
  ]);

  const [destinationCharges, setDestinationCharges] = useState([
    { description: "Destination Terminal Handling Charges", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "BL Fee", remarks: "Per BL", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Delivery by Barge/Road", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Delivery Order Fees", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "Handling Charges", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "T1 Doc", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
    { description: "LOLO Charges", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
  ]);

  const [suppliers, setSuppliers] = useState(["", "", "", "", "", ""]);

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
  const [totalA, setTotalA] = useState(["", "", "", "", "", ""]);
  const [totalB, setTotalB] = useState(["", "", "", "", "", ""]);
  const [totalC, setTotalC] = useState(["", "", "", "", "", ""]);
  const [total, setTotal] = useState(["", "", "", "", "", ""]);

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

  const fetchQuotationData = async (locationCode, month, year, contFeet) => {
    try {
      const response = await fetch("/api/prints/ExportFCL", {
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
          cont_ft: contFeet,
        }),
      });

      const data = await response.json();

      console.log("Fetched Data : ", data);
      if (data.length <= 0) {
        setOriginCharges(originCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" })));
        setSeaFreightCharges(seaFreightCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" })));
        setDestinationCharges(destinationCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" })));
        setSuppliers(["", "", "", "", "", ""]);
        setTotalA(["", "", "", "", "", ""]);
        setTotalB(["", "", "", "", "", ""]);
        setTotalC(["", "", "", "", "", ""]);
        setTotal(["", "", "", "", "", ""]);
        return
      }
      if (data && data.length > 0) {
        const updatedOriginCharges = [...originCharges];
        const updatedSeaFreightCharges = [...seaFreightCharges];
        const updatedDestinationCharges = [...destinationCharges];

        if (contFeet === 20) {
          setSuppliers([
            data.find(item => item.Attribute === "Vendor_Name").Supplier_1,
            data.find(item => item.Attribute === "Vendor_Name").Supplier_2,
            data.find(item => item.Attribute === "Vendor_Name").Supplier_3,,
            "",
            "",
            "",
          ]);
          updatedOriginCharges[0].sc1 = data.find(item => item.Attribute === "O_CCD").Supplier_1 || "";
          updatedOriginCharges[1].sc1 = data.find(item => item.Attribute === "O_LTG").Supplier_1 || "";
          updatedOriginCharges[2].sc1 = data.find(item => item.Attribute === "O_THC").Supplier_1 || "";
          updatedOriginCharges[3].sc1 = data.find(item => item.Attribute === "O_BLC").Supplier_1 || "";
          updatedOriginCharges[4].sc1 = data.find(item => item.Attribute === "O_LUS").Supplier_1 || "";
          updatedOriginCharges[5].sc1 = data.find(item => item.Attribute === "O_Halt").Supplier_1 || "";

          updatedSeaFreightCharges[0].sc1 = data.find(item => item.Attribute === "S_SeaFre").Supplier_1 || "";
          updatedSeaFreightCharges[1].sc1 = data.find(item => item.Attribute === "S_ENS").Supplier_1 || "";
          updatedSeaFreightCharges[2].sc1 = data.find(item => item.Attribute === "S_ISPS").Supplier_1 || "";
          updatedSeaFreightCharges[3].sc1 = data.find(item => item.Attribute === "S_ITT").Supplier_1 || "";

          updatedDestinationCharges[0].sc1 = data.find(item => item.Attribute === "D_DTH").Supplier_1 || "";
          updatedDestinationCharges[1].sc1 = data.find(item => item.Attribute === "D_BLF").Supplier_1 || "";
          updatedDestinationCharges[2].sc1 = data.find(item => item.Attribute === "D_DBR").Supplier_1 || "";
          updatedDestinationCharges[3].sc1 = data.find(item => item.Attribute === "D_DOF").Supplier_1 || "";
          updatedDestinationCharges[4].sc1 = data.find(item => item.Attribute === "D_HC").Supplier_1 || "";
          updatedDestinationCharges[5].sc1 = data.find(item => item.Attribute === "D_TDO").Supplier_1 || "";
          updatedDestinationCharges[6].sc1 = data.find(item => item.Attribute === "D_LOC").Supplier_1 || "";

          updatedOriginCharges[0].sc2 = data.find(item => item.Attribute === "O_CCD").Supplier_2 || "";
          updatedOriginCharges[1].sc2 = data.find(item => item.Attribute === "O_LTG").Supplier_2 || "";
          updatedOriginCharges[2].sc2 = data.find(item => item.Attribute === "O_THC").Supplier_2 || "";
          updatedOriginCharges[3].sc2 = data.find(item => item.Attribute === "O_BLC").Supplier_2 || "";
          updatedOriginCharges[4].sc2 = data.find(item => item.Attribute === "O_LUS").Supplier_2 || "";
          updatedOriginCharges[5].sc2 = data.find(item => item.Attribute === "O_Halt").Supplier_2 || "";

          
          updatedSeaFreightCharges[0].sc2 = data.find(item => item.Attribute === "S_SeaFre").Supplier_2 || "";
          updatedSeaFreightCharges[1].sc2 = data.find(item => item.Attribute === "S_ENS").Supplier_2 || "";
          updatedSeaFreightCharges[2].sc2 = data.find(item => item.Attribute === "S_ISPS").Supplier_2 || "";
          updatedSeaFreightCharges[3].sc2 = data.find(item => item.Attribute === "S_ITT").Supplier_2 || "";

          updatedDestinationCharges[0].sc2 = data.find(item => item.Attribute === "D_DTH").Supplier_2 || "";
          updatedDestinationCharges[1].sc2 = data.find(item => item.Attribute === "D_BLF").Supplier_2 || "";
          updatedDestinationCharges[2].sc2 = data.find(item => item.Attribute === "D_DBR").Supplier_2 || "";
          updatedDestinationCharges[3].sc2 = data.find(item => item.Attribute === "D_DOF").Supplier_2 || "";
          updatedDestinationCharges[4].sc2 = data.find(item => item.Attribute === "D_HC").Supplier_2 || "";
          updatedDestinationCharges[5].sc2 = data.find(item => item.Attribute === "D_TDO").Supplier_2 || "";
          updatedDestinationCharges[6].sc2 = data.find(item => item.Attribute === "D_LOC").Supplier_2 || "";

          updatedOriginCharges[0].sc3 = data.find(item => item.Attribute === "O_CCD").Supplier_3 || "";
          updatedOriginCharges[1].sc3 = data.find(item => item.Attribute === "O_LTG").Supplier_3 || "";
          updatedOriginCharges[2].sc3 = data.find(item => item.Attribute === "O_THC").Supplier_3 || "";
          updatedOriginCharges[3].sc3 = data.find(item => item.Attribute === "O_BLC").Supplier_3 || "";
          updatedOriginCharges[4].sc3 = data.find(item => item.Attribute === "O_LUS").Supplier_3 || "";
          updatedOriginCharges[5].sc3 = data.find(item => item.Attribute === "O_Halt").Supplier_3 || "";

          
          updatedSeaFreightCharges[0].sc3 = data.find(item => item.Attribute === "S_SeaFre").Supplier_3 || "";
          updatedSeaFreightCharges[1].sc3 = data.find(item => item.Attribute === "S_ENS").Supplier_3 || "";
          updatedSeaFreightCharges[2].sc3 = data.find(item => item.Attribute === "S_ISPS").Supplier_3 || "";
          updatedSeaFreightCharges[3].sc3 = data.find(item => item.Attribute === "S_ITT").Supplier_3 || "";

          updatedDestinationCharges[0].sc3 = data.find(item => item.Attribute === "D_DTH").Supplier_3 || "";
          updatedDestinationCharges[1].sc3 = data.find(item => item.Attribute === "D_BLF").Supplier_3 || "";
          updatedDestinationCharges[2].sc3 = data.find(item => item.Attribute === "D_DBR").Supplier_3 || "";
          updatedDestinationCharges[3].sc3 = data.find(item => item.Attribute === "D_DOF").Supplier_3 || "";
          updatedDestinationCharges[4].sc3 = data.find(item => item.Attribute === "D_HC").Supplier_3 || "";
          updatedDestinationCharges[5].sc3 = data.find(item => item.Attribute === "D_TDO").Supplier_3 || "";
          updatedDestinationCharges[6].sc3 = data.find(item => item.Attribute === "D_LOC").Supplier_3 || "";

          setTotalA([
            data.find(item => item.Attribute === "O_Total_Chg").Supplier_1 || "",
            data.find(item => item.Attribute === "O_Total_Chg").Supplier_2 || "",
            data.find(item => item.Attribute === "O_Total_Chg").Supplier_3 || "",
            "",
            "",
            ""
          ])
          setTotalB([
            data.find(item => item.Attribute === "S_Total_Chg").Supplier_1 || "",
            data.find(item => item.Attribute === "S_Total_Chg").Supplier_2 || "",
            data.find(item => item.Attribute === "S_Total_Chg").Supplier_3 || "",
            "",
            "",
            ""
          ])
          setTotalC([
            data.find(item => item.Attribute === "D_Total_Chg").Supplier_1 || "",
            data.find(item => item.Attribute === "D_Total_Chg").Supplier_2 || "",
            data.find(item => item.Attribute === "D_Total_Chg").Supplier_3 || "",
            "",
            "",
            ""
          ])
          setTotal([
            data.find(item => item.Attribute === "Total_Ship_Cost").Supplier_1 || "",
            data.find(item => item.Attribute === "Total_Ship_Cost").Supplier_2 || "",
            data.find(item => item.Attribute === "Total_Ship_Cost").Supplier_3 || "",
            "",
            "",
            ""
          ])

        } else if (contFeet === 40) {
          setSuppliers((prev) => [
            prev[0],
            prev[1],
            prev[2],
            data.find(item => item.Attribute === "Vendor_Name").Supplier_1,
            data.find(item => item.Attribute === "Vendor_Name").Supplier_2,
            data.find(item => item.Attribute === "Vendor_Name").Supplier_3,
          ]);
          
          updatedOriginCharges[0].sc4 = data.find(item => item.Attribute === "O_CCD").Supplier_1 || "";
          updatedOriginCharges[1].sc4 = data.find(item => item.Attribute === "O_LTG").Supplier_1 || "";
          updatedOriginCharges[2].sc4 = data.find(item => item.Attribute === "O_THC").Supplier_1 || "";
          updatedOriginCharges[3].sc4 = data.find(item => item.Attribute === "O_BLC").Supplier_1 || "";
          updatedOriginCharges[4].sc4 = data.find(item => item.Attribute === "O_LUS").Supplier_1 || "";
          updatedOriginCharges[5].sc4 = data.find(item => item.Attribute === "O_Halt").Supplier_1 || "";

          
          updatedSeaFreightCharges[0].sc4 = data.find(item => item.Attribute === "S_SeaFre").Supplier_1 || "";
          updatedSeaFreightCharges[1].sc4 = data.find(item => item.Attribute === "S_ENS").Supplier_1 || "";
          updatedSeaFreightCharges[2].sc4 = data.find(item => item.Attribute === "S_ISPS").Supplier_1 || "";
          updatedSeaFreightCharges[3].sc4 = data.find(item => item.Attribute === "S_ITT").Supplier_1 || "";

          updatedDestinationCharges[0].sc4 = data.find(item => item.Attribute === "D_DTH").Supplier_1 || "";
          updatedDestinationCharges[1].sc4 = data.find(item => item.Attribute === "D_BLF").Supplier_1 || "";
          updatedDestinationCharges[2].sc4 = data.find(item => item.Attribute === "D_DBR").Supplier_1 || "";
          updatedDestinationCharges[3].sc4 = data.find(item => item.Attribute === "D_DOF").Supplier_1 || "";
          updatedDestinationCharges[4].sc4 = data.find(item => item.Attribute === "D_HC").Supplier_1 || "";
          updatedDestinationCharges[5].sc4 = data.find(item => item.Attribute === "D_TDO").Supplier_1 || "";
          updatedDestinationCharges[6].sc4 = data.find(item => item.Attribute === "D_LOC").Supplier_1 || "";

          updatedOriginCharges[0].sc5 = data.find(item => item.Attribute === "O_CCD").Supplier_2 || "";
          updatedOriginCharges[1].sc5 = data.find(item => item.Attribute === "O_LTG").Supplier_2 || "";
          updatedOriginCharges[2].sc5 = data.find(item => item.Attribute === "O_THC").Supplier_2 || "";
          updatedOriginCharges[3].sc5 = data.find(item => item.Attribute === "O_BLC").Supplier_2 || "";
          updatedOriginCharges[4].sc5 = data.find(item => item.Attribute === "O_LUS").Supplier_2 || "";
          updatedOriginCharges[5].sc5 = data.find(item => item.Attribute === "O_Halt").Supplier_2 || "";

          
          updatedSeaFreightCharges[0].sc5 = data.find(item => item.Attribute === "S_SeaFre").Supplier_2 || "";
          updatedSeaFreightCharges[1].sc5 = data.find(item => item.Attribute === "S_ENS").Supplier_2 || "";
          updatedSeaFreightCharges[2].sc5 = data.find(item => item.Attribute === "S_ISPS").Supplier_2 || "";
          updatedSeaFreightCharges[3].sc5 = data.find(item => item.Attribute === "S_ITT").Supplier_2 || "";

          updatedDestinationCharges[0].sc5 = data.find(item => item.Attribute === "D_DTH").Supplier_2 || "";
          updatedDestinationCharges[1].sc5 = data.find(item => item.Attribute === "D_BLF").Supplier_2 || "";
          updatedDestinationCharges[2].sc5 = data.find(item => item.Attribute === "D_DBR").Supplier_2 || "";
          updatedDestinationCharges[3].sc5 = data.find(item => item.Attribute === "D_DOF").Supplier_2 || "";
          updatedDestinationCharges[4].sc5 = data.find(item => item.Attribute === "D_HC").Supplier_2 || "";
          updatedDestinationCharges[5].sc5 = data.find(item => item.Attribute === "D_TDO").Supplier_2 || "";
          updatedDestinationCharges[6].sc5 = data.find(item => item.Attribute === "D_LOC").Supplier_2 || "";

          updatedOriginCharges[0].sc6 = data.find(item => item.Attribute === "O_CCD").Supplier_3 || "";
          updatedOriginCharges[1].sc6 = data.find(item => item.Attribute === "O_LTG").Supplier_3 || "";
          updatedOriginCharges[2].sc6 = data.find(item => item.Attribute === "O_THC").Supplier_3 || "";
          updatedOriginCharges[3].sc6 = data.find(item => item.Attribute === "O_BLC").Supplier_3 || "";
          updatedOriginCharges[4].sc6 = data.find(item => item.Attribute === "O_LUS").Supplier_3 || "";
          updatedOriginCharges[5].sc6 = data.find(item => item.Attribute === "O_Halt").Supplier_3 || "";

          
          updatedSeaFreightCharges[0].sc6 = data.find(item => item.Attribute === "S_SeaFre").Supplier_3 || "";
          updatedSeaFreightCharges[1].sc6 = data.find(item => item.Attribute === "S_ENS").Supplier_3 || "";
          updatedSeaFreightCharges[2].sc6 = data.find(item => item.Attribute === "S_ISPS").Supplier_3 || "";
          updatedSeaFreightCharges[3].sc6 = data.find(item => item.Attribute === "S_ITT").Supplier_3 || "";

          updatedDestinationCharges[0].sc6 = data.find(item => item.Attribute === "D_DTH").Supplier_3 || "";
          updatedDestinationCharges[1].sc6 = data.find(item => item.Attribute === "D_BLF").Supplier_3 || "";
          updatedDestinationCharges[2].sc6 = data.find(item => item.Attribute === "D_DBR").Supplier_3 || "";
          updatedDestinationCharges[3].sc6 = data.find(item => item.Attribute === "D_DOF").Supplier_3 || "";
          updatedDestinationCharges[4].sc6 = data.find(item => item.Attribute === "D_HC").Supplier_3 || "";
          updatedDestinationCharges[5].sc6 = data.find(item => item.Attribute === "D_TDO").Supplier_3 || "";
          updatedDestinationCharges[6].sc6 = data.find(item => item.Attribute === "D_LOC").Supplier_3 || "";

          setTotalA((prev) =>[
            prev[0],
            prev[1],
            prev[2],
            data.find(item => item.Attribute === "O_Total_Chg").Supplier_1 || "",
            data.find(item => item.Attribute === "O_Total_Chg").Supplier_2 || "",
            data.find(item => item.Attribute === "O_Total_Chg").Supplier_3 || "",
          ])
          setTotalB((prev) =>[
            prev[0],
            prev[1],
            prev[2],
            data.find(item => item.Attribute === "S_Total_Chg").Supplier_1 || "",
            data.find(item => item.Attribute === "S_Total_Chg").Supplier_2 || "",
            data.find(item => item.Attribute === "S_Total_Chg").Supplier_3 || "",
          ])
          setTotalC((prev) =>[
            prev[0],
            prev[1],
            prev[2],
            data.find(item => item.Attribute === "D_Total_Chg").Supplier_1 || "",
            data.find(item => item.Attribute === "D_Total_Chg").Supplier_2 || "",
            data.find(item => item.Attribute === "D_Total_Chg").Supplier_3 || "",
          ])
          setTotal((prev) =>[
            prev[0],
            prev[1],
            prev[2],
            data.find(item => item.Attribute === "Total_Ship_Cost").Supplier_1 || "",
            data.find(item => item.Attribute === "Total_Ship_Cost").Supplier_2 || "",
            data.find(item => item.Attribute === "Total_Ship_Cost").Supplier_3 || "",
          ])
        }

        setOriginCharges(updatedOriginCharges);
        setSeaFreightCharges(updatedSeaFreightCharges);
        setDestinationCharges(updatedDestinationCharges);
      } else {
        setOriginCharges(originCharges.map((item) => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" })));
        setSeaFreightCharges(seaFreightCharges.map((item) => ({ ...item, sc1: "", sc2: "" })));
        setDestinationCharges(destinationCharges.map((item) => ({ ...item, sc1: "" })));
      }
    } catch (error) {
      console.error("Error fetching quotation data:", error);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      setOriginCharges(originCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" })));
      setSeaFreightCharges(seaFreightCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" })));
      setDestinationCharges(destinationCharges.map(item => ({ ...item, sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" })));
      setSuppliers(["", "", "", "", "", ""]);
      setTotalA(["", "", "", "", "", ""]);
      setTotalB(["", "", "", "", "", ""]);
      setTotalC(["", "", "", "", "", ""]);
      setTotal(["", "", "", "", "", ""]);
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
        acc[20] += parseFloat(charge.sc1 || 0);
        acc[40] += parseFloat(charge.sc4 || 0);
        return acc;
      },
      { 20: 0, 40: 0 }
    );
  };

  const totalOrigin = calculateTotal(originCharges);
  const totalSeaFreight = calculateTotal(seaFreightCharges);
  const totalDestination = calculateTotal(destinationCharges);

  const totalShipmentCost = {
    20: (totalOrigin[20] + totalSeaFreight[20] + totalDestination[20]).toFixed(2),
    40: (totalOrigin[40] + totalSeaFreight[40] + totalDestination[40]).toFixed(2),
  };
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const startDate = selectedDate.startOf("month").format("DD");
    const endDate = selectedDate.endOf("month").format("DD");
    const selectedMonthYear = selectedDate.format("MMMM YYYY");

    const tableHeaders = [
        [
            { content: "S.No", rowSpan: 2, styles: { valign: "middle" } },
            { content: "Descriptions", rowSpan: 2, styles: { valign: "middle" }  },
            { content: "Currency in", rowSpan: 2, styles: { valign: "middle" }  },
            { content: "20 ft", colSpan: 3, styles: { halign: "center" } },
            { content: "40 ft", colSpan: 3, styles: { halign: "center" } },
            { content: "Remarks", rowSpan: 2, styles: { valign: "middle" }  },
        ],
        [suppliers[0], suppliers[1], suppliers[2], suppliers[3], suppliers[4], suppliers[5]],
    ];

    const tableBody = [];

    const addSectionHeader = (sectionName) => {
        tableBody.push([
            { content: sectionName, colSpan: 10, styles: { halign: "left", fontStyle: "bold", fillColor: [230, 230, 230] } }
        ]);
    };

    const addChargesToBody = (charges, currency) => {
        charges.forEach((charge, index) => {
            tableBody.push([
                index + 1,
                charge.description,
                `${currency} / Shipment`,
                ...[charge.sc1, charge.sc2, charge.sc3, charge.sc4, charge.sc5, charge.sc6].map(val => 
                    ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })
                ),
                charge.remarks,
            ]);
        });
    };

    addSectionHeader("A) ORIGIN CHARGES");
    addChargesToBody(originCharges, "INR");
    tableBody.push([
        "",
        { content: "Total Origin Charges (INR)", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
        ...totalA.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
        "",
    ]);

    addSectionHeader("B) SEA FREIGHT CHARGES");
    addChargesToBody(seaFreightCharges, "USD");
    tableBody.push([
        "",
        { content: "Total Sea Freight Charges (INR)", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
        ...totalB.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
        "",
    ]);

    addSectionHeader("C) DESTINATION CHARGES");
    addChargesToBody(destinationCharges, currency);
    tableBody.push([
        "",
        { content: "Total Destination Charges ("+currency+")", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
        ...totalC.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
        "",
    ]);

    tableBody.push([
        "",
        { content: "TOTAL SHIPMENT COST (A + B + C)", colSpan: 2, styles: { halign: "center", fontStyle: "bold" } },
        ...total.map(val => ({ content: (val === 0 || val === '0.00' || val === '0' || val === 0.00) ? "" : val || "", styles: { halign: "center" } })),
        "",
    ]);

    tableBody.push([{ content: "INCO Term", colSpan: 3, styles: { fontStyle: "bold" } }, { content: incoterms, colSpan: 7 }]);
    
    const maxDeliveryAddressLength = 50;
    const truncatedDeliveryAddress = deliveryAddress.length > maxDeliveryAddressLength 
        ? deliveryAddress.substring(0, maxDeliveryAddressLength) + '...' 
        : deliveryAddress;

    const cleanedDeliveryAddress = deliveryAddress.replace(/\n/g, " ");

    tableBody.push([
        { content: "Delivery Address", colSpan: 3, styles: { fontStyle: "bold" } },
        { content: cleanedDeliveryAddress, colSpan: 7, styles: { whiteSpace: "nowrap", fontSize: 7 } }
    ]);
    tableBody.push([{ content: "FX Rate", colSpan: 3, styles: { fontStyle: "bold" } }, 
        { content: "USD", styles: { halign: "center" } }, 
        { content: USD.toFixed(2), colSpan: 2, styles: { halign: "center" } }, 
        { content: "EURO", styles: { halign: "center" } }, 
        { content: EUR.toFixed(2), colSpan: 3, styles: { halign: "center" } }]); 
    tableBody.push([{ content: "Destination Port", colSpan: 3, styles: { fontStyle: "bold" } }, 
        { content: Dest_Port, colSpan: 2 }, 
        { content: "Required Transit Days", colSpan: 2, styles: { fontStyle: "bold" } }, 
        { content: transitDays, colSpan: 3 }]);
    tableBody.push([{ content: "Remarks", colSpan: 3, styles: { fontStyle: "bold" } }, { content: '', colSpan: 7 }]);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Comparative Statement of Quotations", 5, 10, { align: "left" });

    doc.setFontSize(8);
    doc.text(`RFQ Export rates for ${selectedMonthYear} (${startDate}.${selectedMonthYear} - ${endDate}.${selectedMonthYear})`, 5, 14, { align: "left" });
    doc.text(`Quote for GTI to ${locationName} shipment`, 5, 18, { align: "left" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("We are following 'IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit'", 5, 22, { align: "left" });
    doc.setFontSize(8);
    
    let dateTextWidth = doc.getStringUnitWidth(`Date: ${formattedDate}`) * doc.internal.scaleFactor;
    let xPosition = doc.internal.pageSize.width - 10;
    doc.text(`Date: ${formattedDate}`, xPosition - dateTextWidth, 10);
    const approvalText = "Approved by:______________              Checked by:______________              Prepared by:______________              ";
    let approvalTextWidth = doc.getStringUnitWidth(approvalText) * doc.internal.scaleFactor;
    doc.text(approvalText, xPosition - approvalTextWidth - 5, 20);
    
    const startY = 24;

    doc.autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: startY,
        styles: { fontSize: 7, cellPadding: 1.2, overflow: "linebreak" },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontSize: 6, lineWidth: 0.02, }, 
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 60 },
            2: { cellWidth: 25 },
            3: { cellWidth: 27 },
            4: { cellWidth: 27 },
            5: { cellWidth: 27 },
            6: { cellWidth: 27 },
            7: { cellWidth: 27 },
            8: { cellWidth: 27 },
            9: { cellWidth: 30 },
        },
        margin: { left: 5, right: 5 },
        theme: "grid",
    });

    doc.text("GREENTECH INDUSTRIES Business @2023.04.03 by Muni Kranth.", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 8, { align: "center" });

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
                {`Export Print FCL rates for ${selectedDate.format("MMMM YYYY")} (${selectedDate.startOf("month").format("DD")}.${selectedDate.format("MMMM YYYY")} - ${selectedDate.endOf("month").format("DD")}.${selectedDate.format("MMMM YYYY")})`}
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
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">20 ft</th>
                <th colSpan="3" className="py-1 px-2 border border-[var(--bgBody)]">40 ft</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                <th className="py-1 px-2 border border-[var(--bgBody)]">{suppliers[0] || "Supplier 1"}</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">{suppliers[1] || "Supplier 2"}</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">{suppliers[2] || "Supplier 3"}</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">{suppliers[3] || "Supplier 4"}</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">{suppliers[4] || "Supplier 5"}</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">{suppliers[5] || "Supplier 6"}</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody3)]">
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("origin")}
              >
                <td>A.</td>
                <td colSpan="8" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} Origin Charges
                </td>
              </tr>
              {sections.origin &&
                originCharges.map((item, index) => (
                  <tr key={index} className="border border border-[var(--bgBody)]">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    <td className="py-1 px-3 border">{item.sc1}</td>
                    <td className="py-1 px-3 border">{item.sc2}</td>
                    <td className="py-1 px-3 border">{item.sc3}</td>
                    <td className="py-1 px-3 border">{item.sc4}</td>
                    <td className="py-1 px-3 border">{item.sc5}</td>
                    <td className="py-1 px-3 border">{item.sc6}</td>
                    <td className="py-1 px-3 border">{item.remarks}</td>
                  </tr>
                ))}
              {sections.origin && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Origin Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  <td className="py-1 px-3 border">{totalA[0] || ""}</td>
                  <td className="py-1 px-3 border">{totalA[1] || ""}</td>
                  <td className="py-1 px-3 border">{totalA[2] || ""}</td>
                  <td className="py-1 px-3 border">{totalA[3] || ""}</td>
                  <td className="py-1 px-3 border">{totalA[4] || ""}</td>
                  <td className="py-1 px-3 border">{totalA[5] || ""}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("seaFreight")}
              >
                <td>B.</td>
                <td colSpan="8" className="py-2 px-3 text-start flex items-center">
                  {sections.seaFreight ? "▼" : "▶"} Sea Freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                seaFreightCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 7}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td className="py-1 px-3 border">{item.sc1}</td>
                    <td className="py-1 px-3 border">{item.sc2}</td>
                    <td className="py-1 px-3 border">{item.sc3}</td>
                    <td className="py-1 px-3 border">{item.sc4}</td>
                    <td className="py-1 px-3 border">{item.sc5}</td>
                    <td className="py-1 px-3 border">{item.sc6}</td>
                    <td className="py-1 px-3 border">{item.remarks}</td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Sea Freight Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  <td className="py-1 px-3 border">{totalB[0] || ""}</td>
                  <td className="py-1 px-3 border">{totalB[1] || ""}</td>
                  <td className="py-1 px-3 border">{totalB[2] || ""}</td>
                  <td className="py-1 px-3 border">{totalB[3] || ""}</td>
                  <td className="py-1 px-3 border">{totalB[4] || ""}</td>
                  <td className="py-1 px-3 border">{totalB[5] || ""}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("destination")}
              >
                <td>C.</td>
                <td colSpan="8" className="py-2 px-3 text-start flex items-center">
                  {sections.destination ? "▼" : "▶"} Destination Charges
                </td>
              </tr>
              {sections.destination &&
                destinationCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 11}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">{currency} / Shipment</td>
                    <td className="py-1 px-3 border">{item.sc1}</td>
                    <td className="py-1 px-3 border">{item.sc2}</td>
                    <td className="py-1 px-3 border">{item.sc3}</td>
                    <td className="py-1 px-3 border">{item.sc4}</td>
                    <td className="py-1 px-3 border">{item.sc5}</td>
                    <td className="py-1 px-3 border">{item.sc6}</td>
                    <td className="py-1 px-3 border">{item.remarks}</td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Destination Charges</td>
                  <td className="py-1 px-3 border">INR</td>
                  <td className="py-1 px-3 border">{totalC[0] || ""}</td>
                  <td className="py-1 px-3 border">{totalC[1] || ""}</td>
                  <td className="py-1 px-3 border">{totalC[2] || ""}</td>
                  <td className="py-1 px-3 border">{totalC[3] || ""}</td>
                  <td className="py-1 px-3 border">{totalC[4] || ""}</td>
                  <td className="py-1 px-3 border">{totalC[5] || ""}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border">
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Shipment Cost in INR (A + B + C)</td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border">{total[0] || ""}</td>
                <td className="py-1 px-3 border">{total[1] || ""}</td>
                <td className="py-1 px-3 border">{total[2] || ""}</td>
                <td className="py-1 px-3 border">{total[3] || ""}</td>
                <td className="py-1 px-3 border">{total[4] || ""}</td>
                <td className="py-1 px-3 border">{total[5] || ""}</td>
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">INCO Term</td>
                <td colSpan="8" className="py-1 px-3 border text-left">{incoterms}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Delivery Address</td>             
                <td colSpan="8" className="py-1 px-3 border text-left" dangerouslySetInnerHTML={{ __html: deliveryAddress }} />
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">FX Rate</td>
                <td colSpan="2" className="py-1 px-3 border">USD</td>
                <td colSpan="2" className="py-1 px-3 border font-bold text-red-500 text-left">{USD}</td>
                <td colSpan="2" className="py-1 px-3 border">EURO</td>
                <td colSpan="2" className="py-1 px-3 border font-bold text-red-500 text-left">{EUR}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Required Transit Days</td>
                <td colSpan="8" className="py-1 px-3 border text-left">{transitDays}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Destination Port</td>
                <td colSpan="8" className="py-1 px-3 border text-left">{Dest_Port}</td>
              </tr>
              <tr>
                <td colSpan="2" className="py-1 px-3 border text-start">Remarks</td>
                <td colSpan="8" className="py-1 px-3 border text-left"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;