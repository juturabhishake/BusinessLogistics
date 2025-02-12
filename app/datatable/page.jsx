"use client";

import React, { useState, useEffect } from "react";
import DataTable from "datatables.net-react";
import DT from "datatables.net-dt";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash } from "lucide-react";
import "./page.css";

const Page = () => {
  DataTable.use(DT);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_location_details");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        const formattedData = result.result.map((item) => ({
          id: item.Location_Id,
          code: item.Location_Code,
          location: item.Location,
          country: item.Country,
          currency: item.Currency,
          rfqType: item.RFQType,
        }));
        setTableData(formattedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (row) => {
    setSelectedRow(row);
    setFormData(row);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setTableData(tableData.filter((item) => item.id !== id));
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="datatable-container h-full">
      <div className="p-2 px-4 rounded-t-lg bg-[var(--bgBody)]">
        <h2 className="text-[16px] text-white font-bold">Location Data Table</h2>
      </div>

      <div className="table-wrapper p-4 bg-[var(--bgBody2)]">
        {loading ? (
          <div className="text-center p-4">Loading data...</div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : (
          <DataTable
            id="myTable"
            className="display dataTable"
            data={tableData.map((item) => [
              `<span style="text-align:left; display:block;">${item.id}</span>`,
              item.code,
              `<span style="text-align:left; display:block;">${item.location}</span>` ,
              item.country,
              item.currency,
              item.rfqType,
              `<div class="flex space-x-2">
                <button class="edit-btn" data-id="${item.id}"><Pencil size={16} /></button>
                <button class="delete-btn" data-id="${item.id}"><Trash size={16} /></button>
              </div>`
            ])}
            columns={[
              { title: "Location ID" },
              { title: "Location Code" },
              { title: "Location" },
              { title: "Country" },
              { title: "Currency" },
              { title: "RFQ Type" },
              { title: "Actions" },
            ]}
            options={{
              paging: true,
              searching: true,
              info: true,
              autoWidth: true,
            }}
          />
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseModal}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">Edit Location</h2>
            <Input name="location" value={formData.location} onChange={handleChange} placeholder="Location" />
            <Input name="country" value={formData.country} onChange={handleChange} placeholder="Country" className="mt-2" />
            <Input name="currency" value={formData.currency} onChange={handleChange} placeholder="Currency" className="mt-2" />
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button>Submit</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Page;