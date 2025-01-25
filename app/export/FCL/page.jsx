"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";

const QuotationTable = () => {
  const [sections, setSections] = useState({
    origin: false,
    seaFreight: false,
    destination: false,
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

  const toggleSection = (section) => {
    setSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-2 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div>
              <h2 className="text-sm font-bold">Comparative Statement of Quotations</h2>
              <p className="mt-1 text-xs">
                <span>RFQ Export rates for January 2025</span>
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
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Descriptions</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Currency in</th>
                <th colSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Quote for GTI to Chicago USA shipment</th>
                <th rowSpan="2" className="py-1 px-2 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr>
                <th className="py-1 px-2 border border-[var(--bgBody)]">20 ft</th>
                <th className="py-1 px-2 border border-[var(--bgBody)]">40 ft</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody2)]">
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("origin")}
              >
                <td colSpan="6" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} A. Origin Charges
                </td>
              </tr>
              {sections.origin &&
                [
                  { description: "Customs Clearance & Documentation", remarks: "Per Container" },
                  { description: "Local Transportation From GTI-Chennai", remarks: "Per Container" },
                  { description: "Terminal Handling Charges - Origin", remarks: "Per Container" },
                  { description: "Bill of Lading Charges", remarks: "Per BL" },
                  { description: "Loading/Unloading / SSR", remarks: "At Actual" },
                  { description: "Halting", remarks: "INR 2300 Per Day" },
                ].map((item, index) => (
                  <tr key={index} className="border border border-[var(--bgBody)]">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" />
                    </td>
                    <td className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" />
                    </td>
                    <td className="py-1 px-3 border">{item.remarks}</td>
                  </tr>
                ))}
              {sections.origin && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Origin Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">0</td>
                  <td className="py-1 px-3 border">0</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("seaFreight")}
              >
                <td colSpan="6" className="py-2 px-3 text-start flex items-center">
                  {sections.seaFreight ? "▼" : "▶"} B. Sea Freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                ["Sea Freight", "ENS", "ISPS", "IT Transmission"].map((desc, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 7}</td>
                    <td className="py-1 px-3 border text-start">{desc}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" />
                    </td>
                    <td className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" />
                    </td>
                    <td className="py-1 px-3 border">{desc === "ENS" ? "Per BL" : "Per Container"}</td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Sea Freight Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">0</td>
                  <td className="py-1 px-3 border">0</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("destination")}
              >
                <td colSpan="6" className="py-2 px-3 text-start flex items-center">
                  {sections.destination ? "▼" : "▶"} C. Destination Charges
                </td>
              </tr>
              {sections.destination &&
                [
                  "Destination Terminal Handling Charges",
                  "BL Fee",
                  "Delivery by Barge/Road",
                  "Delivery Order Fees",
                  "Handling Charges",
                  "T1 Doc",
                  "LOLO Charges",
                ].map((desc, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 11}</td>
                    <td className="py-1 px-3 border text-start">{desc}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" />
                    </td>
                    <td className="py-1 px-3 border">
                      <input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" />
                    </td>
                    <td className="py-1 px-3 border">Per Container</td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Destination Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">0</td>
                  <td className="py-1 px-3 border">0</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">INCO Term</td>
                <td colSpan="4" className="py-1 px-3 border">DAP</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border  text-start">Delivery Address</td>
                <td colSpan="4" className="py-1 px-3 border">TRIGO - SCSI, LLC 1520 KEPNER DRIVE LAFAYETTE IN 47905 USA</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border  text-start">FX Rate</td>
                <td className="py-1 px-3 border">USD</td>
                <td className="py-1 px-3 border">84</td>
                <td className="py-1 px-3 border">EURO</td>
                <td className="py-1 px-3 border">93</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Required Transit Days</td>
                <td colSpan="4" className="py-1 px-3 border">64 days</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Estimated Transit Days Given by Forwarder</td>
                <td colSpan="4" className="py-1 px-3 border"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;
