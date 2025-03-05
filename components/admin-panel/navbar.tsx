import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { Badge } from "@/components/ui/badge";


interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [formattedTime, setFormattedTime] = useState<string>("Loading...");

  useEffect(() => {
    const fetchTimeLeft = async () => {
      try {
        const response = await fetch("/api/get_time_left", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            month: 3,
            year: 2025,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const totalMinutesLeft = data.result[0].Total_Minutes_Left;
          setTimeLeft(totalMinutesLeft * 60); 
        }
      } catch (error) {
        console.error("Error fetching time left:", error);
      }
    };

    fetchTimeLeft();
  }, []);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev !== null ? Math.max(prev - 1, 0) : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  useEffect(() => {
    const formatTime = (totalSeconds: number | null) => {
      if (totalSeconds === null) return "Loading...";
      if (totalSeconds <= 0) return "Time's Up!";

      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      return `${days}D: ${hours}H: ${minutes}M: ${seconds}S`;
    };

    setFormattedTime(formatTime(timeLeft));
  }, [timeLeft]);

  return (
    <header id="layout" className="bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="flex justify-between mx-4 sm:mx-8 h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">
            {title} <Badge style={{ fontSize: "12px" }}>{formattedTime}</Badge>
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
