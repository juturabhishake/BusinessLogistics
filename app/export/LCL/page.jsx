"use client";
import React, { useState } from "react";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";

const QuotationTable = () => {
  const [sections, setSections] = useState({
    origin: true,
    seaFreight: true,
    destination: true,
  });
  const [saveState, setSaveState] = useState("idle");

  const handleSave = () => {
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setTimeout(() => {
        setSaveState("idle");
      }, 5000);
    }, 2000);
  };

  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h2 className="text-sm font-bold">Comparative Statement of Quotations</h2>
              <p className="mt-1 text-xs">
                <span>RFQ Export rates for January'2025</span>
                <br />
                <span>We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"</span>
              </p>
            </div>
            <button
              onClick={handleSave}
              className="mt-2 lg:mt-0 flex items-center justify-center text-[var(--borderclr)] bg-[var(--buttonBg)] hover:bg-[var(--buttonBgHover)] text-sm px-3 py-2 rounded"
              style={{ minWidth: "80px" }}
            >
              {saveState === "idle" && <FiSave size={16} />}
              {saveState === "saving" && <FiLoader size={16} className="animate-spin" />}
              {saveState === "saved" && <FiCheck size={16} />}
            </button>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <table className="table-auto border-[var(--primary)] text-center w-full min-w-[800px] text-xs">
            <thead className="bg-secondary text-[var(--buttonHover)] border border-[var(--bgBody)]">
              <tr>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">S.No</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] w-[240px]">Sea Export</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)] w-[130px]">Forwarders</th>
                <th colSpan="6" className="py-1 px-2 border border-[var(--bgBody)]">Quote for GTI to Hungary LCL shipment</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[100px]">1 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[100px]">2 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[100px]">3 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[100px]">4 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[100px]">5 CBM</th>
                <th className="py-1 px-2 border border-[var(--bgBody)] w-[100px]">6 CBM</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody2)]">
              <tr className="font-bold bg-[var(--bgBody)] border">
                <td>A</td>
                <td colSpan="9" className="py-2 px-3 text-start">Origin Charges</td>
              </tr>
              {["Customs Clearance & Documentation", "Local Transportation From GTI-Chennai", "Terminal Handling Charges - Origin", "Bill of Lading Charges", "Loading/Unloading / SSR", "CFS AT ACTUAL"].map((item, index) => (
                <tr key={index} className="border">
                  <td className="py-1 px-3 border">{index + 1}</td>
                  <td className="py-1 px-3 border text-start">{item}</td>
                  <td className="py-1 px-3 border">INR / Shipment</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder={item === "CFS AT ACTUAL" ? "At Actual" : ""} /></td>
                </tr>
              ))}
              <tr className="border font-bold">
                <td colSpan="3" className="py-1 px-3 border">Total Origin Cost in INR</td>
                {[...Array(6)].map((_, i) => (
                  <td key={i} className="py-1 px-3 border">
                    <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                  </td>
                ))}
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr className="font-bold bg-[var(--bgBody)] border">
                <td>B</td>
                <td colSpan="9" className="py-2 px-3 text-start">Sea Freight Charges</td>
              </tr>
              {["Sea Freight", "FSC (Fuel Surcharge)"].map((item, index) => (
                <tr key={index} className="border">
                  <td className="py-1 px-3 border">{index + 7}</td>
                  <td className="py-1 px-3 border text-start">{item}</td>
                  <td className="py-1 px-3 border">USD / Shipment</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
                </tr>
              ))}
              <tr className="border font-bold">
                <td colSpan="3" className="py-1 px-3 border">Total Sea Freight Cost in INR</td>
                {[...Array(6)].map((_, i) => (
                  <td key={i} className="py-1 px-3 border">
                    <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                  </td>
                ))}
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr className="font-bold bg-[var(--bgBody)] border">
                <td>C</td>
                <td colSpan="9" className="py-2 px-3 text-start">Destination Charges</td>
              </tr>
              {["Custom Clearance", "CC Fee", "D.O Charges per BL", "AAI Charges", "Loading/Unloading", "Delivery"].map((item, index) => (
                <tr key={index} className="border">
                  <td className="py-1 px-3 border">{index + 9}</td>
                  <td className="py-1 px-3 border text-start">{item}</td>
                  <td className="py-1 px-3 border">EURO / Shipment</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
                </tr>
              ))}
              <tr className="border font-bold">
                <td colSpan="3" className="py-1 px-3 border text-start">Total Destination Cost in INR</td>
                {[...Array(6)].map((_, i) => (
                  <td key={i} className="py-1 px-3 border">
                    <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                  </td>
                ))}
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr className="border font-bold">
                <td colSpan="3" className="py-1 px-3 border text-start">Total Shipment Cost in INR (A+B+C)</td>
                {[...Array(6)].map((_, i) => (
                  <td key={i} className="py-1 px-3 border">
                    <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                  </td>
                ))}
                <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">INCO Term:</td>
                <td colSpan="7" className="py-1 px-3 border">DAP</td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Delivery Address:</td>
                <td colSpan="7" className="py-1 px-3 border">SONIAMA KFT VAMHAZ UT1 H-8053 BODAJK HUNGARY</td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">FX Rate:</td>
                <td className="py-1 px-3 border">USD</td>
                <td className="py-1 px-3 border">84</td>
                <td className="py-1 px-3 border">EURO</td>
                <td colSpan="4" className="py-1 px-3 border">93</td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Required Transit Days:</td>
                <td colSpan="7" className="py-1 px-3 border ">64 days</td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Estimated Transit Days Given by Forwarder:</td>
                <td colSpan="7" className="py-1 px-3 border"></td>
              </tr>
              <tr className="border">
                <td colSpan="3" className="py-1 px-3 border text-start">Remarks:</td>
                <td colSpan="7" className="py-1 px-3 border"></td>
              </tr>
            </tbody>
          </table>
          <div className="text-xs text-center py-1 pt-3">GREENTECH INDUSTRIES Business @2023.04.03 by Muni Kranth.</div> 
        </div>
        
      </div>
    </div>
  );
};

export default QuotationTable;
