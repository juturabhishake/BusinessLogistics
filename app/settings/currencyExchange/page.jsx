"use client";
import { useEffect, useState } from "react";
import { FaSave, FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import secureLocalStorage from "react-secure-storage";

const CurrencyPage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [usd, setUsd] = useState("");
  const [euro, setEuro] = useState("");
  const [createdBy, setCreatedBy] = useState("Admin");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [success, setSuccess] = useState(null); 

  useEffect(() => {
    const check_sc = secureLocalStorage.getItem("sc");
    setIsAdmin(check_sc === 'admin');
    if (check_sc !== 'admin') {
      window.location.href = "/";
    }
  }, []);
  const fetchCurrency = async () => {
      try {
        const month = selectedDate ? selectedDate.month() + 1 : new Date().getMonth() + 1;
        const year = selectedDate ? selectedDate.year() : new Date().getFullYear();
        console.log('Curr Month:', month);  
        console.log('Curr Year:', year);  
        const response = await fetch('/api/get_currency_MonthYear',{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Month: month,Year :  year}),
        });
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          setUsd(parseFloat(data.result[0].USD));
          setEuro(parseFloat(data.result[0].EURO));
        } else {
          setUsd(0);
          setEuro(0);
        }
      } catch (error) {
        console.error("Error fetching currency:", error);
      }
    };
  
    useEffect(() => {
      fetchCurrency();
    }, []);
    useEffect(() => {
        fetchCurrency();
    }, [selectedDate]);

  const handleSave = async () => {
    setLoading(true);
    setSuccess(null);

    const month_no = selectedDate.month() + 1;
    const year_no = selectedDate.year();

    try {
      const res = await fetch('/api/insertCurrencyExchange', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          month_no,
          year_no,
          usd,
          euro,
          created_by: createdBy,
        })
      });

      const data = await res.json();
      if (data) {
        setSuccess(true);
        alert("Currency data saved successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-[10%]">
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Currency Exchange</h1>
      <div className="mt-6">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label={<span className="text-gray-800 dark:text-white">Select Month & Year</span>}
            views={["year", "month"]}
            openTo="month"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            className="w-full"
            sx={{
              "& .MuiInputBase-root": {
                color: "var(--borderclr)",
                borderRadius: "8px",
                fontSize: "14px",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "var(--borderclr)"
              },
              "& .MuiSvgIcon-root": {
                color: "var(--borderclr)",
              },
            }}
          />
        </LocalizationProvider>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between">
          <label htmlFor="usd" className="text-gray-800 dark:text-white">USD</label>
          <input
            id="usd"
            type="number"
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            className="p-2 border rounded-lg w-32 dark:bg-gray-700 dark:text-white"
            step="any"
          />
        </div>
        <div className="flex justify-between">
          <label htmlFor="euro" className="text-gray-800 dark:text-white">EURO</label>
          <input
            id="euro"
            type="number"
            value={euro}
            onChange={(e) => setEuro(e.target.value)}
            className="p-2 border rounded-lg w-32 dark:bg-gray-700 dark:text-white"
            step="any"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className={`mt-6 w-full py-2 px-4 ${loading ? 'bg-gray-400' : 'bg-blue-600'} text-white rounded-lg flex justify-center items-center hover:bg-blue-700`}
        >
          {loading ? (
            <FaSpinner className="animate-spin mr-2" />
          ) : success ? (
            <FaCheckCircle className="text-green-500 mr-2" />
          ) : success === false ? (
            <FaTimesCircle className="text-red-500 mr-2" />
          ) : (
            <FaSave className="mr-2" />
          )}
          {loading ? 'Saving...' : success ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
    </div>
  );
};

export default CurrencyPage;
