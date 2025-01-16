import React from "react";

const QuotationTable = () => {
  return (
    <div className="container mt-5">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header text-center bg-[var(--bgBody)] text-white rounded-t-lg py-4">
          <h2 style={{ fontSize: "16px" }}>Comparative Statement of Quotations</h2>
          <p className="mb-0">
            <span style={{ fontSize: "12px" }}>RFQ Export rates for January 2025</span>
            <br />
            <span style={{ fontSize: "12px" }}> We are following "IATF 16949 CAPD Method 10.3 Continuous Improvement Spirit"</span>
          </p>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-5">
          <table className="table table-bordered border-[var(--primary)] border-collapse text-center w-full min-w-[1200px]" style={{ fontSize: "12px" }}>
            <thead className="bg-secondary text-[var(--buttonHover)] border border-[var(--bgBody)]">
              <tr className="border border-[var(--bgBody)]">
                <th rowSpan="2" className="py-3 px-3 border border-[var(--bgBody)]">S.No</th>
                <th rowSpan="2" className="py-3 px-3 border border-[var(--bgBody)]">Descriptions</th>
                <th rowSpan="2" className="py-3 px-3 border border-[var(--bgBody)]">Currency in</th>
                <th colSpan="2" className="py-3 px-3 border border-[var(--bgBody)]">Quote for GTI to Chicago USA shipment</th>
                <th rowSpan="2" className="py-3 px-3 border border-[var(--bgBody)]">Remarks</th>
              </tr>
              <tr className="border border-[var(--bgBody)]">
                <th className="py-3 px-3 border border-[var(--bgBody)]">20 ft</th>
                <th className="py-3 px-3 border border-[var(--bgBody)]">40 ft</th>
              </tr>
            </thead>
            <tbody className="bg-[var(--bgBody2)]">
              <tr className="font-bold bg-[var(--bgBody)] border border-[var(--bgBody)]">
                <td colSpan="6" className="py-3 px-3 border border-[var(--bgBody)]">A. Origin Charges</td>
              </tr>
              {[
                { description: "Customs Clearance & Documentation", remarks: "Per Container" },
                { description: "Local Transportation From GTI-Chennai", remarks: "Per Container" },
                { description: "Terminal Handling Charges - Origin", remarks: "Per Container" },
                { description: "Bill of Lading Charges", remarks: "Per BL" },
                { description: "Loading/Unloading / SSR", remarks: "At Actual" },
                { description: "Halting", remarks: "INR 2300 Per Day" },
              ].map((item, index) => (
                <tr key={index} className="border border-[var(--bgBody)]">
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{index + 1}</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{item.description}</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">INR / Shipment</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:text-green-500 cursor-cell border border-[var(--bgBody)]"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:text-green-500 cursor-cell border border-[var(--bgBody)]"
                    />
                  </td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{item.remarks}</td>
                </tr>
              ))}
              <tr className="border border-[var(--bgBody)]">
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">Total Origin Cost in INR</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]"></td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">
                  <input
                    type="text"
                    className="w-full h-full bg-transparent border-none focus:outline-none border border-[var(--bgBody)] focus:text-green-500 cursor-cell"
                  />
                </td>
                <td className="py-3 px-3">
                  <input
                    type="text"
                    className="w-full h-full bg-transparent border-none focus:outline-none border border-[var(--bgBody)] focus:text-green-500 cursor-cell"
                  />
                </td>
                <td className="py-3 px-3 border border-[var(--bgBody)]"></td>
              </tr>
              <tr className="font-bold bg-[var(--bgBody)]">
                <td colSpan="6" className="py-3 px-3">B. Sea Freight Charges</td>
              </tr>
              {["Sea Freight", "ENS", "ISPS", "IT Transmission"].map((desc, index) => (
                <tr className="border border-[var(--bgBody)]" key={index}>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{index + 7}</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{desc}</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">USD / Shipment</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:text-green-500 cursor-cell"
                    />
                  </td>
                  <td className="py-3 px-3">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:text-green-500 cursor-cell"
                    />
                  </td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{desc === "ENS" ? "Per BL" : "Per Container"}</td>
                </tr>
              ))}
              <tr className="border border-[var(--bgBody)]">
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">Total Sea Freight Cost in INR</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]"></td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">0</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">0</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]"></td>
              </tr>
              <tr className="font-bold bg-[var(--bgBody)] border border-[var(--bgBody)]">
                <td colSpan="6" className="py-3 px-3 border border-[var(--bgBody)]">C. Destination Charges</td>
              </tr>
              {[
                "Destination Terminal Handling Charges",
                "BL Fee",
                "Delivery by Barge/Road",
                "Delivery Order Fees",
                "Handling Charges",
                "T1 Doc",
                "LOLO Charges",
              ].map((desc, index) => (
                <tr className="border border-[var(--bgBody)]" key={index}>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{index + 11}</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">{desc}</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">USD / Shipment</td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:text-green-500 cursor-cell"
                    />
                  </td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">
                    <input
                      type="text"
                      className="w-full h-full bg-transparent border-none focus:outline-none focus:text-green-500 cursor-cell"
                    />
                  </td>
                  <td className="py-3 px-3 border border-[var(--bgBody)]">Per Container</td>
                </tr>
              ))}
              <tr className="border border-[var(--bgBody)]">
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">Total Destination Charges in INR</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]"></td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">0</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">0</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]"></td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">INCO Term</td>
                <td colSpan="4" className="py-3 px-3 border border-[var(--bgBody)]">DAP</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">Delivery Address</td>
                <td colSpan="4" className="py-3 px-3 border border-[var(--bgBody)]">TRIGO - SCSI, LLC 1520 KEPNER DRIVE LAFAYETTE IN 47905 USA</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">FX Rate</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">USD</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">84</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">EURO</td>
                <td className="py-3 px-3 border border-[var(--bgBody)]">93</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">Required Transit Days</td>
                <td colSpan="4" className="py-3 px-3 border border-[var(--bgBody)]">64 days</td>
              </tr>
              <tr>
                <td colSpan="2" className="font-bold py-3 px-3 border border-[var(--bgBody)]">Estimated Transit Days Given by Forwarder</td>
                <td colSpan="4" className="py-3 px-3 border border-[var(--bgBody)]"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QuotationTable;
