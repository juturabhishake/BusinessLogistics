"use client";
import { useState, useEffect, useMemo } from "react";
import { FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import secureLocalStorage from "react-secure-storage";

const LOCMaster = () => {
  const [data, setData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [addRow, setaddRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    Vendor_Id: "",
    Vendor_Code: "",
    Vendor_Name: "",
    Contact_Name: "",
    Contact_No: "",
    Contact_Email: "",
    Email_2: "",
    Email_3: "",
    Vendor_Type: "",
    IsActive: "",     
    Status:"",
  });

  const [AddformData, setAddformData] = useState({  
    Vendor_Id: "",
    Vendor_Code: "", 
    Vendor_Name: "",
    Contact_Name: "",
    Contact_No: "",
    Contact_Email: "",
    Email_2: "",
    Email_3: "",
    Vendor_Type: "",
    IsActive: "",    
    
  });
  const [saveState, setSaveState] = useState("idle");
  const [deleteState, setDeleteState] = useState({});
  const rfqtypes = ["FCL", "LCL", "BOTH", "FCLIMPORT", "LCLIMPORT"];
  const currtypes = ["USD", "EURO"];
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let flag = false
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    flag = (check_sc === 'admin')
    console.log("is admin : ", isAdmin, flag, check_sc)
    if(!flag) {
      // secureLocalStorage.clear();
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/get_vendors");
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
    ID: "Vendor_Id",   
    Vendor_Name: "Vendor_Name",
    Contact_Name: "Contact_Name",
    Contact_No: "Contact_No",    
    Email: "Contact_Email",    
    "Email 2": "Email_2", 
    "Email 3": "Email_3",    
    Active:"Status",
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
        Vendor_Id: row.Vendor_Id,
        Vendor_Code: row.Vendor_Code,
        Vendor_Name: row.Vendor_Name,
        Contact_Name: row.Contact_Name,
        Contact_No: row.Contact_No,
        Contact_Email: row.Contact_Email,
        Email_2: row.Email_2,
        Email_3: row.Email_3,
        Vendor_Type: row.Vendor_Type,
        IsActive: row.IsActive,     
      UpdatedBy: secureLocalStorage.getItem("un"),      
    });
    setIsModalOpen(true);
  };

  const handleAdd = (row) => {
    setaddRow(row);
    setAddformData({      
        Vendor_Id: row.Vendor_Id,
        Vendor_Code: row.Vendor_Code,
        Vendor_Name: row.Vendor_Name,
        Contact_Name: row.Contact_Name,
        Contact_No: row.Contact_No,
        Contact_Email: row.Contact_Email,
        Email_2: row.Email_2,
        Email_3: row.Email_3,         
        AddformData: secureLocalStorage.getItem("un"),      
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    if(formData.Vendor_Id==="" || formData.Vendor_Name==="" || formData.Contact_Name==="" || formData.Contact_No==="" || formData.Contact_Email==="" || formData.Email_2==="" || formData.Email_3==="" || formData.IsActive===""){
      alert("required all inputs");
      return
    }
    setSaveState("saving");
    try {
      const response = await fetch("/api/update_vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({                
          Vendor_Id: formData.Vendor_Id,         
          Vendor_Name: formData.Vendor_Name,
          Contact_Name: formData.Contact_Name,
          Contact_No: formData.Contact_No,
          Contact_Email: formData.Contact_Email,
          Email_2: formData.Email_2,
          Email_3: formData.Email_3,
          Vendor_Type: formData.Vendor_Type,
          IsActive: formData.IsActive,        
          UpdatedBy: secureLocalStorage.getItem("un"), 
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update location");
      }

      setData((prevData) =>
        prevData.map((row) =>
          row.Vendor_Id === editRow.Vendor_Id ? { ...row, ...formData } : row
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

  const handleDelete = async (Vendor_Id) => {
    setDeleteState((prev) => ({ ...prev, [Vendor_Id]: "deleting" }));

    try {
      const response = await fetch("/api/delete_location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Vendor_Id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete location");
      }

      setData((prevData) => prevData.filter((row) => row.Vendor_Id !== Vendor_Id));

      setDeleteState((prev) => ({ ...prev, [Vendor_Id]: "success" }));
      setTimeout(() => {
        setDeleteState((prev) => ({ ...prev, [Vendor_Id]: "idle" }));
      }, 3000);
    } catch (error) {
      console.error("Delete failed:", error.message);
      setDeleteState((prev) => ({ ...prev, [Vendor_Id]: "error" }));
      setTimeout(() => {
        setDeleteState((prev) => ({ ...prev, [Vendor_Id]: "idle" }));
      }, 3000);
    }
  };
  const handleAddNewLocation = async () => {
    if(AddformData.Vendor_Name==="" || AddformData.Contact_Name==="" || AddformData.Contact_No==="" || AddformData.Contact_Email==="" || AddformData.Email_2==="" || AddformData.Email_3===""){ 
      alert("required all fields!!!")
      return
    }
    setSaveState("saving");
    try {
      const response = await fetch("/api/save_vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
            Vendor_Name: AddformData.Vendor_Name,
            Contact_Name: AddformData.Contact_Name,
            Contact_No: AddformData.Contact_No,
            Contact_Email: AddformData.Contact_Email,
            Email_2: AddformData.Email_2,
            Email_3: AddformData.Email_3,
          CreatedBy: secureLocalStorage.getItem("un"),
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || "Failed to add location");
      }
  
      setData((prevData) => [
        ...prevData,
        { ...AddformData, Vendor_Id: result.Vendor_Id },
      ]);
      setTimeout(() => {
        setSaveState("idle");
      }, 3000);
      setIsAddModalOpen(false);
      fetchData();
      window.location.reload();
      setSaveState("success");
  
    
    } catch (error) {
      console.error("Add failed:", error.message);
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
            <div className="flex flex-col">
              <h2 className="text-sm font-bold">Admin Settings / <span className="text-xs text-gray-100">Vendors</span></h2>
            </div>
            <div className="flex mt-2 lg:mt-0 w-full lg:w-auto justify-start">
              <button className="p-2 rounded-lg font-semibold 
                bg-gray-500 text-white hover:bg-gray-600 
                dark:bg-gray-600 dark:hover:bg-gray-400 transition-all duration-300"
                style={{fontSize:"10px"}}
                onClick={() => setIsAddModalOpen(true)}
                >
                + Add New Vendor
              </button>
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
              <table className="min-w-full overf border rounded-lg bg-card text-foreground" 
                style={{ 
                  tableLayout: "fixed" ,
                  fontSize: "13px", 
                  padding: "1px",
                  whiteSpace: "nowrap", 
                  overflow: "hidden",   
                  textOverflow: "ellipsis", }}>
                <thead className="bg-muted sticky top-0 z-10">
                  <tr>
                  <th className="px-4 py-2 border text-left">Actions</th>
                    {Object.keys(columnKeyMap).map((key) => (
                      <th
                        key={key}
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
                <tbody style={{ fontSize: "12px" }}>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item) => (
                      <tr key={item.Vendor_Id} className="border hover:bg-muted">
                         <td className="px-4 py-2 border">
                          <button onClick={() => handleEdit(item)} className="mr-2 text-blue-500">
                            <FaEdit />
                          </button>
                          {/* <button onClick={() => handleDelete(item.Location_Id)} className="px-4 text-red-500">
                            <FaTrash />
                          </button> */}
                        </td>
                        <td className="px-4 py-2 border">{item.Vendor_Id}</td>                       
                        <td className="px-4 py-2 border">{item.Vendor_Name}</td>
                        <td className="px-4 py-2 border">{item.Contact_Name}</td>
                        <td className="px-4 py-2 border">{item.Contact_No}  </td>     
                        <td className="px-4 py-2 border">{item.Contact_Email}</td>
                        <td className="px-4 py-2 border">{item.Email_2}</td>
                        <td className="px-4 py-2 border">{item.Email_3}</td>                       
                        <td className="px-4 py-2 border">{item.Status}</td>
                       
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[60%] lg:w-[40%] h-[54vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">

            <h2 className="text-lg font-bold">Update Vendor Details</h2>
            </div>
            <div className="p-6 overflow-y-auto h-[calc(50vh-100px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold">Vendor ID</label>
                {/* <input
                  type="text"
                  readOnly
                  className="w-full p-2 border rounded"
                  value={formData.Location_Id}
                  onChange={(e) => setFormData({ ...formData, Location_Id: e.target.value })}
                /> */}
                 <label className="w-full p-2 border rounded block">
                  {formData.Vendor_Id}
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold">Vendor Name</label>
                {/* <input
                  type="text"
                  readOnly
                  className="w-full p-2 border rounded"
                  value={formData.Location_Code}
                  onChange={(e) => setFormData({ ...formData, Location_Code: e.target.value })}
                /> */}

              <label className="w-full p-2 border rounded block">
                  {formData.Vendor_Name}
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold">Contact Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.Contact_Name}
                  onChange={(e) => setFormData({ ...formData, Contact_Name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Contact No.</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.Contact_No}
                  onChange={(e) => setFormData({ ...formData, Contact_No: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Email</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.Contact_Email}
                  onChange={(e) => setFormData({ ...formData, Contact_Email: e.target.value })}
                />                  

              </div>
             
            
              <div>
                <label className="block text-sm font-semibold">Email 2</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.Email_2}
                  onChange={(e) => setFormData({ ...formData, Email_2: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Email 3</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.Email_3}
                  onChange={(e) => setFormData({ ...formData, Email_3: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold">Status</label>
                <input
                  type="checkbox"
                  className="w-full p-2 border rounded"
                  checked={formData.IsActive}
                  onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                />
              </div>
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
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg md:w-[60%] lg:w-[40%] h-[54vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gray-200 dark:bg-gray-700 p-4 rounded-t-lg">
                <h2 className="text-lg font-bold">Add New Vendor</h2>
              </div>
              <div className="p-6 overflow-y-auto h-[calc(50vh-100px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Vendor Name", key: "Vendor_Name" },
                    { label: "Contact Name", key: "Contact_Name" },
                    { label: "Contact Number", key: "Contact_No" },
                    
                  ].map((item, index) => (
                    <div key={index} className="col-span-1">
                      <label>{item.label}</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={AddformData[item.key]}
                        onChange={(e) => setAddformData({ ...AddformData, [item.key]: e.target.value })}
                      />
                    </div>
                  ))}
               
               <div className="col-span-1">
                <label className="block text-sm font-semibold">Email</label>
                <input
                  type="text"
                   className="w-full p-2 border rounded"
                  value={AddformData.Contact_Email}
                  onChange={(e) => setAddformData({ ...AddformData, Contact_Email: e.target.value })}
                />                 
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-semibold">Email 2</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={AddformData.Email_2}
                  onChange={(e) => setAddformData({ ...AddformData, Email_2: e.target.value })}
                />                
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-semibold">Email 3</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={AddformData.Email_3}
                  onChange={(e) => setAddformData({ ...AddformData, Email_3: e.target.value })}
                />
              </div>
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