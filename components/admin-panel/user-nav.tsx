"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LayoutGrid, LogOut, User } from "lucide-react";
import secureLocalStorage from "react-secure-storage";
import { handleLogin } from "@/lib/auth";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser
} from "@fortawesome/free-solid-svg-icons";

export function UserNav() {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const checkLogin = async () => {
      const user = secureLocalStorage.getItem("un");
      const sc = secureLocalStorage.getItem("sc");
      setIsAdmin(sc === 'admin');
      if (typeof user === "string") {
        setUser(user);
      }
      const email = secureLocalStorage.getItem("em");
      if (typeof email === "string") {
        setEmail(email);
      }
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
    const vname = secureLocalStorage.getItem("vn");
    if (typeof vname === "string") {
      setVendorName(vname);
    }
  }, []);
  const handleLogout = () => {
    secureLocalStorage.clear();
    window.location.href = "/";
  }
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="#" alt="Avatar" />
                  <AvatarFallback className="bg-transparent">
                    <FontAwesomeIcon icon={faUser} />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {vendorName}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href={isAdmin ? "/settings/dashboarda" : "/dashboard"} className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer" onClick={() => handleLogout()}>
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
