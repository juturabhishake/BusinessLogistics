"use client";
import React, { useState, useEffect, useMemo } from "react";
import secureLocalStorage from "react-secure-storage";
import { FiFileText } from "react-icons/fi";
import { exportMumbaiPdf } from "./generateMumbaiPdf";

const initialTableData = [
  { vehicleType: '20 FT (6 Tons)', currency: 'INR', rate: '' },
  { vehicleType: '32 FT SXL (7.5 Tons)', currency: 'INR', rate: '' },
  { vehicleType: '32 FT MXL (14 Tons)', currency: 'INR', rate: '' },
];

const MumbaiQuoteView = () => {
  const [tableData, setTableData] = useState(initialTableData);
  const [vendorName, setVendorName] = useState("");
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear + 1);
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + 1 - i);

  useEffect(() => {
    const un = secureLocalStorage.getItem("un") || "Vendor";
    setVendorName(un);

    const fetchData = async () => {
      const sc = secureLocalStorage.getItem("sc");
      if (!sc || !un) return;

      try {
        const response = await fetch('/api/Gen/Mumbai_Quote/get', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sc, un, year: selectedYear }),
        });
        const data = await response.json();
        
        const newTableData = JSON.parse(JSON.stringify(initialTableData));

        if (data.result && data.result.length > 0) {
          data.result.forEach(dbRow => {
            const rowIndex = newTableData.findIndex(row => row.vehicleType === dbRow.Vehicle_Type);
            if (rowIndex !== -1) {
              newTableData[rowIndex].rate = dbRow.Rate;
            }
          });
        }
        setTableData(newTableData);
      } catch (error) {
        console.error("Error fetching quotation data:", error);
        setTableData(initialTableData);
      }
    };

    fetchData();
  }, [selectedYear]);
  const total = useMemo(() => {
    return tableData.reduce((acc, row) => {
      return acc + (parseFloat(row.rate) || 0);
    }, 0);
  }, [tableData]);
  const handleExportPdf = () => {
    exportMumbaiPdf(tableData, selectedYear);
  };

  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="card shadow rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-full flex flex-col mx-auto">
        <div className="flex flex-wrap gap-4 card-header p-4 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Mumbai to GTI Quotation (View)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">View and export quotations by year</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="year-select" className="sr-only">Select Year</label>
              <select
                id="year-select"
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExportPdf}
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all duration-300"
            >
              <FiFileText className="mr-2" /> Export PDF
            </button>
          </div>
        </div>
        <div className="card-body flex-grow overflow-y-auto p-4">
          <table className="w-full text-sm text-left border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 border border-gray-300 dark:border-gray-600">Vehicle Type</th>
                <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">Currency</th>
                <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">{vendorName}`s Quote</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 font-bold">{row.vehicleType}</td>
                  <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">{row.currency}</td>
                  <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-right font-semibold">
                    {(parseFloat(row.rate) || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold sticky bottom-0">
              <tr>
                <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center" colSpan="2">
                  TOTAL
                </td>
                <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-right">
                  {total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MumbaiQuoteView;