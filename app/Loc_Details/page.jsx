"use client";
import React, { useState } from "react";
import { FiAlertCircle } from "react-icons/fi";

const Loc_Details = () => {
  const [formData, setFormData] = useState({
    locationCode: "",
    customerName: "",
    deliveryAddress: "",
    commodity: "",
    hsnCode: "",
    incoterms: "",
    transitDays: "",
    destPort: "",
    freeDays: "",
    prefVessel: "",
    prefService: "",
    prefLiners: "",
    avgContPerMnth: ""
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.locationCode) newErrors.locationCode = "Location code is required";
    if (!formData.deliveryAddress) newErrors.deliveryAddress = "Delivery address is required";
    if (!formData.incoterms) newErrors.incoterms = "Incoterms is required";
    if (formData.transitDays && isNaN(formData.transitDays)) newErrors.transitDays = "Transit days must be a number";
    if (formData.freeDays && isNaN(formData.freeDays)) newErrors.freeDays = "Free days must be a number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulating API call
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
        resetForm();
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      locationCode: "",
      customerName: "",
      deliveryAddress: "",
      commodity: "",
      hsnCode: "",
      incoterms: "",
      transitDays: "",
      destPort: "",
      freeDays: "",
      prefVessel: "",
      prefService: "",
      prefLiners: "",
      avgContPerMnth: ""
    });
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const locationCodes = ["LOC001", "LOC002", "LOC003", "LOC004", "LOC005"];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Shipping Details</h2>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location Code *</label>
                  <select
                    name="locationCode"
                    value={formData.locationCode}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-400 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 rounded-md px-3 py-2"
                  >
                    <option value="">Select a location code</option>
                    {locationCodes.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  {errors.locationCode && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <FiAlertCircle className="mr-1" /> {errors.locationCode}
                    </p>
                  )}
                </div>

                {[
                  { label: "Customer Name", name: "customerName" },
                  { label: "Delivery Address *", name: "deliveryAddress", type: "textarea" },
                  { label: "Commodity", name: "commodity" },
                  { label: "HSN Code", name: "hsnCode" }
                ].map(({ label, name, type }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    {type === "textarea" ? (
                      <textarea
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        rows={5}
                        className="mt-1 block w-full border border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 px-3 py-2"
                      />
                    ) : (
                      <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 px-3 py-2"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {[
                  { label: "Incoterms *", name: "incoterms" },
                  { label: "Transit Days", name: "transitDays", type: "number" },
                  { label: "Destination Port", name: "destPort" },
                  { label: "Free Days", name: "freeDays", type: "number" },
                  { label: "Preferred Vessel", name: "prefVessel" }
                ].map(({ label, name, type }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
                    <input
                      type={type || "text"}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-400 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button onClick={resetForm} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Reset</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{isSubmitting ? "Submitting..." : "Submit"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Loc_Details;
