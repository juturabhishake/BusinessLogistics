"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiFileText } from "react-icons/fi";
import { exportPuneAdminPdf } from "./generatePuneAdminPdf";

const PuneQuoteAdminView = () => {
  const [tableData, setTableData] = useState([]);
  const [vendorColumns, setVendorColumns] = useState([]);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear + 1);
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + 1 - i);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/Gen/Pune_Quote/get_admin', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year: selectedYear }),
        });
        const data = await response.json();

        if (data.result && data.result.length > 0) {
          const vendors = Object.keys(data.result[0]).filter(key => key !== 'Vehicle_Type' && key !== 'Currency');
          setVendorColumns(vendors);
          setTableData(data.result);
        } else {
          setVendorColumns([]);
          setTableData([]);
        }
      } catch (error) {
        console.error("Error fetching admin quotation data:", error);
        setVendorColumns([]);
        setTableData([]);
      }
    };

    fetchData();
  }, [selectedYear]);
  const totals = useMemo(() => {
    const vendorTotals = {};
    vendorColumns.forEach(vendor => {
      vendorTotals[vendor] = 0;
    });
    tableData.forEach(row => {
      vendorColumns.forEach(vendor => {
        vendorTotals[vendor] += parseFloat(row[vendor]) || 0;
      });
    });

    return vendorTotals;
  }, [tableData, vendorColumns]);
  const handleExportPdf = () => {
    exportPuneAdminPdf(tableData, vendorColumns, selectedYear);
  };

  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="card shadow rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-full flex flex-col mx-auto">
        <div className="flex flex-wrap gap-4 card-header p-4 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">GTI to Pune - Admin Comparative Statement</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comparative view of vendor quotations by year</p>
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
                {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <button
              onClick={handleExportPdf}
              disabled={tableData.length === 0}
              className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-all duration-300 disabled:bg-red-300 disabled:cursor-not-allowed"
            >
              <FiFileText className="mr-2" /> Export PDF
            </button>
          </div>
        </div>
        <div className="card-body flex-grow overflow-y-auto p-4">
          {tableData.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse border border-gray-300 dark:border-gray-600">
              <thead className="bg-gray-100 dark:bg-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-3 border border-gray-300 dark:border-gray-600">Vehicle Type</th>
                  <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">Currency</th>
                  {vendorColumns.map(vendor => (
                    <th key={vendor} className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">{vendor}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 font-bold">{row.Vehicle_Type}</td>
                    <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">{row.Currency}</td>
                    {vendorColumns.map(vendor => (
                      <td key={vendor} className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-right font-semibold">
                        {(parseFloat(row[vendor]) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold sticky bottom-0">
                <tr>
                  <td className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center" colSpan="2">
                    TOTAL
                  </td>
                  {vendorColumns.map(vendor => (
                    <td key={vendor} className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-right">
                      {(totals[vendor] || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No quotation data found for the selected year.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PuneQuoteAdminView;