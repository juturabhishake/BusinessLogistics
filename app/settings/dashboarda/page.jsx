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
import * as XLSX from "xlsx"; 
import jsPDF from "jspdf";
import "jspdf-autotable"; 

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
      setData(data); 
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

  // const exportToExcel = () => {
  //   const worksheet = XLSX.utils.json_to_sheet(filteredData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  //   XLSX.writeFile(workbook, "data.xlsx");
  // };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    
    // Apply header styles
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } } };
    const borderStyle = { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };

    // Get column keys
    const columns = Object.keys(filteredData[0] || {});

    // Apply styles to headers
    columns.forEach((key, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: index });
      if (!ws[cellRef]) ws[cellRef] = {};
      ws[cellRef].s = headerStyle;
    });

    // Apply borders and adjust column width
    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell) cell.s = borderStyle;
      }
    }

    // Auto fit column width
    ws["!cols"] = columns.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quote Data");
    XLSX.writeFile(wb, "data.xlsx");
  };

  const exportToPDF = () => {   
    const doc = new jsPDF({ orientation: "landscape" });

   
    const addHeader = (doc) => {
      doc.setFontSize(10);
      doc.text(`Export FCL Quote for the Month:`, 5, 5);
  };
   
  const addFooter = (doc) => {
    const pageWidth = doc.internal.pageSize.width;
    const footerText = "Greentech Industries (India) Pvt. Ltd.";
    const textWidth = doc.getTextWidth(footerText);
    const xPosition = (pageWidth - textWidth) / 2; // Center align footer
    const yPosition = doc.internal.pageSize.height - 8; // Bottom margin
    doc.text(footerText, xPosition, yPosition);
};

    const headers = Object.keys(filteredData[0] || {}).map(key => key.toUpperCase());

    // Numeric columns that should be right-aligned
    const numericColumns = ["TOTAL_SHIPMENT_COST", "ORIGIN_CHARGES", "SEAFREIGHT_CHARGES", "DESTINATION_CHARGES"];

    // Get the index of numeric columns
    const numericColumnIndexes = headers
      .map((header, index) => numericColumns.includes(header.replace(/\s+/g, "_")) ? index : -1)
      .filter(index => index !== -1);

      const formatNumber = (num) => {
        return typeof num === "number" ? num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : num;
      };
    
      const formattedBody = filteredData.map(row => 
        Object.values(row).map((value, index) => numericColumnIndexes.includes(index) ? formatNumber(value) : value)
      );

    doc.autoTable({
      head: [headers],
      body: formattedBody,
      startY: 8, // Reduced top margin
      margin: { top: 8, left: 5, right: 5 },
      styles: { fontSize: 9},
      headStyles: { 
        fillColor: [204, 229, 252], 
        textColor: [0, 0, 0], 
        // fontStyle: "bold", 
        lineWidth: 0.1, // Ensure header grid lines
        lineColor: [0, 0, 0] // Black border for the header
      },
      columnStyles: numericColumnIndexes.reduce((acc, index) => {
        acc[index] = { halign: "right" }; 
        return acc;
      }, {}),
      theme: "grid",
      didDrawPage: (data) => {
        addHeader(doc);
        addFooter(doc);
    },
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
            filteredData.map((item, index) => (
              <tr key={index} className="border hover:bg-muted">
                {Object.keys(item).map((key) => (
                  <td key={key} className="px-4 py-2 border">
                    {/* Format currency fields */}
                    {["Total_Shipment_Cost", "Origin_Charges", "Seafreight_Charges", "Destination_Charges"].includes(key) ? (
                      <div style={{ textAlign: "right" }}>
                        {parseFloat(item[key]).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    ) : (
                      String(item[key]) // Convert all values to strings for safety
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={filteredData.length > 0 ? Object.keys(filteredData[0]).length : 1} className="text-center py-4">
                No results found.
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