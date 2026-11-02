"use client";

import { CalendarIcon, FileTextIcon, HeartIcon, ReceiptIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ListingCard, ListingCardSkeleton } from "@/components/listing-card";
import { ListingPhoto } from "@/components/listing-photo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { toastManager } from "@/components/ui/toast";
import { formatDate, formatDateTime, formatNaira } from "@/lib/format";
import { useApplications, useCancelInspection, useInspections, usePayments, useSavedListings } from "@/lib/queries";
import type { ApplicationStatus, InspectionStatus, PaymentStatus } from "@/lib/types";

const TABS = ["inspections", "applications", "saved", "payments"] as const;
type Tab = (typeof TABS)[number];

export function TenantDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("tab");
  const tab: Tab = TABS.includes(raw as Tab) ? (raw as Tab) : "inspections";

  return (
    <div className="container flex flex-col gap-6 py-8">
      <div>
        <h1 className="font-semibold text-2xl">My renting</h1>
        <p className="text-muted-foreground">Signed in as Ada Nwosu · Tenant</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => router.replace(`/dashboard?tab=${String(v)}`, { scroll: false })}>
        <TabsList variant="underline" className="w-full justify-start overflow-x-auto">
          <TabsTab value="inspections"><CalendarIcon />Inspections</TabsTab>
          <TabsTab value="applications"><FileTextIcon />Applications</TabsTab>
          <TabsTab value="saved"><HeartIcon />Saved</TabsTab>
          <TabsTab value="payments"><ReceiptIcon />Payments</TabsTab>
        </TabsList>
        <TabsPanel value="inspections" className="pt-6"><Inspections /></TabsPanel>
        <TabsPanel value="applications" className="pt-6"><Applications /></TabsPanel>
        <TabsPanel value="saved" className="pt-6"><Saved /></TabsPanel>
        <TabsPanel value="payments" className="pt-6"><Payments /></TabsPanel>
      </Tabs>
    </div>
  );
}

const inspectionBadge: Record<InspectionStatus, { label: string; variant: "success" | "info" | "secondary" | "outline" }> = {
  booked: { label: "Awaiting confirmation", variant: "info" },
  confirmed: { label: "Confirmed", variant: "success" },
  attended: { label: "Attended", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

function Inspections() {
  const { data, isPending } = useInspections();
  const cancel = useCancelInspection();
  if (isPending) return <RowsSkeleton />;
  if (!data?.length)
    return (
      <EmptyState icon={<CalendarIcon />} title="No inspections yet" body="Book a free slot on any verified listing." />
    );
  return (
    <div className="flex flex-col gap-3">
      {data.map((i) => (
        <Row key={i.id} hue={i.listing.hue} title={i.listing.title} href={`/listings/${i.listing.id}`} sub={`${formatDateTime(i.startsAt)} · ${i.listing.address}`}>
          <Badge variant={inspectionBadge[i.status].variant}>{inspectionBadge[i.status].label}</Badge>
          {i.status !== "cancelled" && i.status !== "attended" && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                cancel.mutate(i.id, { onSuccess: () => toastManager.add({ title: "Inspection cancelled" }) })
              }
            >
              Cancel
            </Button>
          )}
        </Row>
      ))}
    </div>
  );
}

const appBadge: Record<ApplicationStatus, { label: string; variant: "success" | "warning" | "error" }> = {
  pending: { label: "Under review", variant: "warning" },
  approved: { label: "Approved — pay to secure", variant: "success" },
  rejected: { label: "Not approved", variant: "error" },
};

function Applications() {
  const { data, isPending } = useApplications();
  if (isPending) return <RowsSkeleton />;
  if (!data?.length)
    return <EmptyState icon={<FileTextIcon />} title="No applications yet" body="Apply after you’ve inspected a home you like." />;
  return (
    <div className="flex flex-col gap-3">
      {data.map((a) => (
        <Row key={a.id} hue={a.listing.hue} title={a.listing.title} href={`/applications/${a.id}`} sub={`Applied ${formatDate(a.createdAt)} · ${a.listing.area}`}>
          <Badge variant={appBadge[a.status].variant}>{appBadge[a.status].label}</Badge>
          <Button size="sm" variant={a.status === "approved" ? "default" : "outline"} render={<Link href={`/applications/${a.id}`} />}>
            {a.status === "approved" ? "Continue" : "View"}
          </Button>
        </Row>
      ))}
    </div>
  );
}

function Saved() {
  const { data, isPending } = useSavedListings();
  if (isPending)
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => <ListingCardSkeleton key={i} />)}
      </div>
    );
  if (!data?.length) return <EmptyState icon={<HeartIcon />} title="Nothing saved" body="Tap the heart on a listing to keep it here." />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((l) => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}

const payBadge: Record<PaymentStatus, { label: string; variant: "success" | "info" | "secondary" | "outline" }> = {
  pending: { label: "Pending", variant: "outline" },
  held: { label: "Held until move-in", variant: "info" },
  released: { label: "Paid to landlord", variant: "success" },
  refunded: { label: "Refunded", variant: "secondary" },
};

function Payments() {
  const { data, isPending } = usePayments();
  if (isPending) return <RowsSkeleton />;
  if (!data?.length) return <EmptyState icon={<ReceiptIcon />} title="No payments yet" body="Receipts for rent paid through us show up here." />;
  return (
    <div className="flex flex-col gap-3">
      {data.map((p) => (
        <Row key={p.id} hue={p.listing.hue} title={`${formatNaira(p.amount)} · ${p.listing.title}`} href={`/applications/${p.applicationId}`} sub={`Ref ${p.reference} · ${formatDate(p.createdAt)}`}>
          <Badge variant={payBadge[p.status].variant}>{payBadge[p.status].label}</Badge>
        </Row>
      ))}
    </div>
  );
}

function Row({ hue, title, sub, href, children }: { hue: number; title: string; sub: string; href: string; children?: React.ReactNode }) {
  return (
    <Card className="flex-row items-center gap-4 p-3">
      <ListingPhoto hue={hue} className="size-16 shrink-0 rounded-xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link href={href} className="truncate font-medium hover:underline">{title}</Link>
        <span className="truncate text-muted-foreground text-sm">{sub}</span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">{children}</div>
    </Card>
  );
}

function RowsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-22 rounded-2xl" />)}
    </div>
  );
}

function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <Empty className="rounded-2xl border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">{icon}</EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{body}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link href="/search" />}>Find a home</Button>
      </EmptyContent>
    </Empty>
  );
}
