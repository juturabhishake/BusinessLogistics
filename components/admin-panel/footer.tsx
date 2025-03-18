import Link from "next/link";
import { Download } from "lucide-react"; // Importing the download icon
//<strong>Copyright © 2024 GTI. </strong> All rights reserved.
export function Footer() {
  return (
    <div id="layout" className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">
         <strong>Copyright © 2024 </strong>{" "}
          <Link
            href="https://gti-india.co.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 decoration-none"
          >
            <strong>GTI</strong>
          </Link>
          . All rights reserved.
        </p>

        <Link 
          href="/UserManual.pdf" // Updated path to the manual
          target="_blank"
          rel="noopener noreferrer"
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-primary transition"
          download
        >
          <Download size={16} /> {/* Icon Size */}
          Download Manual
        </Link>
      </div>
    </div>
  );
}
