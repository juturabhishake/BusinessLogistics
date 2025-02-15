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
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          active: pathname === "/dashboard",
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Contents",
      menus: [
        {
          href: "",
          label: "Exports",
          icon: SquarePen,
          submenus: [
            {
              href: "/export/FCL",
              label: "FCL"
            },
            {
              href: "/export/LCL",
              label: "LCL"
            }
          ]
        },
        {
          href: "",
          label: "Imports",
          icon: SquarePen,
          submenus: [
            {
              href: "/RFQ-Prices/FCL",
              label: "FCL"
            },
            {
              href: "/RFQ-Prices/LCL",
              label: "LCL"
            }
          ]
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
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/settings/vendors",
          label: "Vendors",
          icon: Users
        },
        // {
        //   href: "/settings/location_settings",
        //   label: "Locations Info",
        //   icon: LocateFixedIcon
        // },
        {
          href: "",
          label: "Locations",
          icon: LocateFixedIcon,
          submenus: [
            {
              href: "/settings/location_settings",
              label: "Location Master"
            },
            {
              href: "/settings/location_details",
              label: "Location Details"
            }
          ]
        },
        {
          href: "/account",
          label: "Account",
          icon: Settings
        }
      ]
    }
  ];
}
