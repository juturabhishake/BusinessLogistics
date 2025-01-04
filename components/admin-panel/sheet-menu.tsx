import Link from "next/link";
import { MenuIcon } from "lucide-react"; //PanelsTopLeft

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/admin-panel/menu";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
  SheetTitle
} from "@/components/ui/sheet";

export function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              {/* <PanelsTopLeft  className="w-6 h-6 mr-1" /> */}
              <SheetTitle className="font-bold text-lg"><b><h1 className="font-bold text-lg font-serif">Greentech Industries</h1></b></SheetTitle>
            </Link>
          </Button>
          <hr className="mt-1" />
        </SheetHeader>
        <Menu isOpen />
      </SheetContent>
    </Sheet>
  );
}
