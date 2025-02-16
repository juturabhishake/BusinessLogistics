"use client";

import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { handleLogin } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, CartesianGrid, XAxis, Area } from "recharts";
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
  const isDarkMode = theme === "dark";
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("visualization");
  const [activeSubTab, setActiveSubTab] = useState("exportFCL");
  const [exportFCLChartData, setExportFCLChartData] = useState([]);
  const [importFCLChartData, setImportFCLChartData] = useState([]);
  const [exportLCLChartData, setExportLCLChartData] = useState([]);
  const [importLCLChartData, setImportLCLChartData] = useState([]);

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
        const location = curr.Location_Code;
        const cbmKey = `${curr.CBM || curr.Cont_Feet}${curr.CBM ? "cbm" : "ft"}`;
        const totalCost = curr.Total_Ship_Cost;

        if (!groupedData[location]) {
          groupedData[location] = { Location_Code: location };
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

  useEffect(() => {
    if (selectedDate) {
      fetchChartData("/api/dashboard/get_Export_FCL_Quote", setExportFCLChartData);
      fetchChartData("/api/dashboard/get_Import_FCL_Quote", setImportFCLChartData);
      fetchChartData("/api/dashboard/get_Export_LCL_Quote", setExportLCLChartData);
      fetchChartData("/api/dashboard/get_Import_LCL_Quote", setImportLCLChartData);
    }
  }, [selectedDate]);

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

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-wrap items-center justify-between mb-4 space-y-4 lg:space-y-0">
        {/* <h2 className="text-lg font-bold px-2">Hi {String(secureLocalStorage.getItem("un"))} !! </h2> */}
        <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="visualization">Visualization View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>  </Tabs>
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={
                <span style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                  Select Month and Year
                </span>
              }
              views={["year", "month"]}
              value={selectedDate}
              className="w-60"
              sx={{
                "& .MuiInputBase-root": {
                  // backgroundColor: isDarkMode ? "#2D3748" : "#ffffff",
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
              onChange={(newValue) => {
                setSelectedDate(newValue);
              }}
          />
        </LocalizationProvider>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* <TabsList>
          <TabsTrigger value="visualization">Visualization View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList> */}

        <TabsContent value="visualization">
          {charts.map((chart, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle>{chart.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {chart.data.length > 0 ? (
                    <ChartContainer config={chartConfig}>
                      <AreaChart data={chart.data} margin={{ left: 12, right: 12 }} height={150}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="Location_Code" tickLine={false} axisLine={false} tickMargin={8} />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                        {Object.keys(chart.data[0] || {})
                        .filter((k) => k !== "Location_Code")
                        .map((key, idx) => (
                          <Area
                            key={idx}
                            dataKey={key}
                            type="natural"
                            fill={`hsl(var(--chart-${idx + 1}))`}
                            fillOpacity={0.4}
                            stroke={`hsl(var(--chart-${idx + 1}))`}
                            stackId="a"
                          />
                        ))}
                      </AreaChart>
                    </ChartContainer>
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
              <Table data={exportFCLChartData} />
            </TabsContent>
            <TabsContent value="importFCL">
              <Table data={importFCLChartData} />
            </TabsContent>
            <TabsContent value="exportLCL">
              <Table data={exportLCLChartData} />
            </TabsContent>
            <TabsContent value="importLCL">
              <Table data={importLCLChartData} />
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Table = ({ data }) => {
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

      {/* Scrollable container for the table */}
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
              filteredData.map((row, i) => (
                <tr key={i} className="border hover:bg-muted">
                  {Object.values(row).map((value, j) => (
                    <td key={j} className="px-4 py-2 border">{String(value)}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={data.length > 0 ? Object.keys(data[0]).length : 1} className="text-center py-4">No matching records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;