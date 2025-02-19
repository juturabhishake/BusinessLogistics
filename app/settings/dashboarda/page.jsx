"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import secureLocalStorage from "react-secure-storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { FaSearch, FaSortUp, FaSortDown, FaSort, FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx"; // For Excel export
import jsPDF from "jspdf"; // For PDF export
import "jspdf-autotable"; // For PDF table generation

const Page = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("exportFCL");
  const [exportFCLData, setExportFCLData] = useState([]);
  const [importFCLData, setImportFCLData] = useState([]);
  const [exportLCLData, setExportLCLData] = useState([]);
  const [importLCLData, setImportLCLData] = useState([]);

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
    };
    checkLogin();
  }, []);

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
      setData(data); // Set the data directly
      console.log("API Data:", data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchData("/api/admindashboard/get_Admin_E_FLC", setExportFCLData);
      fetchData("/api/admindashboard/get_Admin_I_FLC", setImportFCLData);
      fetchData("/api/admindashboard/get_Admin_E_LCL", setExportLCLData);
      fetchData("/api/admindashboard/get_Admin_I_LCL", setImportLCLData);
    }
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 space-y-6">
        <div className="order-1 sm:order-2 w-full md:w-auto">
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
        <div className="order-2 sm:order-1 w-full md:w-auto mb-4 md:mb-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="exportFCL">E-FCL</TabsTrigger>
              <TabsTrigger value="importFCL">I-FCL</TabsTrigger>
              <TabsTrigger value="exportLCL">E-LCL</TabsTrigger>
              <TabsTrigger value="importLCL">I-LCL</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="exportFCL">
          <DataTable data={exportFCLData} />
        </TabsContent>
        <TabsContent value="importFCL">
          <DataTable data={importFCLData} />
        </TabsContent>
        <TabsContent value="exportLCL">
          <DataTable data={exportLCLData} />
        </TabsContent>
        <TabsContent value="importLCL">
          <DataTable data={importLCLData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const DataTable = ({ data }) => {
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

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, "data.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [Object.keys(filteredData[0] || {}).map(key => key.toUpperCase())],
      body: filteredData.map(row => Object.values(row)),
    });
    doc.save("data.pdf");
  };

  return (
    <div className="bg-card p-4 rounded-lg shadow-lg">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 space-y-2">
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
        <div className="flex space-x-2">
          <button onClick={exportToExcel} className="flex items-center px-4 py-2 bg-green-500 text-white rounded">
            <FaFileExcel className="mr-2" /> Excel
          </button>
          <button onClick={exportToPDF} className="flex items-center px-4 py-2 bg-red-500 text-white rounded">
            <FaFilePdf className="mr-2" /> PDF
          </button>
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
              {sortedData.length > 0 && Object.keys(sortedData[0]).map((key, index) => (
                <th key={index} className="px-4 py-2 border"
                //  onClick={() => handleSort(key)}
                >
                  {key.toUpperCase()} 
                  {/* {sortConfig && sortConfig.key === key ? (
                    sortConfig.direction === 'ascending' ? <FaSortUp className="inline" /> :
                    sortConfig.direction === 'descending' ? <FaSortDown className="inline" /> :
                    <FaSort className="inline" />
                  ) : (
                    <FaSort className="inline" />
                  )} */}
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
                <td colSpan={sortedData.length > 0 ? Object.keys(sortedData[0]).length : 1} className="text-center py-4">No matching records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;