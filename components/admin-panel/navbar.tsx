import { useEffect, useState } from "react";
import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0); 
  const [formattedTime, setFormattedTime] = useState<string>("");

  useEffect(() => {
    const fetchTimeLeft = async () => {
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
    };

    fetchTimeLeft();

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev > 0) {
          return prev - 1; 
        }
        clearInterval(interval);
        return 0; 
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const formatTime = (totalSeconds: number) => {
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      // const seconds = totalSeconds % 60;

      return `${days}D:${hours}H:${minutes}M`; //:${seconds}
    };

    setFormattedTime(formatTime(timeLeft));
  }, [timeLeft]);

  return (
    <header id="layout" className="bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="flex justify-space-between mx-4 sm:mx-8 flex h-14 items-center">
        <div className="flex items-center space-x-4 lg:space-x-0">
          <SheetMenu />
          <h1 className="font-bold">
            {title} <Badge style={{ fontSize:"10px"}}>{formattedTime}</Badge>
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