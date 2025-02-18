"use client";
import { useState, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useTheme } from "next-themes";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";



const LOCMaster = () => {
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { theme } = useTheme();
  const isDarkMode = theme === secureLocalStorage.getItem("theme") || theme === "dark";
  const [isAdmin, setIsAdmin] = useState(false);

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
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admindashboard/get_Admin_E_FLC", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote_month: "2", quote_year: "2025", sc: "df", Loc_Code: "SUMUSA", Cont_ft: "20" }),
        });

        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        setData(result);
        setOriginalData(result);
      } catch (error) {
        console.error(error.message);
        setData([]); // Ensure state is never undefined
      }
    };

    fetchData();
  }, []);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      setSortConfig({ key: null, direction: null });
      setData(originalData);
      return;
    }
    setSortConfig({ key, direction });

    const sortedData = [...data].sort((a, b) =>
      direction === "asc" ? String(a[key]).localeCompare(String(b[key])) : String(b[key]).localeCompare(String(a[key]))
    );
    setData(sortedData);
  };

  // 📌 Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Apply header styles
    const headerStyle = { font: { bold: true }, fill: { fgColor: { rgb: "FFFF00" } } };
    const borderStyle = { border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } } };

    // Get column keys
    const columns = Object.keys(data[0] || {});

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
    XLSX.utils.book_append_sheet(wb, ws, "LOCMaster");
    XLSX.writeFile(wb, "LOCMaster.xlsx");
  };

  // 📌 Export to PDF with Landscape Mode
  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(12);
    doc.text("LOCMaster Report", 5, 5);

    const tableColumn = Object.keys(data[0] || {});
    const tableRows = data.map((row) => tableColumn.map((key) => row[key]));

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 10,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 152, 219], textColor: [255, 255, 255], fontStyle: "bold" }, // Blue header
      theme: "striped",
    });

    doc.save("LOCMaster.pdf");
  };

  return (
    <div className="">
    <div className="card shadow rounded-lg bg-[var(--bgBody)]">
      <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-3 px-3">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
         

          <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={
                <span style={{ color: isDarkMode ? "#ffffff" : "#000000" }}>
                  Select Month and Year
                </span>
              }
              views={["year", "month"]}
              openTo="month" 
              //  format="MMM YYYY"
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
          {/* 📌 Export Buttons */}
          <div className="flex space-x-3">
            <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-2 rounded-md flex items-center">
              <FaFileExcel className="mr-2" /> Export Excel
            </button>
            <button onClick={exportToPDF} className="bg-red-600 text-white px-3 py-2 rounded-md flex items-center">
              <FaFilePdf className="mr-2" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="card-body p-0 overflow-x-auto pb-3">
      <div className="p-4 bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-lg bg-card text-foreground" style={{ tableLayout: "fixed", fontSize: "13px", whiteSpace: "nowrap" }}>
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                {data.length > 0 &&
                  Object.keys(data[0]).map((key) => (
                    <th key={key}  className="px-4 py-2 border text-left">
                      {key.toUpperCase()} 
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody style={{ fontSize: "12px" }}>
              {data.length > 0 ? (
                data.map((item, index) => (
                    <tr key={index}  className="border hover:bg-muted">
                    {Object.keys(item).map((key) => (
                      <td
                        key={key}
                        className={`px-4 py-2 border`}
                      >
                          {/* Check if the key is "TOTAL_SHIPMENT_COST" and the value is a number */}
            {key === "Total_Shipment_Cost" || key === "Origin_Charges" || key === "Seafreight_Charges" || key === "Destination_Charges" ? (   
                            
                            <div style={{textAlign: "right" }}>
                            {parseFloat(item[key]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
            ) : (               
                item[key] // If not the key, just render the value as is
            )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="100%" className="text-center py-4">No results found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LOCMaster;
