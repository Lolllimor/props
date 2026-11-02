"use client";

import { ListingCard, ListingCardSkeleton } from "@/components/listing-card";
import { useFeatured } from "@/lib/queries";

export function FeaturedListings() {
  const { data, isPending } = useFeatured();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {isPending
        ? Array.from({ length: 6 }, (_, i) => <ListingCardSkeleton key={i} />)
        : data?.map((l) => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}
