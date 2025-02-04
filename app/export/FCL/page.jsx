"use client";
import React, { useState, useEffect } from "react";
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
const QuotationTable = () => {
  const [currentDateInfo, setCurrentDateInfo] = useState("");
  const [sections, setSections] = useState({
    origin: false,
    seaFreight: false,
    destination: false,
  });
  const [saveState, setSaveState] = useState("idle");
  
  const [originCharges, setOriginCharges] = useState([
    { description: "Customs Clearance & Documentation", 20: "", 40: "", remarks: "Per Container" },
    { description: "Local Transportation From GTI-Chennai", 20: "", 40: "", remarks: "Per Container" },
    { description: "Terminal Handling Charges - Origin", 20: "", 40: "", remarks: "Per Container" },
    { description: "Bill of Lading Charges", 20: "", 40: "", remarks: "Per BL" },
    { description: "Loading/Unloading / SSR", 20: "", 40: "", remarks: "At Actual" },
    { description: "Halting", 20: "", 40: "", remarks: "INR 2300 Per Day" },
  ]);
  
  const [seaFreightCharges, setSeaFreightCharges] = useState([
    { description: "Sea Freight", 20: "", 40: "", remarks: "Per Container" },
    { description: "ENS", 20: "", 40: "", remarks: "Per BL" },
    { description: "ISPS", 20: "", 40: "", remarks: "Per Container" },
    { description: "IT Transmission", 20: "", 40: "", remarks: "Per Container" },
  ]);
  
  const [destinationCharges, setDestinationCharges] = useState([
    { description: "Destination Terminal Handling Charges", 20: "", 40: "", remarks: "Per Container" },
    { description: "BL Fee", 20: "", 40: "", remarks: "Per Container" },
    { description: "Delivery by Barge/Road", 20: "", 40: "", remarks: "Per Container" },
    { description: "Delivery Order Fees", 20: "", 40: "", remarks: "Per Container" },
    { description: "Handling Charges", 20: "", 40: "", remarks: "Per Container" },
    { description: "T1 Doc", 20: "", 40: "", remarks: "Per Container" },
    { description: "LOLO Charges", 20: "", 40: "", remarks: "Per Container" },
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
  const [deliveryAddress, setDeliveryAddress] = useState("");
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/get_locations');
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
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); 
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    
    const formattedDate = `${monthNames[currentMonth]} ${currentYear} - ${monthNames[currentMonth + 3]} ${currentYear}`;
    console.log(formattedDate);
    setCurrentDateInfo(formattedDate);
  }, []);
  // const handleSave = () => {
  //   setSaveState("saving");
  //   setTimeout(() => {
  //     setSaveState("saved");
  //     setTimeout(() => {
  //       setSaveState("idle");
  //     }, 5000);
  //   }, 2000);
  // };
  const handleSave = async () => {
    setSaveState("saving");
  
    const createQuoteData = (containerSize) => {
      return {
        supplierCode: "GTI", 
        locationCode: selectedLocation,
        quoteMonth: new Date().getMonth() + 1,
        quoteYear: new Date().getFullYear(),
        originData: originCharges.map(item => ({
          description: item.description,
          remarks: item.remarks,
          [containerSize]: item[containerSize],
        })),
        seaFreightData: seaFreightCharges.map(item => ({
          description: item.description,
          remarks: item.remarks,
          [containerSize]: item[containerSize],
        })),
        destinationData: destinationCharges.map(item => ({
          description: item.description,
          remarks: item.remarks,
          [containerSize]: item[containerSize],
        })),
        totalShipmentCost: {
          [containerSize]: totalShipmentCost[containerSize],
        },
        createdBy: localStorage.getItem('fullName'),
        Cont_Feet: `${containerSize} ft`, 
      };
    };
  
    const postQuoteData = async (quoteData) => {
      try {
        const response = await fetch('/api/SaveFCLQuote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(quoteData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to save quote');
        }
      } catch (error) {
        console.error("Error saving quote:", error);
        throw error;
      }
    };
  
    try {
      const quoteData20ft = createQuoteData(20);
      await postQuoteData(quoteData20ft);
  
      const quoteData40ft = createQuoteData(40);
      await postQuoteData(quoteData40ft);
  
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

  const handleOriginChange = (index, field, value) => {
    const updatedCharges = [...originCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setOriginCharges(updatedCharges);
  };

  const handleSeaFreightChange = (index, field, value) => {
    const updatedCharges = [...seaFreightCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setSeaFreightCharges(updatedCharges);
  };

  const handleDestinationChange = (index, field, value) => {
    const updatedCharges = [...destinationCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setDestinationCharges(updatedCharges);
  };

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
        acc[20] += parseFloat(charge[20]*USD || 0);
        acc[40] += parseFloat(charge[40]*USD || 0);
        return acc;
      },
      { 20: 0, 40: 0 }
    );
  };

  const totalOrigin = calculateTotal(originCharges);
  const totalSeaFreight = calculateUSDTotal(seaFreightCharges);
  const totalDestination = calculateUSDTotal(destinationCharges);

  const totalShipmentCost = {
    20: totalOrigin[20] + totalSeaFreight[20] + totalDestination[20],
    40: totalOrigin[40] + totalSeaFreight[40] + totalDestination[40],
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
        console.log("Supplier details fetched successfully:", data.result[0]);
      }
    } catch (error) {
      console.error("Error fetching supplier details:", error);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchSupplierDetails(selectedLocation);
    }
  }, [selectedLocation]);
  
  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
      <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Sea Freight RFQ - FCL IMPORT</h2>
              <p className="text-xs text-gray-400">"RFQ Import rates for Q2 20243 ({currentDateInfo})"</p>
              <p className="text-xs text-gray-400">We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"</p>
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
                <button
                  onClick={handleSave}
                  className="mt-0 lg:mt-0 flex items-center justify-center bg-[var(--buttonBg)] text-[var(--borderclr)] hover:bg-[var(--buttonBgHover)] text-sm px-3 py-3 rounded"
                  style={{ minWidth: "80px" }}
                >
                  {saveState === "idle" && <FiSave size={16} />}
                  {saveState === "saving" && <FiLoader size={16} className="animate-spin" />}
                  {saveState === "saved" && <FiCheck size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs">
            <thead className="bg-secondary text-[var(--buttonHover)] border border-[var(--bgBody)]">
              <tr>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Descriptions</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency in</th>
                <th colSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Quote for GTI to {locationName || "{select location}"} shipment</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                <th className="py-1 px-2 border border-[var(--bgBody)]">20 ft</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">40 ft</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody2)]">
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
                originCharges.map((item, index) => (
                  <tr key={index} className="border border border-[var(--bgBody)]">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right hover:border-gray-400"
                        value={item[20]}
                        onChange={(e) => handleOriginChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[40]}
                        onChange={(e) => handleOriginChange(index, 40, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleOriginChange(index, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              {sections.origin && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Origin Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">{totalOrigin[20]}</td>
                  <td className="py-1 px-3 border">{totalOrigin[40]}</td>
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
                    <td className="py-1 px-3 border">{index + 7}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[20]}
                        onChange={(e) => handleSeaFreightChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[40]}
                        onChange={(e) => handleSeaFreightChange(index, 40, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleSeaFreightChange(index, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Sea Freight Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">{totalSeaFreight[20]}</td>
                  <td className="py-1 px-3 border">{totalSeaFreight[40]}</td>
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
                    <td className="py-1 px-3 border">{index + 11}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[20]}
                        onChange={(e) => handleDestinationChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[40]}
                        onChange={(e) => handleDestinationChange(index, 40, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleDestinationChange(index, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Destination Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">{totalDestination[20]}</td>
                  <td className="py-1 px-3 border">{totalDestination[40]}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border">
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Shipment Cost in INR (A + B + C)</td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border">{totalShipmentCost[20]}</td>
                <td className="py-1 px-3 border">{totalShipmentCost[40]}</td>
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">INCO Term</td>
                <td colSpan="4" className="py-1 px-3 border">{incoterms}</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border  text-start">Delivery Address</td>
                <td colSpan="4" className="py-1 px-3 border">{deliveryAddress}</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">FX Rate</td>
                <td className="py-1 px-3 border">USD</td>
                <td className="py-1 px-3 border">{USD}</td>
                <td className="py-1 px-3 border">EURO</td>
                <td className="py-1 px-3 border">{EUR}</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Required Transit Days</td>
                <td colSpan="4" className="py-1 px-3 border">{transitDays}</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Remarks</td>
                <td colSpan="4" className="py-1 px-3 border">{Commodity}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;