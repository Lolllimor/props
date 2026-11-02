import { HouseIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Stand-in for real listing photos (which arrive via Cloudinary in the real build).
 * A tinted gradient per listing so cards are visually distinct.
 */
export function ListingPhoto({
  hue,
  index = 0,
  className,
  label,
}: {
  hue: number;
  index?: number;
  className?: string;
  label?: string;
}) {
  const h = (hue + index * 23) % 360;
  return (
    <div
      role="img"
      aria-label={label ?? "Listing photo placeholder"}
      className={cn("relative flex items-center justify-center overflow-hidden bg-muted", className)}
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(0.86 0.05 ${h}) 0%, oklch(0.72 0.07 ${(h + 40) % 360}) 100%)`,
      }}
    >
      <HouseIcon className="size-10 text-white/70" strokeWidth={1.25} />
    </div>
  );
}
