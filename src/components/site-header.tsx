"use client";

import { HomeIcon, MenuIcon, MessageSquareIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetHeader, SheetPanel, SheetPopup, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/search", label: "Find a home" },
  { href: "/dashboard", label: "My renting" },
  { href: "/landlord", label: "For landlords" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-14 items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <HomeIcon className="size-4" />
          </span>
          {BRAND.name}
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={pathname.startsWith(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-1.5 text-muted-foreground text-sm transition-colors hover:text-foreground",
                "aria-[current=page]:bg-accent aria-[current=page]:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" render={<Link href="/messages" aria-label="Messages" />}>
            <MessageSquareIcon />
          </Button>
          <Button className="hidden sm:inline-flex" variant="outline" render={<Link href="/login" />}>
            Log in
          </Button>
          <Button className="hidden sm:inline-flex" render={<Link href="/onboarding" />}>
            List a property
          </Button>

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
              <MenuIcon />
            </SheetTrigger>
            <SheetPopup side="right">
              <SheetHeader>
                <SheetTitle>{BRAND.name}</SheetTitle>
              </SheetHeader>
              <SheetPanel className="flex flex-col gap-1">
                {[...nav, { href: "/messages", label: "Messages" }, { href: "/login", label: "Log in" }].map((item) => (
                  <SheetClose
                    key={item.href}
                    render={<Link href={item.href} className="rounded-md px-3 py-2.5 hover:bg-accent" />}
                  >
                    {item.label}
                  </SheetClose>
                ))}
                <Button className="mt-4" size="lg" render={<Link href="/onboarding" />}>
                  List a property
                </Button>
              </SheetPanel>
            </SheetPopup>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
