"use client";

import React, { useState, useEffect } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import "./page.css";

const Page = () => {
  DataTable.use(DT);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_location_details");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        const formattedData = result.result.map((item) => [
          `${item.Location_Id}`, 
          `${item.Location_Code}`,
          `${item.Location}`,
          `${item.Country}`,
          `${item.Currency}`,
          `${item.RFQType}`,
        ]);

        setTableData(formattedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="datatable-container h-full">
      <div className="p-2 px-4 rounded-t-lg bg-[var(--bgBody)]">
        <h2 className="text-[16px] text-[white] font-bold">Location Data Table</h2>
      </div>

      <div
        className="table-wrapper p-4 bg-[var(--bgBody2)]"
        style={{
          borderBottomRightRadius: "10px",
          borderBottomLeftRadius: "10px",
          boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",
        }}
      >
        {loading ? (
          <div className="text-center p-4">Loading data...</div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <DataTable
            id="myTable"
            className="display dataTable"
            data={tableData}
            columns={[
              { title: "Location ID" },
              { title: "Location Code" },
              { title: "Location" },
              { title: "Country" },
              { title: "Currency" },
              { title: "RFQ Type" },
            ]}
            options={{
              // scrollX: true,
              // scrollY: "300px",
              paging: true,
              searching: true,
              info: true,
              autoWidth: true,
            }}
          />
        )}
      </div>
      <br /> <br />
    </div>
  );
};

export default Page;

