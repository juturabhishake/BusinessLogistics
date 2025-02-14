"use client";

import { useEffect, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import { handleLogin } from "@/lib/auth";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useTheme } from "next-themes";

interface ChartData {
  Location_Code: string;
  [key: string]: number | string;
}

const Page = () => {
  const { theme } = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isDarkMode = theme === "dark";
  const [exportFCLChartData, setExportFCLChartData] = useState<ChartData[]>([]);
  const [importFCLChartData, setImportFCLChartData] = useState<ChartData[]>([]);
  const [exportLCLChartData, setExportLCLChartData] = useState<ChartData[]>([]);
  const [importLCLChartData, setImportLCLChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const checkLogin = async () => {
      const user = secureLocalStorage.getItem("un");
      const email = secureLocalStorage.getItem("em");
      const password = secureLocalStorage.getItem("pw");
      if (!email || !password || !user) {
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
      const isAccess = await handleLogin(email, password);
      if (!isAccess) {
        secureLocalStorage.clear();
        window.location.href = "/";
        return;
      }
    };
    checkLogin();
  }, []);

  const fetchChartData = async (apiUrl: string, setChartData: (data: ChartData[]) => void) => {
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      const groupedData: Record<string, ChartData> = {};

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.forEach((curr: any) => {
        const location = curr.Location_Code;
        if (!groupedData[location]) {
          groupedData[location] = { Location_Code: location };
        }
        groupedData[location][`${curr.CBM || curr.Cont_Feet}cbm`] = curr.Total_Ship_Cost;
      });

      setChartData(Object.values(groupedData));
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  useEffect(() => {
    fetchChartData("/api/dashboard/get_Export_FCL_Quote", setExportFCLChartData);
    fetchChartData("/api/dashboard/get_Import_FCL_Quote", setImportFCLChartData);
    fetchChartData("/api/dashboard/get_Export_LCL_Quote", setExportLCLChartData);
    fetchChartData("/api/dashboard/get_Import_LCL_Quote", setImportLCLChartData);
  }, []);

  const chartConfig: ChartConfig = {
    cbm: {
      label: "CBM",
      color: "hsl(var(--chart-1))",
    },
  };

  const charts = [
    { title: "Export FCL Data", data: exportFCLChartData },
    { title: "Import FCL Data", data: importFCLChartData },
    { title: "Export LCL Data", data: exportLCLChartData },
    { title: "Import LCL Data", data: importLCLChartData },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle>{chart.title}</CardTitle>
            <CardDescription>Showing total ship cost by location</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart accessibilityLayer data={chart.data} margin={{ left: 12, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="Location_Code"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                {Object.keys(chart.data[0] || {})
                  .filter((k) => k !== "Location_Code")
                  .map((key, idx) => (
                    <Area
                      key={idx}
                      dataKey={key}
                      type="natural"
                      fill={`hsl(var(--chart-${idx + 1}))`}
                      fillOpacity={0.4}
                      stroke={`hsl(var(--chart-${idx + 1}))`}
                      stackId="a"
                    />
                  ))}
                <ChartLegend content={<ChartLegendContent keys={Object.keys(chart.data[0] || {}).filter(k => k !== "Location_Code")} />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  Business Logistics Analytics <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  February 2025
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Page;