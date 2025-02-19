/* eslint-disable react-hooks/rules-of-hooks */
import {
  Tag,
  Users,
  LocateFixedIcon,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon
} from "lucide-react";
import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string): Group[] {
  const [menuList, setMenuList] = useState<Group[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const sc = secureLocalStorage.getItem("sc");
    setIsAdmin(sc === "admin");
  }, []);

  useEffect(() => {
    const generatedMenuList: Group[] = [
      !isAdmin ? 
      {
        groupLabel: "",
        menus: [
          {
            href: "/dashboard",
            label: "Dashboard",
            icon: LayoutGrid,
            active: pathname === "/dashboard",
            submenus: [],
          }
        ]
      }: null,
      !isAdmin ? {
        groupLabel: "Contents",
        menus: [
          {
            href: "",
            label: "Exports",
            icon: SquarePen,
            submenus: [
              { href: "/export/FCL", label: "FCL" },
              { href: "/export/LCL", label: "LCL" }
            ],
          },
          {
            href: "",
            label: "Imports",
            icon: SquarePen,
            submenus: [
              { href: "/RFQ-Prices/FCL", label: "FCL" },
              { href: "/RFQ-Prices/LCL", label: "LCL" }
            ],
          },
          {
            href: "/categories",
            label: "Categories",
            icon: Bookmark
          },
          {
            href: "/tags",
            label: "Tags",
            icon: Tag
          }
        ]
      } : null,
      isAdmin ? 
      {
          groupLabel: "Admin config",
          menus: [
            {
              href: "/settings/dashboarda",
              label: "Dashboard",
              icon: LayoutGrid
            },
            {
              href: "/settings/vendors",
              label: "Vendors",
              icon: Users
            },
            {
              href: "",
              label: "Locations",
              icon: LocateFixedIcon,
              submenus: [
                { href: "/settings/location_settings", label: "Location Master" },
                { href: "/settings/location_details", label: "Location Details" }
              ]
            },
            {
              href: "/account",
              label: "Account",
              icon: Settings
            }
          ]
        } : null,
    ].filter(Boolean) as Group[]; 

    setMenuList(generatedMenuList);
  }, [isAdmin, pathname]);

  return menuList;
}