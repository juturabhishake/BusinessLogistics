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
  
  const [originCharges, setOriginCharges] = useState([
    { description: "Customs Clearance & Documentation", 20: "", 40: "", remarks: "Per Container" },
    { description: "Local Transportation From GTI-Chennai", 20: "", 40: "", remarks: "Per Container" },
    { description: "Terminal Handling Charges - Origin", 20: "", 40: "", remarks: "Per Container" },
    { description: "Bill of Lading Charges", 20: "", 40: "", remarks: "Per BL" },
    { description: "Loading/Unloading / SSR", 20: "", 40: "", remarks: "At Actual" },
    { description: "Halting", 20: "", 40: "", remarks: "INR 2300 Per Day" },
  ]);
  
  const [seaFreightCharges, setSeaFreightCharges] = useState([
    { description: "Sea Freight", 20: "", 40: "", remarks: "Per Container" },
    { description: "ENS", 20: "", 40: "", remarks: "Per BL" },
    { description: "ISPS", 20: "", 40: "", remarks: "Per Container" },
    { description: "IT Transmission", 20: "", 40: "", remarks: "Per Container" },
  ]);
  
  const [destinationCharges, setDestinationCharges] = useState([
    { description: "Destination Terminal Handling Charges", 20: "", 40: "", remarks: "Per Container" },
    { description: "BL Fee", 20: "", 40: "", remarks: "Per Container" },
    { description: "Delivery by Barge/Road", 20: "", 40: "", remarks: "Per Container" },
    { description: "Delivery Order Fees", 20: "", 40: "", remarks: "Per Container" },
    { description: "Handling Charges", 20: "", 40: "", remarks: "Per Container" },
    { description: "T1 Doc", 20: "", 40: "", remarks: "Per Container" },
    { description: "LOLO Charges", 20: "", 40: "", remarks: "Per Container" },
  ]);

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

  const handleOriginChange = (index, field, value) => {
    const updatedCharges = [...originCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setOriginCharges(updatedCharges);
  };

  const handleSeaFreightChange = (index, field, value) => {
    const updatedCharges = [...seaFreightCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setSeaFreightCharges(updatedCharges);
  };

  const handleDestinationChange = (index, field, value) => {
    const updatedCharges = [...destinationCharges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setDestinationCharges(updatedCharges);
  };

  const calculateTotal = (charges) => {
    return charges.reduce(
      (acc, charge) => {
        acc[20] += parseFloat(charge[20] || 0);
        acc[40] += parseFloat(charge[40] || 0);
        return acc;
      },
      { 20: 0, 40: 0 }
    );
  };

  const totalOrigin = calculateTotal(originCharges);
  const totalSeaFreight = calculateTotal(seaFreightCharges);
  const totalDestination = calculateTotal(destinationCharges);

  const totalShipmentCost = {
    20: totalOrigin[20] + totalSeaFreight[20] + totalDestination[20],
    40: totalOrigin[40] + totalSeaFreight[40] + totalDestination[40],
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
                <td>A.</td>
                <td colSpan="5" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} Origin Charges
                </td>
              </tr>
              {sections.origin &&
                originCharges.map((item, index) => (
                  <tr key={index} className="border border border-[var(--bgBody)]">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right hover:border-gray-400"
                        value={item[20]}
                        onChange={(e) => handleOriginChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[40]}
                        onChange={(e) => handleOriginChange(index, 40, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleOriginChange(index, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              {sections.origin && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Origin Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">{totalOrigin[20]}</td>
                  <td className="py-1 px-3 border">{totalOrigin[40]}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("seaFreight")}
              >
                <td>B.</td>
                <td colSpan="5" className="py-2 px-3 text-start flex items-center">
                  {sections.seaFreight ? "▼" : "▶"} Sea Freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                seaFreightCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 7}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[20]}
                        onChange={(e) => handleSeaFreightChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[40]}
                        onChange={(e) => handleSeaFreightChange(index, 40, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleSeaFreightChange(index, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Sea Freight Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">{totalSeaFreight[20]}</td>
                  <td className="py-1 px-3 border">{totalSeaFreight[40]}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("destination")}
              >
                <td>C.</td>
                <td colSpan="5" className="py-2 px-3 text-start flex items-center">
                  {sections.destination ? "▼" : "▶"} Destination Charges
                </td>
              </tr>
              {sections.destination &&
                destinationCharges.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 11}</td>
                    <td className="py-1 px-3 border text-start">{item.description}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[20]}
                        onChange={(e) => handleDestinationChange(index, 20, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="number"
                        placeholder="0"
                        className="w-full bg-transparent border-none focus:outline-none text-right"
                        value={item[40]}
                        onChange={(e) => handleDestinationChange(index, 40, e.target.value)}
                      />
                    </td>
                    <td className="py-1 px-3 border">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none focus:outline-none text-center"
                        value={item.remarks}
                        onChange={(e) => handleDestinationChange(index, "remarks", e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border">
                  <td colSpan="2" className="font-bold py-1 px-3 border">Total Destination Charges in INR</td>
                  <td className="py-1 px-3 border"></td>
                  <td className="py-1 px-3 border">{totalDestination[20]}</td>
                  <td className="py-1 px-3 border">{totalDestination[40]}</td>
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border">
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">Total Shipment Cost in INR (A + B + C)</td>
                <td className="py-1 px-3 border"></td>
                <td className="py-1 px-3 border">{totalShipmentCost[20]}</td>
                <td className="py-1 px-3 border">{totalShipmentCost[40]}</td>
                <td className="py-1 px-3 border"></td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">INCO Term</td>
                <td colSpan="4" className="py-1 px-3 border">DAP</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border  text-start">Delivery Address</td>
                <td colSpan="4" className="py-1 px-3 border">TRIGO - SCSI, LLC 1520 KEPNER DRIVE LAFAYETTE IN 47905 USA</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-1 px-3 border text-start">FX Rate</td>
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