"use client";
import React, { useState } from "react";
import { FiSave, FiCheck, FiLoader } from "react-icons/fi";

const QuotationTable = () => {
  const [sections, setSections] = useState({
    origin: false,
    seaFreight: false,
    destination: false,
  });
  const [saveState, setSaveState] = useState("idle");
  const [originData, setOriginData] = useState(
    Array(6).fill({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" })
  );
  const [seaFreightData, setSeaFreightData] = useState(
    Array(2).fill({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" })
  );
  const [destinationData, setDestinationData] = useState(
    Array(6).fill({ "1CBM": "", "2CBM": "", "3CBM": "", "4CBM": "", "5CBM": "", "6CBM": "" })
  );
  const [totals, setTotals] = useState({
    origin: { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 },
    seaFreight: { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 },
    destination: { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 },
  });

  const handleInputChange = (section, rowIndex, column, value) => {
    let updatedData;
    if (section === "origin") {
      updatedData = originData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [column]: value };
        }
        return row;
      });
      setOriginData(updatedData);
    } else if (section === "seaFreight") {
      updatedData = seaFreightData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [column]: value };
        }
        return row;
      });
      setSeaFreightData(updatedData);
    } else if (section === "destination") {
      updatedData = destinationData.map((row, index) => {
        if (index === rowIndex) {
          return { ...row, [column]: value };
        }
        return row;
      });
      setDestinationData(updatedData);
    }

    const newTotals = {
      ...totals,
      [section]: updatedData.reduce(
        (acc, row) => {
          acc["1CBM"] += parseFloat(row["1CBM"] || 0);
          acc["2CBM"] += parseFloat(row["2CBM"] || 0);
          acc["3CBM"] += parseFloat(row["3CBM"] || 0);
          acc["4CBM"] += parseFloat(row["4CBM"] || 0);
          acc["5CBM"] += parseFloat(row["5CBM"] || 0);
          acc["6CBM"] += parseFloat(row["6CBM"] || 0);
          return acc;
        },
        { "1CBM": 0, "2CBM": 0, "3CBM": 0, "4CBM": 0, "5CBM": 0, "6CBM": 0 }
      ),
    };
    setTotals(newTotals);
  };

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

  const totalShipmentCost = {
    "1CBM": totals.origin["1CBM"] + totals.seaFreight["1CBM"] + totals.destination["1CBM"],
    "2CBM": totals.origin["2CBM"] + totals.seaFreight["2CBM"] + totals.destination["2CBM"],
    "3CBM": totals.origin["3CBM"] + totals.seaFreight["3CBM"] + totals.destination["3CBM"],
    "4CBM": totals.origin["4CBM"] + totals.seaFreight["4CBM"] + totals.destination["4CBM"],
    "5CBM": totals.origin["5CBM"] + totals.seaFreight["5CBM"] + totals.destination["5CBM"],
    "6CBM": totals.origin["6CBM"] + totals.seaFreight["6CBM"] + totals.destination["6CBM"],
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
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("origin")}
              >
                <td>A</td>
                <td colSpan="9" className="py-2 px-3 text-start flex items-center">
                  {sections.origin ? "▼" : "▶"} Origin Charges
                </td>
              </tr>
              {sections.origin &&
                ["Customs Clearance & Documentation", "Local Transportation From GTI-Chennai", "Terminal Handling Charges - Origin", "Bill of Lading Charges", "Loading/Unloading / SSR", "CFS AT ACTUAL"].map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 1}</td>
                    <td className="py-1 px-3 border text-start">{item}</td>
                    <td className="py-1 px-3 border">INR / Shipment</td>
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="py-1 px-3 border">
                        <input onChange={(e) => handleInputChange("origin", index, (i + 1) + "CBM", e.target.value)} type="number" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                      </td>
                    ))}
                    <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder={item === "CFS AT ACTUAL" ? "At Actual" : ""} /></td>
                  </tr>
                ))}
              {sections.origin && (
                <tr className="border font-bold">
                  <td colSpan="3" className="py-1 px-3 border">Total Origin Cost in INR</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input value={totals.origin[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("seaFreight")}
              >
                <td>B</td>
                <td colSpan="9" className="py-2 px-3 text-start flex items-center">
                  {sections.seaFreight ? "▼" : "▶"} Sea Freight Charges
                </td>
              </tr>
              {sections.seaFreight &&
                ["Sea Freight", "FSC (Fuel Surcharge)"].map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 7}</td>
                    <td className="py-1 px-3 border text-start">{item}</td>
                    <td className="py-1 px-3 border">USD / Shipment</td>
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="py-1 px-3 border">
                        <input type="number" onChange={(e) => handleInputChange("seaFreight", index, (i + 1) + "CBM", e.target.value)} className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                      </td>
                    ))}
                    <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
                  </tr>
                ))}
              {sections.seaFreight && (
                <tr className="border font-bold">
                  <td colSpan="3" className="py-1 px-3 border">Total Sea Freight Cost in INR</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input value={totals.seaFreight[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
                </tr>
              )}
              <tr
                className="font-bold bg-[var(--bgBody)] border cursor-pointer"
                onClick={() => toggleSection("destination")}
              >
                <td>C</td>
                <td colSpan="9" className="py-2 px-3 text-start flex items-center">
                  {sections.destination ? "▼" : "▶"} Destination Charges
                </td>
              </tr>
              {sections.destination &&
                ["Custom Clearance", "CC Fee", "D.O Charges per BL", "AAI Charges", "Loading/Unloading", "Delivery"].map((item, index) => (
                  <tr key={index} className="border">
                    <td className="py-1 px-3 border">{index + 9}</td>
                    <td className="py-1 px-3 border text-start">{item}</td>
                    <td className="py-1 px-3 border">EURO / Shipment</td>
                    {[...Array(6)].map((_, i) => (
                      <td key={i} className="py-1 px-3 border">
                        <input type="number" onChange={(e) => handleInputChange("destination", index, (i + 1) + "CBM", e.target.value)} className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                      </td>
                    ))}
                    <td className="py-1 px-3 border"><input type="text" className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="" /></td>
                  </tr>
                ))}
              {sections.destination && (
                <tr className="border font-bold">
                  <td colSpan="3" className="py-1 px-3 border">Total Destination Cost in INR</td>
                  {[...Array(6)].map((_, i) => (
                    <td key={i} className="py-1 px-3 border">
                      <input value={totals.destination[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                    </td>
                  ))}
                  <td className="py-1 px-3 border"></td>
                </tr>
              )}
              <tr className="border font-bold">
                <td colSpan="3" className="py-1 px-3 border text-start">Total Shipment Cost in INR (A+B+C)</td>
                {[...Array(6)].map((_, i) => (
                  <td key={i} className="py-1 px-3 border">
                    <input value={totalShipmentCost[(i + 1) + "CBM"]} type="number" readOnly className="w-full bg-transparent border-none focus:outline-none text-right" placeholder="0" />
                  </td>
                ))}
                <td className="py-1 px-3 border"></td>
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
                <td colSpan="7" className="py-1 px-3 border">64 days</td>
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
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;