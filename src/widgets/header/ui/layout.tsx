import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Menu } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/shared/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/shared/ui/sheet";

export const Layout = ({
  logo,
  nav,
  profile,
}: {
  logo: ReactNode;
  nav: ReactNode;
  profile: ReactNode;
}) => {
  return (
    <header className="sticky top-0 z-1 w-full border-b bg-background/95 backdrop-blur [backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* бургер и шторка */}
        <div className="md:hidden mr-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader className=" border-b pb-5 mb-5">
                <DialogTitle>
                  <VisuallyHidden> qwerty</VisuallyHidden>
                </DialogTitle>

                {logo}
              </SheetHeader>
              {nav}
            </SheetContent>
          </Sheet>
        </div>

        <div className="hidden md:flex mr-4">{logo}</div>
        <div className="items-center flex-1 flex">
          <div className="hidden md:flex">{nav}</div>
          <div className="flex flex-1 items-center justify-end space-x-3 ">
            {profile}
          </div>
        </div>
      </div>
    </header>
  );
};
