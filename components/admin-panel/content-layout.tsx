// "use client";
// import { useState } from "react";
import { Navbar } from "@/components/admin-panel/navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}
//  pt-8 pb-8 px-4 sm:px-8 max-w-full overflow-x-auto
export function ContentLayout({ title, children }: ContentLayoutProps) {
  return (
    <div >
      <Navbar title={title} />
      <div className="container p-4 sm:max-w-full overflow-x-auto"> 
        {children}
      </div>
    </div>
  );
}
