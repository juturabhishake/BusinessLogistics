"use client";

import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { handleLogin } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTheme } from "next-themes";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { FaSearch, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import './page.css';

const Page = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === secureLocalStorage.getItem("theme") || theme === "dark";
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("visualization");
  const [activeSubTab, setActiveSubTab] = useState("exportFCL");
  const [exportFCLChartData, setExportFCLChartData] = useState([]);
  const [importFCLChartData, setImportFCLChartData] = useState([]);
  const [exportLCLChartData, setExportLCLChartData] = useState([]);
  const [importLCLChartData, setImportLCLChartData] = useState([]);
  const [exportFCLData, setExportFCLData] = useState([]);
  const [exportLCLData, setExportLCLData] = useState([]);
  const [importFCLData, setImportFCLData] = useState([]);
  const [importLCLData, setImportLCLData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [currency, setCurrency] = useState("");
  const [locationCode, setLocationCode] = useState("");

  useEffect(() => {
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    if (check_sc === 'admin') {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const checkLogin = async () => {
      const user = secureLocalStorage.getItem("un");
      const email = secureLocalStorage.getItem("em");
      const password = secureLocalStorage.getItem("pw");
      if (!email || !password || !user) {
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
      const isAccess = await handleLogin(email, password);
      if (!isAccess) {
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
    };
    checkLogin();
  }, []);

  const fetchChartData = async (apiUrl, setChartData) => {
    try {
      const sc = secureLocalStorage.getItem("sc");
      if (!sc || !selectedDate) return;

      const quote_month = selectedDate.month() + 1;
      const quote_year = selectedDate.year();
   
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_month, quote_year, sc }),
      });

      const data = await response.json();
      const groupedData = {};

      data.forEach((curr) => {
        const location = curr.Location;
        const cbmKey = `${curr.CBM || curr.Cont_Feet}${curr.CBM ? "cbm" : "ft"}`;
        const totalCost = Number(curr.Total_Ship_Cost);        

        if (!groupedData[location]) {
          groupedData[location] = { Location: location };
        }

        if (curr.Type === "LCL") {
          if (curr.Cont_Feet === 20) {
            groupedData[location]["20ft"] = (groupedData[location]["20ft"] || 0) + totalCost;
          } else if (curr.Cont_Feet === 40) {
            groupedData[location]["40ft"] = (groupedData[location]["40ft"] || 0) + totalCost;
          } else if (curr.CBM >= 1 && curr.CBM <= 6) {
            groupedData[location][cbmKey] = (groupedData[location][cbmKey] || 0) + totalCost;
          }
        } else {
          groupedData[location][cbmKey] = (groupedData[location][cbmKey] || 0) + totalCost;
        }
      });

      setChartData(Object.values(groupedData));
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const fetchData = async (apiUrl, setData) => {
    try {
      const sc = secureLocalStorage.getItem("sc");
      const username = secureLocalStorage.getItem("un");
      const quote_month = selectedDate.month() + 1;
      const quote_year = selectedDate.year();

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote_month, quote_year, sc, username }),
      });

      const data = await response.json();
      setData(data); 
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchChartData("/api/dashboard/get_Export_FCL_Quote", setExportFCLChartData);
      fetchChartData("/api/dashboard/get_Import_FCL_Quote", setImportFCLChartData);
      fetchChartData("/api/dashboard/get_Export_LCL_Quote", setExportLCLChartData);
      fetchChartData("/api/dashboard/get_Import_LCL_Quote", setImportLCLChartData);
      fetchData("/api/dashboard/get_Export_FCL_Quote", setExportFCLData);
      fetchData("/api/dashboard/get_Export_LCL_Quote", setExportLCLData);
      fetchData("/api/dashboard/get_Import_FCL_Quote", setImportFCLData);
      fetchData("/api/dashboard/get_Import_LCL_Quote", setImportLCLData);
      
    }
  }, [selectedDate]);

  const fetchQuoteData = async () => {
    if (!selectedId) {
      console.error("fetchQuoteData called but selectedId is null.");
      return;
    }
  
    const quoteType = activeSubTab;
  
    try {
      const response = await fetch("/api/dashboard/get_quote_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId, quote: quoteType }),
      });
  
      const result = await response.json();
      if (result.success) {
        setModalData(result.data[0]);
        setLocationCode(result.data[0].Location_Code); 
        await fetchSupplierDetails(result.data[0].Location_Code);
        setIsAddModalOpen(true);
      } else {
        console.error("Error fetching quote data:", result);
      }
    } catch (error) {
      console.error("Error fetching quote data:", error);
    }
  };
  
  useEffect(() => {
    if (selectedId) {
      const fetchQuote = async () => {
        await fetchQuoteData();
      };
      fetchQuote();
    }
  }, [selectedId]);
  useEffect(() => {
    if (locationCode) {
      fetchSupplierDetails(locationCode);
    }
  }, [locationCode]);
    
  const handleRowClick = (id) => {
    if (!id) {
      console.error("ID is undefined. Cannot fetch quote data.");
      return;
    }
    setSelectedId(id);  
  };
  
  const chartConfig = {
    cbm: {
      label: "CBM",
      color: "hsl(var(--chart-1))",
    },
  };

  const charts = [
    { title: "Export FCL Data", data: exportFCLChartData },
    { title: "Import FCL Data", data: importFCLChartData },
    { title: "Export LCL Data", data: exportLCLChartData },
    { title: "Import LCL Data", data: importLCLChartData },
  ];

  const fullFormMapping = {
    "O_CCD": "Origin_Customs Clearance & Documentation",
    "O_LTG": "Origin_Local Transportation From GTI-Chennai",
    "O_THC": "Origin_Terminal Handling Charges",
    "O_BLC": "Origin_Bill of Lading Charges",
    "O_LUS": "OriginLoading/Unloading / SSR",
    "O_Halt": "Origin_Halting",
    "O_CFS": "Origin_CFS Charges (At Actual)",
    "O_Total_Chg": "Origin_Total_Charges",
    "S_SeaFre": "SeaFreight_Sea Freight",
    "S_ENS": "SeaFreight_ENS",
    "S_ISPS": "SeaFreight_ISPS",
    "S_ITT": "SeaFreight_Seal Fee",
    "S_Total_Chg": "SeaFreight_Total_Charges",
    "D_DTH": "Destination Terminal Handling Charges",
    "D_BLF": "Destination_BL Fee",
    "D_DBR": "Destination_Delivery by Barge/Road",
    "D_DOF": "Destination_Delivery Order Fees",
    "D_HC": "Destination_Handling Charges",
    "D_TDO": "Destination_T1 Doc",
    "D_LOC": "Destination_LOLO Charges",
    "D_Total_Chg": "Destination_Total_Charges",
    "D_CFS": "Destination_CFS Charges (At Actual)",
    "D_CCD": "Customs Clearance & Documentation",
    "D_LTG": "Local Transportation From GTI-Chennai",
    "D_THC": "Terminal Handling Charges",
    "D_BLC": "Bill of Lading Charges",
    "D_LUS": "Loading/Unloading / SSR",
    "D_Halt": "Halting",
    "D_CUC": "Customs Clearance Charges",
    "D_CCF": "CC Fee",
    "D_DOC": "D.O Charges per BL",
    "D_AAI": "AAI Charges",
    "D_LU" : "Loading/Unloading",
    "D_Del": "Delivery",
    "D_Total_Chg": "Total Destination Charges",
    "O_DTH": "Terminal Handling Charges",
    "O_BLF": "BL Fee",
    "O_DBR": "Delivery by Barge/Road",
    "O_DOF": "Delivery Order Fees",
    "O_HC": "Handling Charges",
    "O_TDO": "T1 Doc",
    "O_LOC": "LOLO Charges",
    "O_Total_Chg": "Total Origin Charges",
    "O_CC": "Custom Clearance",
    "O_CCF":"CC Fee",
    "O_DOC": "D.O Charges",
    "O_LU":"Loading/Unloading",
    "O_Del":"Delivery",
      "S_FSC":"FSC (Fuel Surcharge)",
      "S_SSC":"SSC"
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
        setCurrency(data.result[0].Currency);
        console.log("Supplier details fetched successfully:", currency, data.result[0].Currency);
      }
    } catch (error) {
      console.error("Error fetching supplier details:", error);
    }
  };
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-4 lg:space-y-0">
        <div className="items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="visualization">Visualization View</TabsTrigger>
              <TabsTrigger value="table">Table View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
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
                fontSize: "14px"
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--borderclr)"
              },
              "& .MuiSvgIcon-root": {
                color: "var(--borderclr)",
              },
            }}
            onChange={(newValue) => {
              setSelectedDate(newValue);
            }}
          />
        </LocalizationProvider>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="visualization">
          {charts.map((chart, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>{chart.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {chart.data.length > 0 ? (
                    <div className="overflow-x-auto w-full">
                      <ChartContainer 
                        config={chartConfig} 
                        className={`min-w-[700px] w-full h-[200px]`} 
                      >
                        <BarChart                      
                          height={200}
                          accessibilityLayer
                          data={chart.data}
                          barSize={30}
                          barGap={8}
                        >
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="Location"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            interval={0}
                            minTickGap={10}
                          />
                          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                          {Object.keys(chart.data[0] || {})
                            .filter((k) => k !== "Location")
                            .map((key, idx) => {
                              const colors = [                        
                                "#e76e51", "#2a9d90", "#f6a262",  "#76b5c5", "#e7c468","#154c79",
                                "#FF4500", "#eab676", "#eeeee4", "#FF6347"
                              ]; 
                              const barColor = colors[idx % colors.length]; 
                              return (
                                <Bar
                                  key={idx}
                                  dataKey={key}
                                  type="natural"
                                  fill={barColor}
                                  stroke={barColor}
                                  radius={4}
                                />
                              );
                            })}
                        </BarChart>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div>No data available for this chart.</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="table">
          <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
            <TabsList>
              <TabsTrigger value="exportFCL">E-FCL</TabsTrigger>
              <TabsTrigger value="importFCL">I-FCL</TabsTrigger>
              <TabsTrigger value="exportLCL">E-LCL</TabsTrigger>
              <TabsTrigger value="importLCL">I-LCL</TabsTrigger>
            </TabsList>

            <TabsContent value="exportFCL">
              <Table data={exportFCLData} handleRowClick={handleRowClick} />
            </TabsContent>
            <TabsContent value="importFCL">
              <Table data={importFCLData} handleRowClick={handleRowClick} />
            </TabsContent>
            <TabsContent value="exportLCL">
              <Table data={exportLCLData} handleRowClick={handleRowClick} />
            </TabsContent>
            <TabsContent value="importLCL">
              <Table data={importLCLData} handleRowClick={handleRowClick} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[70%] lg:w-[50%] h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Quote Details</h2>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(70vh-100px)]">
              {modalData && (
                <div className="space-y-4">
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-2">Origin Charges</h3>
                    <div className="space-y-2">
                      {Object.entries(modalData)
                        .filter(([key]) => key.startsWith("O_"))
                        .map(([key, value], index) => (
                          <div key={index} className="flex justify-between gap-[30%] py-1 border-b border-gray-300 dark:border-gray-600">
                            <span className="text-sm font-medium">{fullFormMapping[key] || key}</span>
                            <span className="text-sm">₹{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                      
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-2">Sea Freight Charges</h3>
                    <div className="space-y-2">
                      {Object.entries(modalData)
                        .filter(([key]) => key.startsWith("S_"))
                        .map(([key, value], index) => (
                          <div key={index} className="flex justify-between gap-[30%] py-1 border-b border-gray-300 dark:border-gray-600">
                            <span className="text-sm font-medium">{fullFormMapping[key] || key}</span>
                            <span className="text-sm">₹{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                      
                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-2">Destination Charges</h3>
                    <div className="space-y-2">
                      {Object.entries(modalData)
                        .filter(([key]) => key.startsWith("D_"))
                        .map(([key, value], index) => (
                          <div key={index} className="flex justify-between gap-[30%] py-1 border-b border-gray-300 dark:border-gray-600">
                            <span className="text-sm font-medium">{fullFormMapping[key] || key}</span>
                            <span className="text-sm">{currency==='USD' ? '$' : '€'}{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
                    <h3 className="font-semibold text-lg mb-2">Total Shipment Cost</h3>
                    <div className="space-y-2">
                      {Object.entries(modalData)
                        .filter(([key]) => key.startsWith("Total_Ship_Cost"))
                        .map(([key, value], index) => (
                          <div key={index} className="flex justify-between gap-[30%] py-1 border-b border-gray-300 dark:border-gray-600">
                            <span className="text-sm font-medium">{fullFormMapping[key] || key}</span>
                            <span className="text-sm">₹{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-500 text-white text-[10px] rounded hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Table = ({ data, handleRowClick }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortedData, setSortedData] = useState(data);
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = 'reset';
      }
    }
    setSortConfig({ key, direction });

    if (direction === 'reset') {
      setSortedData(data);
    } else {
      const sorted = [...sortedData].sort((a, b) => {
        if (a[key] < b[key]) {
          return direction === 'ascending' ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
      setSortedData(sorted);
    }
  };

  const filteredData = sortedData.filter(row => {
    return Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="bg-card p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-3 py-2 border rounded-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg bg-card text-foreground" 
          style={{ 
            tableLayout: "fixed",
            fontSize: "13px", 
            padding: "1px",
            whiteSpace: "nowrap", 
            overflow: "hidden",   
            textOverflow: "ellipsis", 
          }}>
          <thead className="bg-muted">
            <tr>
              {data.length > 0 && Object.keys(data[0]).map((key, index) => (
                <th key={index} className="cursor-pointer px-4 py-2 border" onClick={() => handleSort(key)}>
                  {key.toUpperCase()} 
                  {sortConfig && sortConfig.key === key ? (
                    sortConfig.direction === 'ascending' ? <FaSortUp className="inline" /> :
                    sortConfig.direction === 'descending' ? <FaSortDown className="inline" /> :
                    <FaSort className="inline" />
                  ) : (
                    <FaSort className="inline" />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, i) => {
                const rowId = row.id || row.ID || row.Id; 
                return (
                  <tr 
                    key={i} 
                    className="border hover:bg-muted cursor-pointer" 
                    onClick={() => handleRowClick(rowId)}
                  >
                    {Object.values(row).map((value, j) => (
                      <td key={j} className="px-4 py-2 border">
                        {j === 0 ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRowClick(rowId);
                            }}
                          >
                            {String(value)}
                          </button>
                        ) : (
                          String(value)
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} className="text-center py-4">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;