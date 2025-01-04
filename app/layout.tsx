"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Script from 'next/script';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Business Logistics",
//   description: "A sample admin panel with persistent layout.",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = useMemo(()=> pathname === "/", [pathname]);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Business Logistics</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdn.datatables.net/2.1.8/css/dataTables.dataTables.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script src="https://cdn.datatables.net/2.1.8/js/dataTables.js"></Script>
        {!isLoginPage ? (
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AdminPanelLayout>
              <ContentLayout title="Business Logistics">
                {children}
              </ContentLayout>
            </AdminPanelLayout>
          </ThemeProvider>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
