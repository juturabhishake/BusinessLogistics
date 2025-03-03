"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import {
  FiEdit2,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiSave,
  FiCheck,
  FiLoader,
  FiXCircle,
} from "react-icons/fi";
import secureLocalStorage from "react-secure-storage";
import { handleLogin } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FormData {
  user: string;
  email: string;
  phone: string;
  address: string;
  company: string;
}

const Page: React.FC = () => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    user: "",
    email: "",
    phone: "",
    address: "",
    company: "",
  });
  const [originalData, setOriginalData] = useState<FormData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const initializeData = async () => {
      const user = secureLocalStorage.getItem("un") as string || "";
      const email = secureLocalStorage.getItem("em") as string || "";
      const phone = secureLocalStorage.getItem("pn") as string || "";
      const address = secureLocalStorage.getItem("address") as string || "";
      const company = secureLocalStorage.getItem("company") as string || "";

      const initialData: FormData = { user, email, phone, address, company };
      setFormData(initialData);
      setOriginalData(initialData);

      const password = secureLocalStorage.getItem("pw") as string;
      if (!email || !password || !user) {
        console.log("No credentials found, redirecting to login.");
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
      const isAccess = await handleLogin(em, password);
      if (!isAccess) {
        console.log("Login failed, redirecting to login.");
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
    };
    initializeData();
    const em = secureLocalStorage.getItem("em");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    if (originalData) {
      setFormData(originalData);
    }
    setIsEditing(false);
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/profile_update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          username: formData.user,
          phone: formData.phone,
          company: formData.company,
          address: formData.address,
        }),
      });

      if (response.ok) {
        setSaveStatus("success");
        secureLocalStorage.setItem("un", formData.user);
        secureLocalStorage.setItem("pn", formData.phone);
        secureLocalStorage.setItem("address", formData.address);
        secureLocalStorage.setItem("company", formData.company);
        setOriginalData(formData);

        setTimeout(() => {
          setSaveStatus("idle");
          setIsEditing(false);
        }, 3000);
        window.location.reload();
      } else {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    } catch (error) {
      console.log(error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };
  const renderSaveButtonContent = () => {
    switch (saveStatus) {
      case "saving":
        return (
          <div className="flex items-center justify-center">
            <FiLoader className="animate-spin mr-2" />
            Saving...
          </div>
        );
      case "success":
        return (
          <div className="flex items-center justify-center">
            <FiCheck className="mr-2" />
            Saved!
          </div>
        );
      case "error":
        return (
          <div className="flex items-center justify-center">
            <FiXCircle className="mr-2" />
            Error
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center">
            <FiSave className="mr-2" />
            Save Changes
          </div>
        );
    }
  };
  const handleForgotPassword = async () => {
    setForgotStatus("saving");
    try {
      const response = await fetch(`/api/change_password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        }),
      });

      if (response.ok) {
        secureLocalStorage.setItem("pw", passwords.newPassword);
        setForgotStatus("success");
        setTimeout(() => {
          setForgotStatus("idle");
          setIsModalOpen(false);
        }, 3000);
        window.location.reload();
      } else {
        setForgotStatus("error");
        setTimeout(() => setForgotStatus("idle"), 3000);
      }
    } catch (error) {
      setForgotStatus("error");
      console.log(error);
      setTimeout(() => setForgotStatus("idle"), 3000);
    }
  };
  //hover:scale-105
  return (
    <div className="py-12 px-12 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="shadow-xl rounded-lg overflow-hidden transform transition-all duration-300 ">
          <div className="relative h-[10rem]" style={{ background: "var(--bg)" }}>
            <div className="absolute bottom-2 left-0 right-0 p-6">
              <div className="rounded-full w-24 h-24 border-4 border-white shadow-lg mx-auto flex items-center justify-center">
                <FontAwesomeIcon icon={faUser} className="text-primary text-4xl" />
              </div>
            </div>
          </div>

          <div className="p-6 pt-16">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                    if (isEditing) {
                      handleCancel();
                    }
                    setIsEditing(!isEditing);
                  }}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                <FiEdit2 className="mr-1" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <FiUser className="text-gray-400" />
                  <span className="text-primary">{formData.user}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiMail className="text-gray-400" />
                  <span className="text-primary">{formData.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiPhone className="text-gray-400" />
                  <span className="text-primary">{formData.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiMapPin className="text-gray-400" />
                  <span className="text-primary">{formData.address}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FiBriefcase className="text-gray-400" />
                  <span className="text-primary">{formData.company}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary">Username</label>
                  <Input
                    type="text"
                    name="user"
                    value={formData.user}
                    onChange={handleChange}
                    className="mt-1 h-10 px-3 border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary">Phone</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 h-10 px-3 border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary">Address</label>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 px-3 border-gray-300 rounded-md"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary">Company</label>
                  <Input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-1 h-10 px-3 border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:gap-2 sm:justify-between mt-3" style={{display: "flex",  justifyContent: "space-between", alignItems: "center", gap: "1rem"}}>
                    <Button
                       type="submit"
                       className=" w-md-auto bg-[var(--forgotbutton)] text-white rounded-md hover:bg-[var(--forgotbuttonHover)] transition-colors duration-200"
                       onClick={() => setIsModalOpen(true)}
                       style={{width: "100%"}}
                     >
                       Change Password
                     </Button>
                     <Button
                        type="submit"
                        className="w-full bg-[var(--button)] text-white rounded-md hover:bg-[var(--buttonHover)] transition-colors duration-200"
                        onClick={handleSubmit}
                        disabled={saveStatus === "saving"}
                      >
                    {renderSaveButtonContent()}
                  </Button>
                </div>
            </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        >
          <div
            className="bg-secondary rounded-lg p-6 shadow-lg w-11/12 sm:w-[500px] max-w-full"
            
          >
            <h2 className="text-xl font-semibold mb-4 text-center">Reset Password</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
            >
              <div>
                <label className="block text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  name="currentPassword"
                  className="mt-1 w-full"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  name="newPassword"
                  className="mt-1 w-full"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  className="mt-1 w-full"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Button
                  type="submit"
                  style={{ width: "100%" }}
                  className={`w-full sm:w-auto bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition-colors duration-200 flex items-center justify-center ${
                    forgotStatus === "saving" ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                  disabled={forgotStatus === "saving"}
                >
                  {forgotStatus === "saving" ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : forgotStatus === "success" ? (
                    <FiCheck className="mr-2" />
                  ) : forgotStatus === "error" ? (
                    <FiXCircle className="mr-2" />
                  ) : null}
                  {forgotStatus === "saving"
                    ? "Submitting..."
                    : forgotStatus === "success"
                    ? "Success!"
                    : forgotStatus === "error"
                    ? "Error"
                    : "Submit"}
                </Button>
                <Button
                  onClick={() => setIsModalOpen(false)}
                  style={{ width: "100%" }}
                  className="w-full sm:w-auto bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200 flex items-center justify-center"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;


