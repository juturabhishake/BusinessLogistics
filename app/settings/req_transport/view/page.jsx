"use client";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import secureLocalStorage from "react-secure-storage";

const TransportRequestsTable = () => {
  const [data, setData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const [saveState, setSaveState] = useState("idle");
  const [deleteState, setDeleteState] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("/api/req_transport/get_TransportRequests");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result = await response.json();
      setData(result.result || []);
      setOriginalData(result.result || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const check_sc = secureLocalStorage.getItem("sc");
    const isAdminUser = check_sc === 'admin';
    setIsAdmin(isAdminUser);
    if (!isAdminUser) {
      window.location.href = "/";
    } else {
      fetchData();
    }
  }, []);

  const columnKeyMap = {
    "Request Date": "Request_Date",
    "Transport Type": "Transport_Type",
    "Shipment Type": "Shipment_Type",
    "Container Size": "Container_Size",
    "Weight (KG)": "Weight",
    "From": "From_Location_Name",
    "To": "To_Location_Name",
    "Commodity": "Commodity",
    "HSN Code": "HSN_Code",
    "Incoterms": "Incoterms",
    "USD": "USD",
    "EURO": "EURO",
    "Transit Days": "Transit_Days",
    "Destination Port": "Dest_Port",
    "Free Days": "Free_Days",
    "Preferred Vessel": "Pref_Vessel",
    "Preferred Service": "Pref_Service",
    "Preferred Liners": "Pref_Liners",
    "Avg. Containers/Month": "Avg_Cont_Per_Mnth",
    "Remarks": "Remarks",
    "Created By": "Created_By",
    "uploadedPdf": "UploadedPDF",
  };

  const handleSort = (column) => {
    const key = columnKeyMap[column];
    if (!key) return;

    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === key && sortConfig.direction === "desc") {
      setSortConfig({ key: null, direction: null });
      setData(originalData);
      return;
    }
    setSortConfig({ key, direction });
    const sortedData = [...data].sort((a, b) => {
      if (a[key] === null) return 1;
      if (b[key] === null) return -1;
      if (typeof a[key] === "string") {
        return direction === "asc"
          ? a[key].toLowerCase().localeCompare(b[key].toLowerCase())
          : b[key].toLowerCase().localeCompare(a[key].toLowerCase());
      } else {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }
    });
    setData(sortedData);
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some(val => 
        String(val).toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = rowsPerPage === "All" ? filteredData : filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleEdit = (row) => {
    setEditRow(row);
    setFormData({ ...row });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      const response = await fetch("/api/req_transport/edit_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update request");

      setData((prevData) =>
        prevData.map((row) => (row.ID === editRow.ID ? { ...row, ...formData } : row))
      );
      setSaveState("success");
      setTimeout(() => {
        setSaveState("idle");
        setIsModalOpen(false);
      }, 2000);
    } catch (error) {
      console.error("Update failed:", error.message);
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  const handleDelete = async (ID) => {
    if (!window.confirm("Are you sure you want to delete this request?")) return;
    
    setDeleteState((prev) => ({ ...prev, [ID]: "deleting" }));
    try {
      const response = await fetch("/api/req_transport/delete_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ID }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete request");

      setData((prevData) => prevData.filter((row) => row.ID !== ID));
      setDeleteState((prev) => ({ ...prev, [ID]: "success" }));
      setTimeout(() => setDeleteState((prev) => ({ ...prev, [ID]: undefined })), 2000);
    } catch (error) {
      console.error("Delete failed:", error.message);
      setDeleteState((prev) => ({ ...prev, [ID]: "error" }));
      setTimeout(() => setDeleteState((prev) => ({ ...prev, [ID]: undefined })), 3000);
    }
  };

  const handleAddNew = () => {
    window.location.href = "/settings/req_transport";
  };

  const handleModalInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-1 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full p-0 rounded-t-lg">
              <div>
                <h2 className="text-sm font-bold">Admin Settings / <span className="text-xs text-gray-100">Transport Requests</span></h2>
              </div>
              <div className="flex mt-2 lg:mt-0 w-full lg:w-auto justify-start">
                <button
                  className="p-2 rounded-lg font-semibold bg-gray-500 text-white hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-400 transition-all duration-300"
                  style={{ fontSize: "10px" }}
                  onClick={handleAddNew}
                >
                  + Create New Request
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <div className="p-4 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span style={{ fontSize: "14px" }}>Show</span>
                <select
                  style={{ fontSize: "14px" }}
                  className="border p-0 rounded bg-secondary"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(e.target.value === "All" ? "All" : parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="All">All</option>
                </select>
                <span style={{ fontSize: "14px" }}>entries</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  className="border p-1 pt-[0.9] pl-8 rounded bg-secondary"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <FaSearch className="absolute left-2 top-2 text-muted-foreground" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg bg-card text-foreground"
                style={{ fontSize: "13px", whiteSpace: "nowrap" }}>
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 border text-left">ACTIONS</th>
                    {Object.keys(columnKeyMap).map((key) => (
                      <th key={key} onClick={() => handleSort(key)} className="cursor-pointer px-4 py-2 border text-left">
                        {key.toUpperCase()}{" "}
                        {sortConfig.key === columnKeyMap[key] ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕"}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ fontSize: "12px" }}>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.ID} className="border hover:bg-muted">
                        <td className="px-4 py-2 border">
                          <button onClick={() => handleEdit(item)} className="mr-2 text-blue-500"><FaEdit /></button>
                          <button onClick={() => handleDelete(item.ID)} className="px-2 text-red-500">
                            {deleteState[item.ID] === 'deleting' ? '...' : <FaTrash />}
                          </button>
                        </td>
                        {Object.values(columnKeyMap).map((key) => (
                          <td key={key} className="px-4 py-2 border">
                            {(() => {
                              const value = item[key];
                              if (key === 'Request_Date') {
                                return value ? new Date(value).toLocaleDateString('en-GB') : 'N/A';
                              }
                              if (key === 'UploadedPDF' && value) {
                                const fileName = value.split('/').pop();
                                return (
                                  <a 
                                    href={value} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-500 hover:underline"
                                  >
                                    {fileName}
                                  </a>
                                );
                              }
                              return value ?? 'N/A';
                            })()}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={Object.keys(columnKeyMap).length + 1} className="text-center py-4">No results found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between items-center mt-4 space-y-2">
              <div style={{ fontSize: "14px" }}>
                Showing {filteredData.length > 0 ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(currentPage * rowsPerPage, filteredData.length)} of ${filteredData.length} entries` : "0 entries"}
              </div>
              <div className="flex space-x-1" style={{fontSize:"14px"}}>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>{"<<"}</button>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>{"<"}</button>
                  <span className="px-3 py-1">Page {currentPage} of {totalPages}</span>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>{">"}</button>
                  <button className="px-3 py-1 border rounded" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>{">>"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[80%] lg:w-[60%] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Edit Transport Request (ID: {formData.ID})</h2>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                      { label: "Commodity", key: "Commodity", type: "text" },
                      { label: "HSN Code", key: "HSN_Code", type: "text" },
                      { label: "Incoterms", key: "Incoterms", type: "text" },
                      { label: "USD", key: "USD", type: "number" },
                      { label: "EURO", key: "EURO", type: "number" },
                      { label: "Transit Days", key: "Transit_Days", type: "number" },
                      { label: "Destination Port", key: "Dest_Port", type: "text" },
                      { label: "Free Days", key: "Free_Days", type: "number" },
                      { label: "Preferred Vessel", key: "Pref_Vessel", type: "text" },
                      { label: "Preferred Service", key: "Pref_Service", type: "text" },
                      { label: "Avg. Containers/Month", key: "Avg_Cont_Per_Mnth", type: "number" },
                      { label: "Weight (KG)", key: "Weight", type: "number" },
                  ].map((field) => (
                      <div key={field.key}>
                          <label className="block text-sm font-semibold">{field.label}</label>
                          <input
                              type={field.type}
                              name={field.key}
                              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
                              value={formData[field.key] || ''}
                              onChange={handleModalInputChange}
                          />
                      </div>
                  ))}
                  <div className="lg:col-span-3 md:col-span-2">
                      <label className="block text-sm font-semibold">Preferred Liners</label>
                      <textarea
                          name="Pref_Liners"
                          rows="2"
                          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
                          value={formData['Pref_Liners'] || ''}
                          onChange={handleModalInputChange}
                      />
                  </div>
                   <div className="lg:col-span-3 md:col-span-2">
                      <label className="block text-sm font-semibold">Remarks</label>
                      <textarea
                          name="Remarks"
                          rows="2"
                          className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700"
                          value={formData['Remarks'] || ''}
                          onChange={handleModalInputChange}
                      />
                  </div>
              </div>
            </div>
            <div className="flex justify-end p-4 bg-gray-200 dark:bg-gray-700 rounded-b-lg border-t mt-auto">
              <button onClick={() => setIsModalOpen(false)} className="mr-2 px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded flex items-center justify-center min-w-[80px]
                ${saveState === "success" ? "bg-green-500 text-white" : 
                saveState === "error" ? "bg-red-500 text-white" : "bg-blue-500 text-white"}`}
              >
                {saveState === "saving" ? <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full"></div>
                  : saveState === "success" ? "✔ Saved"
                  : saveState === "error" ? "❌ Error" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportRequestsTable;