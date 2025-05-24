/* eslint-disable react-hooks/rules-of-hooks */
import {
  // Tag,
  Users,
  LocateFixedIcon,
  Settings,
  // Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Database,
  NotepadText,
  Currency,
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
              { href: "/export/LCL", label: "LCL" },
              { href: "/export/ADOC_FCL", label: "ADOC FCL" },
              { href: "/export/ADOC_LCL", label: "ADOC LCL" },
            ],
          },
          {
            href: "",
            label: "Imports",
            icon: SquarePen,
            submenus: [
              { href: "/RFQ-Prices/FCL", label: "FCL" },
              { href: "/RFQ-Prices/LCL", label: "LCL" },
              { href: "/export/ADOC_FCL", label: "ADOC FCL" },
              { href: "/export/ADOC_LCL", label: "ADOC LCL" },
            ],
          },
          {
            href: "",
            label: "AirShipments",
            icon: SquarePen,
            submenus: [
              { href: "/AirShipment/Export", label: "Export" },
              { href: "/AirShipment/Import", label: "Import" }
            ],
          },
          {
            href: "/terms_conditions",
            label: "Terms",
            icon: NotepadText
          },
          // {
          //   href: "/tags",
          //   label: "Tags",
          //   icon: Tag
          // }
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
              label: "Prints(Export)",
              icon: Database,
              submenus: [
                { href: "/settings/print/Export/FCL", label: "FCL" },
                { href: "/settings/print/Export/LCL", label: "LCL" }
              ]
            },
            {
              href: "",
              label: "Prints(Import)",
              icon: Database,
              submenus: [
                { href: "/settings/print/Import/FCL", label: "FCL" },
                { href: "/settings/print/Import/LCL", label: "LCL" }
              ]
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
            },
            {
              href: "/settings/currencyExchange",
              label: "Currency Exchange",
              icon: Currency
            },
            {
              href: "/terms_conditions",
              label: "Terms",
              icon: NotepadText
            }
          ]
        } : null,
    ].filter(Boolean) as Group[]; 

    setMenuList(generatedMenuList);
  }, [isAdmin, pathname]);

  return menuList;
}