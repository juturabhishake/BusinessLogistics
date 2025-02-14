"use client";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import secureLocalStorage from "react-secure-storage";

const LOCMaster = () => {
  const [data, setData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    Loc_Details_ID: "",
    Location_Code: "",
    Location: "",
    Delivery_Address: "",
    Commodity: "",
    Incoterms: "",
    Transit_Days: "",
    Dest_Port: "",
    Free_Days: "",
    Pref_Vessel: "",
    Pref_Service: "",
    Pref_Liners: "",
    Avg_Cont_Per_Mnth: "",   
  });
  const [saveState, setSaveState] = useState("idle");
  const [deleteState, setDeleteState] = useState({});
  const rfqtypes = ["FCL", "LCL", "BOTH", "FCLIMPORT", "LCLIMPORT"];
  const currtypes = ["USD", "EURO"];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [locationCodes, setLocationCodes] = useState([]);

  useEffect(() => {
    const fetchLocationCodes = async () => {
      try {
        const response = await fetch("/api/getLocCodes");
        if (!response.ok) {
          throw new Error("Failed to fetch location codes");
        }
        const data = await response.json();
        setLocationCodes(data.sort());
      } catch (error) {
        console.error("Error fetching location codes:", error);
      }
    };
  
    fetchLocationCodes();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_location_details");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        console.log('Location data:', result);
        setData(result.result);
        setOriginalData(result.result);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData();
  }, []);

  const columnKeyMap = {
    ID: "Loc_Details_ID",
    Location_Code: "Location_Code",
    Location: "Location",
    Customer_Name: "Customer_Name",
    Delivery_Address: "Delivery_Address",    
    Incoterms: "Incoterms",
    Transit_Days: "Transit_Days",
    Dest_Port: "Dest_Port", 

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
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData =
    rowsPerPage === "All"
      ? filteredData
      : filteredData.slice(
          (currentPage - 1) * rowsPerPage,
          currentPage * rowsPerPage
        );

  const handleEdit = (row) => {
    setEditRow(row);
    setFormData({
      Loc_Details_ID: row.Loc_Details_ID,
      Location_Code: row.Location_Code,
      Customer_Name: row.Customer_Name,
      Delivery_Address: row.Delivery_Address,
      Commodity: row.Commodity,
      HSN_Code: row.HSN_Code,
      Incoterms: row.Incoterms,
      Transit_Days: row.Transit_Days,
      Dest_Port: row.Dest_Port,
      Free_Days: row.Free_Days,
      Pref_Vessel: row.Pref_Vessel,
      Pref_Service: row.Pref_Service,
      Pref_Liners: row.Pref_Liners,
      Avg_Cont_Per_Mnth: row.Avg_Cont_Per_Mnth,    
     
      UpdatedBy: secureLocalStorage.getItem("un"),      
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setSaveState("saving");

    try {
      const response = await fetch("/api/update_loc_details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({          
          Loc_Details_ID: formData.Loc_Details_ID,         
          Customer_Name: formData.Customer_Name,
          Delivery_Address: formData.Delivery_Address,
          Commodity: formData.Commodity,
          HSN_Code: formData.HSN_Code,
          Incoterms: formData.Incoterms,
          Transit_Days: formData.Transit_Days,
          Dest_Port: formData.Dest_Port,
          Free_Days: formData.Free_Days,
          Pref_Vessel: formData.Pref_Vessel,
          Pref_Service: formData.Pref_Service,
          Pref_Liners: formData.Pref_Liners,
          Avg_Cont_Per_Mnth: formData.Avg_Cont_Per_Mnth,      
          UpdatedBy: secureLocalStorage.getItem("un"), 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update location");
      }

      setData((prevData) =>
        prevData.map((row) =>
          row.Loc_Details_ID === editRow.Loc_Details_ID ? { ...row, ...formData } : row
        )
      );

      setSaveState("success");
      setTimeout(() => {
        setSaveState("idle");
        setIsModalOpen(false);
      }, 3000);
    } catch (error) {
      console.error("Update failed:", error.message);
      setSaveState("error");
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    }
  };

  const handleDelete = async (Loc_Details_ID) => {
    setDeleteState((prev) => ({ ...prev, [Loc_Details_ID]: "deleting" }));

    try {
      const response = await fetch("/api/delete_location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Loc_Details_ID }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete location");
      }

      setData((prevData) => prevData.filter((row) => row.Loc_Details_ID !== Loc_Details_ID));

      setDeleteState((prev) => ({ ...prev, [Loc_Details_ID]: "success" }));
      setTimeout(() => {
        setDeleteState((prev) => ({ ...prev, [Loc_Details_ID]: "idle" }));
      }, 3000);
    } catch (error) {
      console.error("Delete failed:", error.message);
      setDeleteState((prev) => ({ ...prev, [Loc_Details_ID]: "error" }));
      setTimeout(() => {
        setDeleteState((prev) => ({ ...prev, [Loc_Details_ID]: "idle" }));
      }, 3000);
    }
  };
  const handleAddNewLocation = async () => {
    setSaveState("saving");
  
    try {
      const response = await fetch("/api/add_Location_Details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Location_Code: formData.Location_Code,
          Customer_Name: formData.Customer_Name,
          Delivery_Address: formData.Delivery_Address,
          Commodity: formData.Commodity,
          HSN_Code: formData.HSN_Code,
          Incoterms: formData.Incoterms,
          Transit_Days: formData.Transit_Days,
          Dest_Port: formData.Dest_Port,
          Free_Days: formData.Free_Days,
          Pref_Vessel: formData.Pref_Vessel,
          Pref_Service: formData.Pref_Service,
          Pref_Liners: formData.Pref_Liners,
          Avg_Cont_Per_Mnth: formData.Avg_Cont_Per_Mnth,
          Created_By: secureLocalStorage.getItem("un"),
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Failed to insert location details");
      }
  
      setData((prevData) => [...prevData, { ...formData }]);
  
      setIsAddModalOpen(false);
      setSaveState("success");
  
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
      window.location.reload();
    } catch (error) {
      console.error("Insert failed:", error.message);
      setSaveState("error");
  
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
    }
  };
  
  return (
    <div className="">
      <div className="card shadow rounded-lg bg-[var(--bgBody)]">
        <div className="card-header bg-[var(--bgBody)] text-white rounded-t-lg py-3 px-3">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center w-full p-0 rounded-t-lg">
            <div>
              <h2 className="text-sm font-bold">Admin Settings / <span className="text-xs text-gray-100">Location Details</span></h2>
            </div>
            <div className="flex mt-2 lg:mt-0 w-full lg:w-auto justify-start">
              <button className="p-2 rounded-lg font-semibold 
                bg-gray-500 text-white hover:bg-gray-600 
                dark:bg-gray-600 dark:hover:bg-gray-400 transition-all duration-300"
                style={{fontSize:"10px"}}
                onClick={() => setIsAddModalOpen(true)}
                >
                + Add Location Details
              </button>
            </div>
          </div>
          </div>
        </div>
        <div className="card-body p-0 overflow-x-auto pb-3">
          <div className="p-4 bg-card">
            <div className="flex flex-wrap justify-between items-center mb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span style={{fontSize:"14px"}}>Show</span>
                <select
                  style={{fontSize:"14px"}}
                  className="border p-0 rounded bg-secondary"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(e.target.value === "All" ? "All" : parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                >                 
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                  <option value="All">All</option>
                </select>
                <span style={{fontSize:"14px"}}>entries</span>
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
              <table className="min-w-full overf border rounded-lg bg-card text-foreground" style={{ tableLayout: "fixed" ,fontSize: "13px", padding: "1px" }}>
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                  <th className="px-4 py-2 border text-left">Actions</th>
                    {Object.keys(columnKeyMap).map((key) => (
                      <th
                        key={key}
                        style={{
                          whiteSpace: "nowrap", 
                          overflow: "hidden",   
                          textOverflow: "ellipsis",}}
                        onClick={() => handleSort(key)}
                        className="cursor-pointer px-4 py-2 border text-left"
                      >
                        {key.toUpperCase()}{" "}
                        {sortConfig.key === columnKeyMap[key] ? (
                          sortConfig.direction === "asc" ? "▲" : "▼"
                        ) : (
                          "↕"
                        )}
                      </th>
                    ))}
                    
                  </tr>
                </thead>
                <tbody style={{ 
                  fontSize: "12px",
                  whiteSpace: "nowrap", 
                  overflow: "hidden",   
                  textOverflow: "ellipsis", }}>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.Loc_Details_ID} className="border hover:bg-muted">
                         
                         <td className="px-4 py-2 border">
                          <button onClick={() => handleEdit(item)} className="mr-2 text-blue-500">
                            <FaEdit />
                          </button>
                          {/* <button onClick={() => handleDelete(item.Location_Id)} className="px-4 text-red-500">
                            <FaTrash />
                          </button> */}
                        </td>
                        <td className="px-4 py-2 border">{item.Loc_Details_ID}</td>
                        <td className="px-4 py-2 border">{item.Location_Code}</td>
                        <td className="px-4 py-2 border">{item.Location}</td>
                        <td className="px-4 py-2 border"style={{ minWidth: "200px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.Customer_Name}</td>
                        <td className="px-4 py-2 border" style={{ minWidth: "500px", maxWidth: "500px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.Delivery_Address}
                        </td>     
                        <td className="px-4 py-2 border">{item.Incoterms}</td>
                        <td className="px-4 py-2 border">{item.Transit_Days}</td>
                        <td className="px-4 py-2 border">{item.Dest_Port}</td>
                       
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-between items-center mt-4 space-y-2">
              <div style={{fontSize:"14px"}}>
                Showing{" "}
                {filteredData.length > 0
                  ? `${(currentPage - 1) * rowsPerPage + 1} to ${Math.min(
                      currentPage * rowsPerPage,
                      filteredData.length
                    )} of ${filteredData.length} entries`
                  : "0 entries"}
              </div>
              <div className="flex space-x-2" style={{fontSize:"14px"}}>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  {"<<"}
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  {"<"}
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`px-3 py-1 border rounded ${
                      currentPage === i + 1 ? "bg-primary text-primary-foreground" : ""
                    }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  {">"}
                </button>
                <button
                  className="px-3 py-1 border rounded"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  {">>"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[60%] lg:w-[40%] h-[84vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Update Location Details</h2>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(80vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold">Location ID</label>
                  <label className="w-full p-2 border rounded block bg-gray-100 dark:bg-gray-700">
                    {formData.Loc_Details_ID}
                  </label>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-semibold">Location Code</label>
                <label className="w-full p-2 border rounded block bg-gray-100 dark:bg-gray-700">
                    {formData.Location_Code}
                </label>
              </div>
                {[
                  { label: "Customer Name", key: "Customer_Name" },
                  { label: "Delivery Address", key: "Delivery_Address", type: "textarea" },
                  { label: "Commodity", key: "Commodity" },
                  { label: "HSN Code", key: "HSN_Code" },
                  { label: "Incoterms", key: "Incoterms" },
                  { label: "Transit Days", key: "Transit_Days", type: "number" },
                  { label: "Free Days", key: "Free_Days", type: "number" },
                  { label: "Dest. Port", key: "Dest_Port" },
                  { label: "Pref. Vessel", key: "Pref_Vessel" },
                  { label: "Pref. Service", key: "Pref_Service" },
                  { label: "Pref. Liners", key: "Pref_Liners" },
                  { label: "Avg Cont./Month", key: "Avg_Cont_Per_Mnth" },
                ].map((item, index) => (
                  <div key={index} className="col-span-1">
                    <label className="block text-sm font-semibold">{item.label}</label>
                    {item.type === "textarea" ? (
                      <textarea
                        className="w-full p-2 border rounded"
                        value={formData[item.key]}
                        onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                      />
                    ) : (
                      <input
                        type={item.type || "text"}
                        className="w-full p-2 border rounded"
                        value={formData[item.key]}
                        onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end p-4 bg-gray-200 dark:bg-gray-700 rounded-b-lg">
              <button
                onClick={() => setIsModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`px-4 py-2 rounded flex items-center justify-center 
                ${saveState === "success" ? "bg-green-500 text-white" : 
                saveState === "error" ? "bg-red-500 text-white" : 
                "bg-blue-500 text-white"}`}
              >
                {saveState === "saving" ? (
                  <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full"></div>
                ) : saveState === "success" ? (
                  <span className="text-lg">✔</span>
                ) : saveState === "error" ? (
                  <span className="text-lg">❌</span>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[60%] lg:w-[40%] h-[79vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">     
        <h2 className="text-lg font-bold">Add New Location</h2>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(75vh-100px)]">      
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {locationCodes.length > 0 ? (
            <div className="col-span-1">
              <label className="block text-sm font-semibold">Location Code</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.Location_Code || ""}
                onChange={(e) => setFormData({ ...formData, Location_Code: e.target.value })}
              >
                <option value="">Select Location Code</option>
                {locationCodes.sort().map((code, index) => (
                  <option key={index} value={code}>{code}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="col-span-1">Loading location codes...</div>
          )}
          {[
            { label: "Location", key: "Location" },
            { label: "Customer Name", key: "Customer_Name" },
            { label: "Delivery Address", key: "Delivery_Address", type: "textarea" },
            { label: "Commodity", key: "Commodity" },
            { label: "Incoterms", key: "Incoterms" },
            { label: "Transit Days", key: "Transit_Days", type: "number" },
            { label: "Dest. Port", key: "Dest_Port" },
            { label: "Free Days", key: "Free_Days", type: "number" },
            { label: "Pref. Vessel", key: "Pref_Vessel" },
            { label: "Pref. Service", key: "Pref_Service" },
            { label: "Pref. Liners", key: "Pref_Liners" },
            { label: "Avg Cont./Month", key: "Avg_Cont_Per_Mnth" },
          ].map((item, index) => (
            <div key={index} className="col-span-1">
              <label className="block text-sm font-semibold">{item.label}</label>
              {item.type === "textarea" ? (
                <textarea
                  className="w-full p-2 border rounded"
                  value={formData[item.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                />
              ) : (
                <input
                  type={item.type || "text"}
                  className="w-full p-2 border rounded"
                  value={formData[item.key] || ""}
                  onChange={(e) => setFormData({ ...formData, [item.key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
        </div>
          <div className="flex justify-end p-4 bg-gray-200 dark:bg-gray-700 rounded-b-lg">
              <button     
                onClick={() => setIsAddModalOpen(false)}
                className="mr-2 px-4 py-2 bg-gray-500 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNewLocation}
                className={`px-4 py-2 rounded flex items-center justify-center 
                ${saveState === "success" ? "bg-green-500 text-white" : 
                saveState === "error" ? "bg-red-500 text-white" : 
                "bg-blue-500 text-white"}`}
              >
                {saveState === "saving" ? (
                  <div className="animate-spin w-5 h-5 border-4 border-white border-t-transparent rounded-full"></div>
                    ) : saveState === "success" ? (
                  <span className="text-lg">✔</span>
                    ) : saveState === "error" ? (
                  <span className="text-lg">❌</span>
                    ) : (
                  "Save"
                    )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LOCMaster;