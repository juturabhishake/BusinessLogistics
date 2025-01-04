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

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    try{
        const response = await fetch(`http://localhost:5188/UserProfile/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: formData.email,
                username: formData.user,
                phone: formData.phone,
                company: formData.company,
                address: formData.address
            }),
        });
        if (response.ok) {
            e.preventDefault();
            setIsEditing(false);
            secureLocalStorage.setItem("un", formData.user);
            secureLocalStorage.setItem("pn", formData.phone);
            secureLocalStorage.setItem("address", formData.address);
            secureLocalStorage.setItem("company", formData.company);
            setOriginalData(formData);
            window.location.reload();
        } else{
            console.log("Failed to update profile.");
        }
    } catch (error) {
        console.log(error);
    }
  };

  return (
    <div className="py-12 px-12 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="shadow-xl rounded-lg overflow-hidden transform transition-all duration-300 hover:scale-105">
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
                <div className="flex justify-between">
                  <Button
                    type="submit"
                    className="w-full bg-[var(--button)] text-white py-2 px-4 rounded-md hover:bg-[var(--buttonHover)] transition-colors duration-200"
                    onClick={handleSubmit}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
