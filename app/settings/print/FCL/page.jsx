"use client";
import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import secureLocalStorage from "react-secure-storage";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

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
    { description: "IT Transmission", remarks: "Per Container", sc1: "", sc2: "", sc3: "", sc4: "", sc5: "", sc6: "" },
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

      if (data && data.length > 0) {
        const fclData = data[0];

        originCharges.forEach((charge, index) => {
          charge.sc1 = fclData[`O_CCD_${contFeet}`] || "";
          charge.sc2 = fclData[`O_LTG_${contFeet}`] || "";
          charge.sc3 = fclData[`O_THC_${contFeet}`] || "";
          charge.sc4 = fclData[`O_BLC_${contFeet}`] || "";
          charge.sc5 = fclData[`O_LUS_${contFeet}`] || "";
          charge.sc6 = fclData[`O_Halt_${contFeet}`] || "";
        });

        seaFreightCharges.forEach((charge, index) => {
          charge.sc1 = fclData[`S_SeaFre_${contFeet}`] || "";
          charge.sc2 = fclData[`S_Total_Chg_${contFeet}`] || "";
        });

        destinationCharges.forEach((charge, index) => {
          charge.sc1 = fclData[`D_Total_Chg_${contFeet}`] || "";
        });

        setOriginCharges([...originCharges]);
        setSeaFreightCharges([...seaFreightCharges]);
        setDestinationCharges([...destinationCharges]);
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
      const month = selectedDate.month() + 1;
      const year = selectedDate.year();
      fetchQuotationData(selectedLocation, month, year, 20); 
      fetchQuotationData(selectedLocation, month, year, 40); 
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
        acc[40] += parseFloat(charge.sc2 || 0);
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

  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3 space-y-2">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-2">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Comparative Statement of quotations</h2>
              <p className="text-xs text-gray-100">"RFQ Import rates for {currentDateInfo}"</p>
              <p className="text-xs text-gray-100">Quote for GTI to {locationName || "{select location}"} shipment</p>
            </div>
            <div className="flex flex-row items-center justify-start lg:flex-row justify-end gap-4">
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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label={<span style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>Select Month and Year</span>}
                    views={["year", "month"]}
                    openTo="month"
                    value={selectedDate}
                    className="w-full md:w-60"
                    sx={{
                        "& .MuiInputBase-root": {
                          color: isDarkMode ? "#ffffff" : "#000000",
                          borderRadius: "8px",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: isDarkMode ? "#A0AEC0" : "#CBD5E0",
                        },
                        "& .MuiSvgIcon-root": {
                          color: isDarkMode ? "#ffffff" : "#000000",
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
          <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs">
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
                <th className="py-1 px-2 border border-[var(--bgBody)]">sc 1</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">sc 2</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">sc 3</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">sc 4</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">sc 5</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">sc 6</th>
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
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
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
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
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
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border">
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Shipment Cost in INR (A + B + C)</td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border"></td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;