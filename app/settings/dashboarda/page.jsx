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
  "D_CCD": "Destination_Customs Clearance & Documentation",
  "D_LTG": "Destination_Local Transportation From GTI-Chennai",
  "D_THC": "Destination_Terminal Handling Charges",
  "D_BLC": "Destination_Bill of Lading Charges",
  "D_LUS": "Destination_Loading/Unloading / SSR",
  "D_Halt": "Destination_Halting",
  "D_Total_Chg": "Destination_Total_Charges",
  "O_DTH": "Origin Terminal Handling Charges",
  "O_BLF": "Origin_BL Fee",
  "O_DBR": "Origin_Delivery by Barge/Road",
  "O_DOF": "Origin_Delivery Order Fees",
  "O_HC": "Origin_Handling Charges",
  "O_TDO": "Origin_T1 Doc",
  "O_LOC": "Origin_LOLO Charges",
  "O_Total_Chg": "Origin_Total_Charges"
};



const Page = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [activeTab, setActiveTab] = useState("exportFCL");
  const [exportFCLData, setExportFCLData] = useState([]);
  const [importFCLData, setImportFCLData] = useState([]);
  const [exportLCLData, setExportLCLData] = useState([]);
  const [importLCLData, setImportLCLData] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currency, setCurrency] = useState("");
  const [locationCode, setLocationCode] = useState("");

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

  useEffect(() => {
    let flag = false
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    flag = (check_sc === 'admin')
    console.log("is admin : ", isAdmin, flag, check_sc)
    if(!flag) {
      // secureLocalStorage.clear();
      window.location.href = "/";
    }
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

  const fetchQuoteData = async () => {
    if (!selectedId) {
      console.error("fetchQuoteData called but selectedId is null.");
      return;
    }

    const quoteType = activeTab; 

    try {
      const response = await fetch("/api/dashboard/get_quote_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId, quote: quoteType }), 
      });

      const result = await response.json();
      if (result.success) {
        setModalData(result.data[0]);
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
        await fetchSupplierDetails(locationCode);
      }
      fetchQuote();
    }
  }, [selectedId]);

  const handleRowClick = (id) => {
    if (!id) {
      console.error("ID is undefined. Cannot fetch quote data.");
      return;
    }
    setSelectedId(id);  
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
          <DataTable data={exportFCLData} selectedDate={selectedDate} handleRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="importFCL">
          <DataTable data={importFCLData} selectedDate={selectedDate} handleRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="exportLCL">
          <DataTable data={exportLCLData} selectedDate={selectedDate} handleRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="importLCL">
          <DataTable data={importLCLData} selectedDate={selectedDate} handleRowClick={handleRowClick} />
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

const DataTable = ({ data, selectedDate, handleRowClick }) => {
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
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;

    const startDate = selectedDate.startOf("month").format("DD");
    const endDate = selectedDate.endOf("month").format("DD");
    const selectedMonthYear = selectedDate.format("MMMM YYYY");
   
    const addHeader = (doc) => {
      doc.setFontSize(10);
      doc.text(`Export FCL Quote for ${selectedMonthYear} (${startDate}.${selectedMonthYear} - ${endDate}.${selectedMonthYear})`, 5, 5);
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
                key !== "id" && ( 
                  <th key={index} className="px-4 py-2 border">
                    {key.toUpperCase()} 
                  </th>
                )
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                const rowId = row.id || row.ID || row.Id;
                return (
                  <tr 
                    key={index} 
                    className="border hover:bg-muted cursor-pointer" 
                    onClick={() => handleRowClick(rowId)}
                  >
                    {Object.entries(row).map(([key, value], j) => (
                      key !== "id" && ( 
                        <td key={j} className="px-4 py-2 border">
                          {String(value)}
                        </td>
                      )
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={filteredData.length > 0 ? Object.keys(filteredData[0]).length - 1 : 1} className="text-center py-4">
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