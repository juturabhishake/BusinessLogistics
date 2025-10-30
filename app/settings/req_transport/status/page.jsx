"use client";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaEdit, FaTrash,FaEye } from "react-icons/fa";
import secureLocalStorage from "react-secure-storage";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
const TransportRequestsStatusTable = () => {
  const [data, setData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [saveState, setSaveState] = useState("idle");
  const [deleteState, setDeleteState] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
const [selectedDate, setSelectedDate] = useState(); 
  const fetchData = async () => {
    try {
      const month = selectedDate ? selectedDate.month() + 1 : new Date().getMonth() + 1;
      const year = selectedDate ? selectedDate.year() : new Date().getFullYear();
        const response = await fetch('/api/req_transport/get_TransportRequests_MY',{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Month: month,Year :  year}),
      });
      const result = await response.json();
      setData(result.result || []);
      setOriginalData(result.result || []);
    } catch (error) {
      console.error(error.message);
    }
  };
  useEffect(() => {
    const check_sc = secureLocalStorage.getItem("sc");
    const isAdminUser = check_sc === 'admin';
    setIsAdmin(isAdminUser);
    if (!isAdminUser) {
      window.location.href = "/";
    } else {
      fetchData();
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
      fetchData();
    }, [selectedDate]);
    

  const columnKeyMap = {
    "Request Date": "Request_Date",
    "Transport Type": "Transport_Type",
    "Shipment Type": "Shipment_Type",
    "Container Size": "Container_Size",    
    "From": "From_Location_Name",
    "To": "To_Location_Name",    
    "Created By": "Created_By",
    "uploadedPdf": "UploadedPDF",
    "Received Quotes": "Received_Quote",
  };

  const handleSort = (column) => {
    const key = columnKeyMap[column];
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      setSortConfig({ key: null, direction: null });
      setData(originalData);
      return;
    }
    setSortConfig({ key, direction });
    const sortedData = [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
          : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
      } else {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });
    setData(sortedData);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = rowsPerPage === "All" ? filteredData : filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (row) => {
    setEditRow(row);
    setFormData({ ...row });
    setIsModalOpen(true);
  };




  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-1 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full p-0 rounded-t-lg">
              <div>
                <h2 className="text-sm font-bold">Admin Settings / <span className="text-xs text-gray-100">Transport Request Status</span></h2>
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
          <div className="p-4 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span style={{ fontSize: "14px" }}>Show</span>
                <select
                  style={{ fontSize: "14px" }}
                  className="border p-0 rounded bg-secondary"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(e.target.value === "All" ? "All" : parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                 
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="All">All</option>
                </select>
                <span style={{ fontSize: "14px" }}>entries</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-2 top-2 text-muted-foreground" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg bg-card text-foreground"
                style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                  
                    {Object.keys(columnKeyMap).map((key) => (
                      <th key={key} onClick={() => handleSort(key)} className="cursor-pointer px-4 py-2 border text-left">
                        {key.toUpperCase()}{" "}
                        {sortConfig.key === columnKeyMap[key] ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12px" }}>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.ID} className="border hover:bg-muted">
                     
                        {Object.values(columnKeyMap).map((key) => (
                          <td key={key} className="px-4 py-2 border">
                            {(() => {
                              const value = item[key];
                              if (key === 'Request_Date') {
                                return value ? new Date(value).toLocaleDateString('en-GB') : 'N/A';
                              }
                              if (key === 'UploadedPDF' && value) {
                                const fileName = value.split('/').pop();
                                return (
                                  <a 
                                    href={value} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-500 hover:underline"
                                  >
                                    {fileName}
                                  </a>
                                );
                              }
                              return value ?? 'N/A';
                            })()}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={Object.keys(columnKeyMap).length + 1} className="text-center py-4">No results found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between items-center mt-4 space-y-2">
              <div style={{ fontSize: "14px" }}>
                Showing {filteredData.length > 0 ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, filteredData.length)} of ${filteredData.length} entries` : "0 entries"}
              </div>
              <div className="flex space-x-1" style={{fontSize:"14px"}}>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>{"<<"}</button>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>{"<"}</button>
                  <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>{">"}</button>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>{">>"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default TransportRequestsStatusTable;