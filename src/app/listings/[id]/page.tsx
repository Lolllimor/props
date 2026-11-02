"use client";

import {
  BathIcon,
  BedDoubleIcon,
  CheckIcon,
  ClockIcon,
  FlagIcon,
  HeartIcon,
  HouseIcon,
  MapPinIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { CostBreakdown } from "@/components/cost-breakdown";
import { ListingPhoto } from "@/components/listing-photo";
import { VerifiedBadge } from "@/components/verified-badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { openThreadForListing } from "@/lib/api";
import { formatNairaShort, freshnessLabel, propertyTypeLabels } from "@/lib/format";
import { useListing, useSavedIds, useToggleSaved } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { BookInspectionDialog } from "./book-inspection-dialog";
import { ReportDialog } from "./report-dialog";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isPending, isError } = useListing(id);
  const { data: saved = [] } = useSavedIds();
  const toggleSaved = useToggleSaved();
  const [photo, setPhoto] = useState(0);

  if (isPending) return <ListingSkeleton />;
  if (isError || !data) {
    return (
      <div className="container py-16">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HouseIcon />
            </EmptyMedia>
            <EmptyTitle>This listing isn’t available</EmptyTitle>
          </EmptyHeader>
          <EmptyContent>
            <Button render={<Link href="/search" />}>Browse verified homes</Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const { listing, lister } = data;
  const isSaved = saved.includes(listing.id);
  const unavailable = listing.status !== "live";

  async function message() {
    const threadId = await openThreadForListing(listing.id);
    router.push(`/messages?thread=${threadId}`);
  }

  return (
    <div className="container flex flex-col gap-8 py-6">
      {/* Gallery */}
      <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
        <ListingPhoto hue={listing.hue} index={photo} className="aspect-[16/10] w-full rounded-2xl" label={`Photo ${photo + 1} of ${listing.photoCount}`} />
        <div className="grid grid-cols-4 gap-2 md:grid-cols-2">
          {Array.from({ length: Math.min(4, listing.photoCount) }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPhoto(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={photo === i}
              className={cn("overflow-hidden rounded-xl outline-offset-2", photo === i && "outline-2 outline-primary")}
            >
              <ListingPhoto hue={listing.hue} index={i} className="aspect-square w-full md:aspect-[4/3]" />
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {listing.verified ? (
                <VerifiedBadge by={lister.verifiedBy} at={lister.verifiedAt} />
              ) : (
                <Badge variant="warning" size="lg">Under review</Badge>
              )}
              <Badge variant="outline" size="lg">{propertyTypeLabels[listing.type]}</Badge>
              {unavailable && <Badge variant="secondary" size="lg">No longer available</Badge>}
            </div>
            <h1 className="font-semibold text-2xl sm:text-3xl">{listing.title}</h1>
            <p className="flex items-center gap-1.5 text-muted-foreground">
              <MapPinIcon className="size-4" />
              {listing.address} · {listing.lga}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="flex items-center gap-1.5"><BedDoubleIcon className="size-4" />{listing.bedrooms} bedroom{listing.bedrooms > 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1.5"><BathIcon className="size-4" />{listing.bathrooms} bathroom{listing.bathrooms > 1 ? "s" : ""}</span>
              <span className="flex items-center gap-1.5 text-success-foreground"><ClockIcon className="size-4" />{freshnessLabel(listing.availabilityConfirmedAt)}</span>
            </div>
          </div>

          <Alert variant="info">
            <ShieldCheckIcon />
            <AlertTitle>Inspections here are free</AlertTitle>
            <AlertDescription>
              Book a slot below. If anyone asks you to pay to view this home, don’t pay — report the listing.
            </AlertDescription>
          </Alert>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg">About this home</h2>
            <p className="text-muted-foreground">{listing.description}</p>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="font-semibold text-lg">What’s included</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {listing.amenities.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 text-primary" />
                  {a}
                </li>
              ))}
            </ul>
          </section>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback>{lister.name.split(" ").filter((p) => /^[A-Z]/.test(p)).slice(0, 2).map((p) => p[0]).join("")}</AvatarFallback>
                </Avatar>
                <span className="flex flex-col gap-0.5">
                  {lister.name}
                  <span className="font-normal text-muted-foreground text-sm">
                    {lister.role === "owner" ? "Property owner" : "Verified agent"} · {lister.listingsCount} listings
                  </span>
                </span>
              </CardTitle>
              <CardDescription>{lister.responseTime}</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-wrap gap-2">
              <Badge variant="success"><ShieldCheckIcon />{lister.verifiedBy}</Badge>
            </CardPanel>
          </Card>

          <div>
            <ReportDialog listingId={listing.id}>
              <FlagIcon />
              Report this listing
            </ReportDialog>
          </div>
        </div>

        {/* Sticky cost + actions */}
        <aside>
          <Card className="lg:sticky lg:top-20">
            <CardHeader>
              <CardTitle className="text-2xl tabular-nums">
                {formatNairaShort(listing.pricing.annualRent)}
                <span className="font-normal text-base text-muted-foreground"> / year</span>
              </CardTitle>
              <CardDescription>Full move-in cost, nothing hidden</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <CostBreakdown pricing={listing.pricing} />
              <div className="flex flex-col gap-2">
                <BookInspectionDialog listingId={listing.id} disabled={unavailable} />
                <Button variant="outline" size="lg" disabled={unavailable} render={unavailable ? undefined : <Link href={`/listings/${listing.id}/apply`} />}>
                  Apply to rent
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="ghost" onClick={message}>
                    <MessageSquareIcon />
                    Message
                  </Button>
                  <Button
                    variant="ghost"
                    aria-pressed={isSaved}
                    onClick={() =>
                      toggleSaved.mutate(listing.id, {
                        onSuccess: (now) =>
                          toastManager.add({ type: "success", title: now ? "Saved to your homes" : "Removed from saved" }),
                      })
                    }
                  >
                    <HeartIcon className={cn(isSaved && "fill-destructive text-destructive")} />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                </div>
              </div>
            </CardPanel>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div className="container flex flex-col gap-8 py-6" aria-busy>
      <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
        <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-2 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl md:aspect-[4/3]" />
          ))}
        </div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}
