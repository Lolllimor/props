import { ShieldCheckIcon } from "lucide-react";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="container flex flex-col gap-3 py-8 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2">
          <ShieldCheckIcon className="size-4 text-primary" />
          Never pay anyone to inspect a home. Report it and we’ll act within 24 hours.
        </p>
        <p>
          © {new Date().getFullYear()} {BRAND.name} · Prototype with mock data
        </p>
      </div>
    </footer>
  );
}
