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
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    if (check_sc !== 'admin') {
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
      fetchQuoteData();
    }
  }, [selectedId]);

  const handleRowClick = (id) => {
    if (!id) {
      console.error("ID is undefined. Cannot fetch quote data.");
      return;
    }
    setSelectedId(id);  
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
          <DataTable data={exportFCLData} handleRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="importFCL">
          <DataTable data={importFCLData} handleRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="exportLCL">
          <DataTable data={exportLCLData} handleRowClick={handleRowClick} />
        </TabsContent>
        <TabsContent value="importLCL">
          <DataTable data={importLCLData} handleRowClick={handleRowClick} />
        </TabsContent>
      </Tabs>

      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[60%] lg:w-[40%] h-[54vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Quote Details</h2>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(50vh-100px)]">
              {modalData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(modalData).map(([key, value], index) => (
                    <div key={index} className="col-span-1">
                      <label className="block text-sm font-semibold">{fullFormMapping[key] || key}</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={value}
                        readOnly
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end p-4 bg-gray-200 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
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

const DataTable = ({ data, handleRowClick }) => {
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
                <th key={index} className="px-4 py-2 border">
                  {key.toUpperCase()} 
                </th>
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

export default Page;