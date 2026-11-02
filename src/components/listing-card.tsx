"use client";

import { BadgeCheckIcon, BathIcon, BedDoubleIcon, ClockIcon, HeartIcon, MapPinIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ListingPhoto } from "@/components/listing-photo";
import { formatNaira, formatNairaShort, freshnessLabel, propertyTypeLabels, totalMoveIn } from "@/lib/format";
import { useSavedIds, useToggleSaved } from "@/lib/queries";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ListingCard({ listing, className }: { listing: Listing; className?: string }) {
  const { data: saved = [] } = useSavedIds();
  const toggle = useToggleSaved();
  const isSaved = saved.includes(listing.id);

  return (
    <Card className={cn("group relative gap-0 overflow-hidden p-0 transition-shadow hover:shadow-md", className)}>
      <div className="relative">
        <ListingPhoto hue={listing.hue} className="aspect-[4/3] w-full" label={listing.title} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {listing.verified && (
              <Badge variant="success" className="bg-background/95">
                <BadgeCheckIcon />
                Verified
              </Badge>
            )}
            {listing.sponsored && (
              <Badge variant="outline" className="bg-background/95">
                Sponsored
              </Badge>
            )}
          </div>
          <Button
            size="icon-sm"
            variant="outline"
            className="relative z-10 rounded-full bg-background/95"
            aria-label={isSaved ? "Remove from saved" : "Save home"}
            aria-pressed={isSaved}
            onClick={(e) => {
              e.preventDefault();
              toggle.mutate(listing.id);
            }}
          >
            <HeartIcon className={cn(isSaved && "fill-destructive text-destructive")} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-semibold text-lg tabular-nums">
            {formatNairaShort(listing.pricing.annualRent)}
            <span className="font-normal text-muted-foreground text-sm"> /year</span>
          </p>
          <span className="text-muted-foreground text-xs">{propertyTypeLabels[listing.type]}</span>
        </div>
        <h3 className="line-clamp-1 font-medium">
          <Link href={`/listings/${listing.id}`} className="after:absolute after:inset-0">
            {listing.title}
          </Link>
        </h3>
        <p className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPinIcon className="size-3.5" />
          {listing.area}, {listing.lga}
        </p>
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span className="flex items-center gap-1">
            <BedDoubleIcon className="size-3.5" /> {listing.bedrooms} bed
          </span>
          <span className="flex items-center gap-1">
            <BathIcon className="size-3.5" /> {listing.bathrooms} bath
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t pt-3 text-xs">
          <span className="text-muted-foreground">
            Move-in total <span className="font-medium text-foreground">{formatNaira(totalMoveIn(listing.pricing))}</span>
          </span>
        </div>
        <p className="flex items-center gap-1 text-success-foreground text-xs">
          <ClockIcon className="size-3" />
          {freshnessLabel(listing.availabilityConfirmedAt)}
        </p>
      </div>
    </Card>
  );
}

export function ListingCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden p-0">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </div>
    </Card>
  );
}
