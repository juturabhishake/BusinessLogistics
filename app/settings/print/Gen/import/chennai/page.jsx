"use client";
import React, { useState, useEffect, useMemo } from "react";
import { FiFileText, FiLoader } from "react-icons/fi";
import { exportAdminPdf } from "./ChennaiAdminPrintPdf";
import secureLocalStorage from "react-secure-storage";

const particularToColumnMap = {
  1: 'ICCF1CNTR', 2: 'ICCF2CNTR', 3: 'LAUC', 4: 'TCUT15MTI', 5: 'TCUT22MTI', 6: 'TCUT28MTI', 7: 'ECPMOA', 8: 'FOC',
  9: 'TCUT1MTARTR', 10: 'TCUT2MTARTR', 11: 'TCUT5MTARTR', 12: 'TCUT7MTARTR', 13: 'HC', 15: 'HSSAC', 16: 'MPSCA'
};
const columnToSnoMap = Object.fromEntries(Object.entries(particularToColumnMap).map(([sno, col]) => [col, parseInt(sno)]));

const initialParticulars = [
  { sno: 1, particulars: 'IMPORT CLEARANCE CHARGES FOR 1st CNTR', currency: 'INR' }, { sno: 2, particulars: 'IMPORT CLEARANCE CHARGES FOR 2nd CNTR', currency: 'INR' },
  { sno: 3, particulars: 'LOADING AND UNLOADING CHARGES', currency: 'INR' }, { sno: 4, particulars: 'TRANSPORTATION CHARGES UP TO 15MT Incl.cont', currency: 'INR' },
  { sno: 5, particulars: 'TRANSPORTATION CHARGES UP TO 22MT Incl.cont', currency: 'INR' }, { sno: 6, particulars: 'TRANSPORTATION CHARGES UP TO 28MT Incl.cont', currency: 'INR' },
  { sno: 7, particulars: 'EXTRA CHARGES PER MT OVER AND ABOVE', currency: 'INR' }, { sno: 8, particulars: 'FLATRACK OPEN CONTAINER', currency: 'INR' },
  { sno: 9, particulars: 'TRANSPORTATION CHARGES UP TO 1MT ACCORDING TO RTO RESTRICTION', currency: 'INR' }, { sno: 10, particulars: 'TRANSPORTATION CHARGES UP TO 2MT ACCORDING TO RTO RESTRICTION', currency: 'INR' },
  { sno: 11, particulars: 'TRANSPORTATION CHARGES UP TO 5MT ACCORDING TO RTO RESTRICTION', currency: 'INR' }, { sno: 12, particulars: 'TRANSPORTATION CHARGES UP TO 7MT ACCORDING TO RTO RESTRICTION', currency: 'INR' },
  { sno: 13, particulars: 'HALTING CHARGES', currency: 'INR' }, { sno: 14, particulars: 'ALL STATUTORY CHARGES DO,AAI,CMC,CFS,TRANSIT PASS, e.t.c...', currency: 'INR' },
  { sno: 15, particulars: 'HIGH SEAS SALE AMENDMENT CHARGES', currency: 'INR' }, { sno: 16, particulars: 'MANIFEST / PORTCODE / SEZ CODE / AMENDMENT CHARGES', currency: 'INR' },
];

const ChennaiAdminPrint = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()+1);
  const [allQuotes, setAllQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    if (check_sc !== 'admin') {
      window.location.href = "/account";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/Gen/Chennai_Quote/getChennaiQuoteAdmin', {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ year: selectedYear }),
        });
        const data = await response.json();
        setAllQuotes(data.result || []);
      } catch (error) {
        console.error("Error fetching quotation data:", error);
        setAllQuotes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const { vendors, transformedData } = useMemo(() => {
    if (!allQuotes) return { vendors: [], transformedData: initialParticulars };
    const uniqueVendors = [...new Set(allQuotes.map(q => q.Created_By))].sort();
    const dataMap = new Map(initialParticulars.map(p => [p.sno, { ...p }]));
    
    uniqueVendors.forEach(vendor => { dataMap.forEach((_, sno) => { dataMap.get(sno)[vendor] = { ft20: '', ft40: '', lcl: '', air: '' }; }); });

    allQuotes.forEach(pivotedRow => {
      const vendor = pivotedRow.Created_By; const containerTypeKey = pivotedRow.Container_Type.toLowerCase();
      Object.entries(pivotedRow).forEach(([dbCol, value]) => {
        const sno = columnToSnoMap[dbCol];
        if (sno && value !== null && dataMap.has(sno)) {
          const row = dataMap.get(sno);
          if (row[vendor]) { row[vendor][containerTypeKey] = (parseFloat(value) || 0).toFixed(2); }
        }
      });
    });
    return { vendors: uniqueVendors, transformedData: Array.from(dataMap.values()) };
  }, [allQuotes]);

  const totals = useMemo(() => {
    const vendorTotals = {};
    vendors.forEach(vendor => { vendorTotals[vendor] = { ft20: 0, ft40: 0, lcl: 0, air: 0 }; });
    transformedData.forEach(row => {
      if (row.sno !== 14) {
        vendors.forEach(vendor => {
          const vData = row[vendor] || {};
          vendorTotals[vendor].ft20 += parseFloat(vData.ft20) || 0;
          vendorTotals[vendor].ft40 += parseFloat(vData.ft40) || 0;
          vendorTotals[vendor].lcl += parseFloat(vData.lcl) || 0;
          vendorTotals[vendor].air += parseFloat(vData.air) || 0;
        });
      }
    });
    return vendorTotals;
  }, [transformedData, vendors]);

  const handleExportPdf = () => { exportAdminPdf(transformedData, vendors, selectedYear); };
  const yearOptions = Array.from({ length: 100 }, (_, i) => new Date().getFullYear()+1 - i);

  return (
    <div className="h-[calc(100vh-2rem)]">
      <div className="card shadow-xl rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-full flex flex-col">
        <div className="flex flex-wrap gap-4 card-header p-4 border-b border-gray-200 dark:border-gray-700 justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Chennai Import CHA - Comparative View</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comparing quotes from all vendors for the selected year.</p>
          </div>
          <div className="flex items-center gap-4">
            <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
              {yearOptions.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
            <button onClick={handleExportPdf} className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded transition-all duration-300">
              <FiFileText className=""/>
            </button>
          </div>
        </div>
        <div className="card-body flex-grow overflow-y-auto">
          {loading ? ( <div className="flex justify-center items-center h-full"><FiLoader className="animate-spin text-4xl text-blue-500" /></div> ) : 
           vendors.length === 0 ? (<div className="flex justify-center items-center h-full text-gray-500">No data available for the selected year.</div>) : (
            <table className="w-full min-w-[1200px] text-xs text-left border-collapse">
              <thead className="uppercase sticky top-[-1px] z-10">
                <tr>
                  <th rowSpan="2" className="px-2 py-3 border border-gray-300 dark:border-gray-600 text-center bg-gray-100 dark:bg-gray-700">S.NO</th>
                  <th rowSpan="2" className="px-2 py-3 border border-gray-300 dark:border-gray-600 w-1/4 bg-gray-100 dark:bg-gray-700">Particulars</th>
                  <th rowSpan="2" className="px-2 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">Currency</th>
                  {vendors.map(vendor => ( <th key={vendor} colSpan="4" className="px-2 py-3 text-center border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">{vendor.toUpperCase()}</th> ))}
                </tr>
                <tr>
                  {vendors.map(vendor => (
                    <React.Fragment key={vendor}>
                      <th className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">20 FT</th>
                      <th className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">40 FT</th>
                      <th className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">LCL</th>
                      <th className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">AIR</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transformedData.map((row) => (
                  <tr key={row.sno} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-2 py-2 font-medium border-l border-r border-gray-200 dark:border-gray-600 text-center">{row.sno}</td>
                    <td className="px-2 py-2 border-r border-gray-200 dark:border-gray-600">{row.particulars}</td>
                    <td className="px-2 py-2 border-r border-gray-200 dark:border-gray-600">{row.currency}</td>
                    {vendors.map(vendor => (
                      <React.Fragment key={vendor}>
                        {row.sno === 14 ? ( <td colSpan="4" className="px-2 py-2 text-center font-semibold text-yellow-500 dark:text-yellow-400 border-r border-gray-200 dark:border-gray-600">AT ACTUAL</td> ) : (
                          <>
                            <td className="px-2 py-2 text-right">{row[vendor]?.ft20}</td>
                            <td className="px-2 py-2 text-right">{row[vendor]?.ft40}</td>
                            <td className="px-2 py-2 text-right">{row[vendor]?.lcl}</td>
                            <td className="px-2 py-2 text-right border-r border-gray-200 dark:border-gray-600">{row[vendor]?.air}</td>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
               <tfoot className="font-bold sticky bottom-0 z-10">
                <tr>
                    <td className="px-2 py-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700" colSpan="3">TOTAL</td>
                    {vendors.map(vendor => (
                        <React.Fragment key={vendor}>
                            <td className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">{(totals[vendor]?.ft20 || 0).toFixed(2)}</td>
                            <td className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">{(totals[vendor]?.ft40 || 0).toFixed(2)}</td>
                            <td className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">{(totals[vendor]?.lcl || 0).toFixed(2)}</td>
                            <td className="px-2 py-3 text-right border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">{(totals[vendor]?.air || 0).toFixed(2)}</td>
                        </React.Fragment>
                    ))}
                </tr>
               </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChennaiAdminPrint;