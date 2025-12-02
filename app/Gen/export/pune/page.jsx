"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import secureLocalStorage from "react-secure-storage";
import { FiSave, FiCheck, FiLoader, FiPrinter } from "react-icons/fi";

const initialTableData = [
  { vehicleType: '20 FT (6 Tons)', currency: 'INR', rate: '' },
  { vehicleType: '32 FT SXL (7.5 Tons)', currency: 'INR', rate: '' },
  { vehicleType: '32 FT MXL (14 Tons)', currency: 'INR', rate: '' },
];

const PuneQuoteEntry = () => {
  const router = useRouter();
  const [tableData, setTableData] = useState(initialTableData);
  const [saveState, setSaveState] = useState("idle");
  const [vendorName, setVendorName] = useState("");
  const quoteYear = new Date().getFullYear() + 1;
  const [Yes, setYes] = useState("");
      useEffect(() => {
        const fetchCurrency = async () => {
          try {
            const response = await fetch('/api/Gen/get_yearly_cal');
            const data = await response.json();
            if (data.result && data.result.length > 0) {
              setYes(data.result[0].ISOK);           
            }
          } catch (error) {
            console.error("Error fetching currency:", error);
          }
        };
    
        fetchCurrency();
      }, []);
  useEffect(() => {
    const un = secureLocalStorage.getItem("un") || "Vendor";
    setVendorName(un);

    const fetchData = async () => {
      const sc = secureLocalStorage.getItem("sc");
      if (!sc || !un) return;

      try {
        const response = await fetch('/api/Gen/Pune_Quote/get', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sc, un, year: quoteYear }),
        });
        const data = await response.json();

        if (data.result && data.result.length > 0) {
          const newTableData = [...initialTableData];
          data.result.forEach(dbRow => {
            const rowIndex = newTableData.findIndex(row => row.vehicleType === dbRow.Vehicle_Type);
            if (rowIndex !== -1) {
              newTableData[rowIndex].rate = dbRow.Rate;
            }
          });
          setTableData(newTableData);
        }
      } catch (error) {
        console.error("Error fetching quotation data:", error);
      }
    };
    fetchData();
  }, [quoteYear]);

  const handleInputChange = (index, value) => {
    const updatedData = [...tableData];
    updatedData[index].rate = value;
    setTableData(updatedData);
  };

  const handleSave = async () => {
    setSaveState("saving");
    const sc = secureLocalStorage.getItem("sc");
    const un = secureLocalStorage.getItem("un");

    const savePromises = tableData.map(row => {
      const payload = {
        vehicleType: row.vehicleType,
        currency: row.currency,
        rate: parseFloat(row.rate) || 0,
        supplierCode: sc,
        createdBy: un,
        quoteYear: quoteYear,
      };
      return fetch("/api/Gen/Pune_Quote/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteData: payload }),
      });
    });

    try {
      const responses = await Promise.all(savePromises);
      const allOk = responses.every(res => res.ok);
      if (!allOk) throw new Error("One or more save operations failed.");
      setSaveState("saved");
    } catch (error) {
      console.error("Error saving data:", error);
      setSaveState("idle");
      alert("Error saving data. Please try again.");
    } finally {
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };
  const total = useMemo(() => {
    return tableData.reduce((acc, row) => {
      return acc + (parseFloat(row.rate) || 0);
    }, 0);
  }, [tableData]);
  const handlePrint = () => {
    router.push('/Gen/export/pune/print');
  };

  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="card shadow rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-full flex flex-col mx-auto">
        <div className="flex flex-wrap gap-2 card-header p-4 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">GTI to Pune Quotation Entry ({quoteYear})</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter rates for the upcoming year</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-all duration-300"
            >
              <FiPrinter className="mr-2" /> Print
            </button>
            {Yes !== "No" && (
            <button
              onClick={handleSave}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-all duration-300"
              style={{ minWidth: "100px" }}
              disabled={saveState !== 'idle'}
            >
              {saveState === "idle" && <><FiSave className="mr-2" /> Save</>}
              {saveState === "saving" && <><FiLoader className="animate-spin mr-2" /> Saving...</>}
              {saveState === "saved" && <><FiCheck className="mr-2" /> Saved!</>}
            </button>
            )}
          </div>
        </div>
        <div className="card-body flex-grow overflow-y-auto p-4">
          <table className="w-full text-sm text-left border-collapse border border-gray-300 dark:border-gray-600">
            <thead className="bg-gray-100 dark:bg-gray-700 uppercase">
              <tr>
                <th className="px-4 py-3 border border-gray-300 dark:border-gray-600">Vehicle Type</th>
                <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">Currency</th>
                <th className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-center">{vendorName}`s Quotes</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 font-bold">{row.vehicleType}</td>
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-center">{row.currency}</td>
                  <td className="px-4 py-2 border border-gray-300 dark:border-gray-600">
                    <input
                      type="number"
                      className="w-full bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      value={row.rate}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      placeholder="0.00"
                    />
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

export default PuneQuoteEntry;