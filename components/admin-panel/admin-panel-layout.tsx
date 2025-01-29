"use client";

import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useStore } from "@/hooks/use-store";
import { cn } from "@/lib/utils";

export default function AdminPanelLayout({
  children,
} : {
  children: React.ReactNode;
}) {
  const sidebar = useStore(useSidebar, (x) => x);

  if (!sidebar) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const { getOpenState = () => false, settings = { disabled: true } } = sidebar;

  return (
    <div id="layout" className="flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      <div className="flex-1 overflow-x-hidden">
        {/* Main Content */}
        <main
          className={cn(
            "min-h-[calc(100vh_-_56px)] bg-zinc-100 dark:bg-zinc-900 transition-all ease-in-out duration-300 overflow-x-auto",
            !settings.disabled &&
              (!getOpenState() ? "lg:pl-[90px]" : "lg:pl-60")
          )}
        >
          {/* <div className="max-w-full overflow-x-auto"> */}
            {children}
          {/* </div> */}
        </main>

        {/* Footer */}
        <footer
          id="footer"
          className={cn(
            "transition-all ease-in-out duration-300",
            !settings.disabled &&
              (!getOpenState() ? "lg:pl-[90px]" : "lg:pl-60")
          )}
        >
          <Footer />
        </footer>
      </div>
    </div>
  );
}
