"use client";
import { useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { handleLogin } from "@/lib/auth";

const Page = () => {
    useEffect(() => {
        const checkLogin = async () => {
          const user = secureLocalStorage.getItem("un");
          const email = secureLocalStorage.getItem("em");
          const password = secureLocalStorage.getItem("pw");
      
          if (!email || !password || !user) {
            console.log("No credentials found, redirecting to login.");
            secureLocalStorage.clear();
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
        checkLogin();
        const em = secureLocalStorage.getItem("em");
      }, []);
  return (
    <div>page</div>
  )
};

export default Page;
