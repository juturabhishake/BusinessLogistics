"use client";
import React, { useState, useEffect, useMemo } from "react";
import secureLocalStorage from "react-secure-storage";
import { FiFileText } from "react-icons/fi";
import { exportToPdf } from "./generatePdf";

const particularToColumnMap = {
  1: 'ICCF1CNTR', 2: 'ICCF2CNTR', 3: 'LAUC', 4: 'TCUT15MTI',
  5: 'TCUT22MTI', 6: 'TCUT28MTI', 7: 'ECPMOA', 8: 'FOC',
  9: 'TCUT1MTARTR', 10: 'TCUT2MTARTR', 11: 'TCUT5MTARTR', 12: 'TCUT7MTARTR',
  13: 'HC', 15: 'HSSAC', 16: 'MPSCA'
};

const columnToSnoMap = Object.fromEntries(Object.entries(particularToColumnMap).map(([sno, col]) => [col, parseInt(sno)]));

const initialTableData = [
  { sno: 1, particulars: 'IMPORT CLEARANCE CHARGES FOR 1st CNTR', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 2, particulars: 'IMPORT CLEARANCE CHARGES FOR 2nd CNTR', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 3, particulars: 'LOADING AND UNLOADING CHARGES', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 4, particulars: 'TRANSPORTATION CHARGES UP TO 15MT Incl.cont', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 5, particulars: 'TRANSPORTATION CHARGES UP TO 22MT Incl.cont', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 6, particulars: 'TRANSPORTATION CHARGES UP TO 28MT Incl.cont', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 7, particulars: 'EXTRA CHARGES PER MT OVER AND ABOVE', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 8, particulars: 'FLATRACK OPEN CONTAINER', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 9, particulars: 'TRANSPORTATION CHARGES UP TO 1MT ACCORDING TO RTO RESTRICTION', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 10, particulars: 'TRANSPORTATION CHARGES UP TO 2MT ACCORDING TO RTO RESTRICTION', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 11, particulars: 'TRANSPORTATION CHARGES UP TO 5MT ACCORDING TO RTO RESTRICTION', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 12, particulars: 'TRANSPORTATION CHARGES UP TO 7MT ACCORDING TO RTO RESTRICTION', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 13, particulars: 'HALTING CHARGES', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 14, particulars: 'ALL STATUTORY CHARGES DO,AAI,CMC,CFS,TRANSIT PASS, e.t.c...', currency: 'INR', ft20: 'AT ACTUAL', ft40: 'AT ACTUAL', lcl: 'AT ACTUAL', air: 'AT ACTUAL', isEditable: false },
  { sno: 15, particulars: 'HIGH SEAS SALE AMENDMENT CHARGES', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
  { sno: 16, particulars: 'MANIFEST / PORTCODE / SEZ CODE / AMENDMENT CHARGES', currency: 'INR', ft20: '', ft40: '', lcl: '', air: '', isEditable: true },
];

const ViewChennai = () => {
  const [tableData, setTableData] = useState(initialTableData);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear + 1);
  const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear + 1 - i);

  useEffect(() => {
    const fetchData = async () => {
      const sc = secureLocalStorage.getItem("sc");
      const un = secureLocalStorage.getItem("un");
      if (!sc || !un) return;

      try {
        const response = await fetch('/api/Gen/Chennai_Quote/View_Chennai_Quote', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sc, un, year: selectedYear }),
        });
        const data = await response.json();

        const newTableData = JSON.parse(JSON.stringify(initialTableData));
        if (data.result && data.result.length > 0) {
            data.result.forEach(pivotedRow => {
                const containerTypeKey = pivotedRow.Container_Type.toLowerCase();
                Object.entries(pivotedRow).forEach(([dbCol, value]) => {
                    const sno = columnToSnoMap[dbCol];
                    if(sno && value !== null){
                        const rowIndex = newTableData.findIndex(row => row.sno === sno);
                        if(rowIndex !== -1){
                            newTableData[rowIndex][containerTypeKey] = value;
                        }
                    }
                });
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

  const totals = useMemo(() => {
    return tableData.reduce((acc, row) => {
        if(row.isEditable){
            acc.ft20 += parseFloat(row.ft20) || 0;
            acc.ft40 += parseFloat(row.ft40) || 0;
            acc.lcl += parseFloat(row.lcl) || 0;
            acc.air += parseFloat(row.air) || 0;
        }
        return acc;
    }, { ft20: 0, ft40: 0, lcl: 0, air: 0 });
  }, [tableData]);

  const handleExportPdf = () => {
    exportToPdf(tableData, selectedYear);
  };

  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="card shadow rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-full flex flex-col">
        <div className="flex flex-wrap gap-2 card-header p-4 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">From Chennai to GTI CHA IMPORT QUOTATION (View)</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comparitive Statement of quotations</p>
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
              <FiFileText className="mr-2"/> Export PDF
            </button>
          </div>
        </div>
        <div className="card-body flex-grow overflow-y-auto">
          <table className="w-full min-w-[1000px] text-sm text-left">
            <thead className="bg-gray-100 dark:bg-gray-700 uppercase sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">S.NO</th>
                <th className="px-4 py-3 w-2/5">Particulars</th>
                <th className="px-4 py-3">Currency</th>
                <th className="px-4 py-3 text-right">20 FT</th>
                <th className="px-4 py-3 text-right">40 FT</th>
                <th className="px-4 py-3 text-right">LCL</th>
                <th className="px-4 py-3 text-right">AIR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tableData.map((row) => (
                <tr key={row.sno} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2 font-medium">{row.sno}</td>
                  <td className="px-4 py-2">{row.particulars}</td>
                  <td className="px-4 py-2">{row.currency}</td>
                  <td className="px-4 py-2 text-right">
                    <span className={`block pr-2 ${!row.isEditable ? 'text-yellow-500 dark:text-yellow-400 font-semibold' : ''}`}>
                      {row.ft20}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={`block pr-2 ${!row.isEditable ? 'text-yellow-500 dark:text-yellow-400 font-semibold' : ''}`}>
                      {row.ft40}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={`block pr-2 ${!row.isEditable ? 'text-yellow-500 dark:text-yellow-400 font-semibold' : ''}`}>
                      {row.lcl}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={`block pr-2 ${!row.isEditable ? 'text-yellow-500 dark:text-yellow-400 font-semibold' : ''}`}>
                      {row.air}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold sticky bottom-0 z-10">
                <tr>
                    <td className="px-4 py-3" colSpan="3">TOTAL</td>
                    <td className="px-4 py-3 text-right">{totals.ft20.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{totals.ft40.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{totals.lcl.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{totals.air.toFixed(2)}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewChennai;