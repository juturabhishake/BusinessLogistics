"use client";
import { Menu } from "@/components/admin-panel/menu";
import { SidebarToggle } from "@/components/admin-panel/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";
// import { PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import secureLocalStorage from "react-secure-storage";

export function Sidebar() {
  const sidebar = useStore(useSidebar, (x) => x);
  if (!sidebar) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebar;
  return (
    <aside
      id="layout"
      className={cn(
        "fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300",
        !getOpenState() ? "w-[90px]" : "w-60",
        settings.disabled && "hidden"
      )}
      style={{backgroundColor:"var(--bg)"}}
    >
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="relative h-full flex flex-col px-3 py-2 overflow-y-auto shadow-md dark:shadow-zinc-800"
      >
        <Button
          className={cn(
            "transition-transform ease-in-out duration-300 mb-1",
            !getOpenState() ? "translate-x-1" : "translate-x-0"
          )}
          variant="link"
          asChild
        >
          <Link href={secureLocalStorage.getItem("sc") === "admin" ? "/settings/dashboarda" : "/dashboard"} className="flex items-center gap-2">
            {/* <PanelsTopLeft className="w-6 h-6 mr-1" /> */}
            {!getOpenState() && <b><h1 className="font-bold text-lg font-serif">GTI</h1></b> }
            <h1
              className={cn(
                "font-bold text-md whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300",
                !getOpenState()
                  ? "-translate-x-96 opacity-0 hidden"
                  : "translate-x-0 opacity-100"
              )}
            >
              {getOpenState() ? <b><h1 className="font-bold text-lg font-serif">Greentech Industries</h1></b> : ""}
            </h1>
          </Link>
        </Button>
        <hr className="mt-1"/>
        <Menu isOpen={getOpenState()} />
      </div>
    </aside>
  );
}
