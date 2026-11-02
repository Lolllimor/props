"use client";

import { BuildingIcon, CalendarIcon, FileSignatureIcon, FileTextIcon, PlusIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ListingPhoto } from "@/components/listing-photo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { toastManager } from "@/components/ui/toast";
import { daysAgo, formatDate, formatDateTime, formatNaira, formatNairaShort, LISTING_TTL_DAYS } from "@/lib/format";
import {
  useConfirmAvailability,
  useDecideApplication,
  useInspections,
  useLandlordApplications,
  useMandates,
  useMyListings,
  useRequestMandate,
} from "@/lib/queries";
import type { ListingStatus, MandateStatus } from "@/lib/types";

const TABS = ["units", "applications", "inspections", "mandates"] as const;
type Tab = (typeof TABS)[number];

export function LandlordDashboard() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("tab");
  const tab: Tab = TABS.includes(raw as Tab) ? (raw as Tab) : "units";
  const { data: units } = useMyListings();
  const { data: apps } = useLandlordApplications();

  const live = units?.filter((u) => u.status === "live").length ?? 0;
  const rented = units?.filter((u) => u.status === "rented").length ?? 0;
  const pendingApps = apps?.filter((a) => a.status === "pending").length ?? 0;
  const expiring = units?.filter((u) => u.status === "live" && LISTING_TTL_DAYS - daysAgo(u.availabilityConfirmedAt) <= 7).length ?? 0;

  return (
    <div className="container flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Landlord dashboard</h1>
          <p className="text-muted-foreground">Mr. Bello Adeyemi · Verified owner</p>
        </div>
        <Button render={<Link href="/landlord/listings/new" />}>
          <PlusIcon />
          New listing
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Live listings" value={live} />
        <Stat label="Rented" value={rented} />
        <Stat label="New applications" value={pendingApps} highlight={pendingApps > 0} />
        <Stat label="Expiring in 7 days" value={expiring} highlight={expiring > 0} />
      </div>

      <Tabs value={tab} onValueChange={(v) => router.replace(`/landlord?tab=${String(v)}`, { scroll: false })}>
        <TabsList variant="underline" className="w-full justify-start overflow-x-auto">
          <TabsTab value="units"><BuildingIcon />Units</TabsTab>
          <TabsTab value="applications"><FileTextIcon />Applications{pendingApps ? <Badge size="sm">{pendingApps}</Badge> : null}</TabsTab>
          <TabsTab value="inspections"><CalendarIcon />Inspections</TabsTab>
          <TabsTab value="mandates"><FileSignatureIcon />Agent mandates</TabsTab>
        </TabsList>
        <TabsPanel value="units" className="pt-6"><Units /></TabsPanel>
        <TabsPanel value="applications" className="pt-6"><Applications /></TabsPanel>
        <TabsPanel value="inspections" className="pt-6"><Inspections /></TabsPanel>
        <TabsPanel value="mandates" className="pt-6"><Mandates /></TabsPanel>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className="gap-1 p-4">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={highlight ? "font-semibold text-2xl text-primary" : "font-semibold text-2xl"}>{value}</span>
    </Card>
  );
}

const listingBadge: Record<ListingStatus, { label: string; variant: "success" | "warning" | "secondary" | "outline" | "info" }> = {
  draft: { label: "Draft", variant: "outline" },
  pending: { label: "In review", variant: "warning" },
  live: { label: "Live", variant: "success" },
  paused: { label: "Paused", variant: "secondary" },
  rented: { label: "Rented", variant: "info" },
};

function Units() {
  const { data, isPending } = useMyListings();
  const confirm = useConfirmAvailability();
  if (isPending) return <Skeleton className="h-64 rounded-2xl" />;
  if (!data?.length)
    return (
      <Empty className="rounded-2xl border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon"><BuildingIcon /></EmptyMedia>
          <EmptyTitle>No units yet</EmptyTitle>
          <EmptyDescription>Listing takes about 5 minutes.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent><Button render={<Link href="/landlord/listings/new" />}>Create a listing</Button></EmptyContent>
      </Empty>
    );

  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unit</TableHead>
            <TableHead>Rent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((u) => {
            const left = LISTING_TTL_DAYS - daysAgo(u.availabilityConfirmedAt);
            return (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <ListingPhoto hue={u.hue} className="size-10 shrink-0 rounded-lg" />
                    <Link href={`/listings/${u.id}`} className="max-w-56 truncate font-medium hover:underline">{u.title}</Link>
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">{formatNairaShort(u.pricing.annualRent)}</TableCell>
                <TableCell><Badge variant={listingBadge[u.status].variant}>{listingBadge[u.status].label}</Badge></TableCell>
                <TableCell>
                  {u.status === "live" ? (
                    <span className={left <= 7 ? "text-warning-foreground" : "text-muted-foreground"}>
                      {left > 0 ? `Expires in ${left} days` : "Expired"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {u.status === "live" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        confirm.mutate(u.id, {
                          onSuccess: () => toastManager.add({ type: "success", title: "Availability confirmed", description: "Listing stays live for another 30 days." }),
                        })
                      }
                    >
                      <RefreshCwIcon />
                      Still available
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function Applications() {
  const { data, isPending } = useLandlordApplications();
  const decide = useDecideApplication();
  if (isPending) return <Skeleton className="h-64 rounded-2xl" />;
  if (!data?.length) return <p className="text-muted-foreground">No applications yet.</p>;
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {data.map((a) => (
        <Card key={a.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              {a.applicantName}
              <Badge variant={a.status === "approved" ? "success" : a.status === "rejected" ? "error" : "warning"}>
                {a.status === "pending" ? "Awaiting you" : a.status === "approved" ? "Approved" : "Declined"}
              </Badge>
            </CardTitle>
            <CardDescription>For {a.listing.title} · {formatDate(a.createdAt)}</CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col gap-3 text-sm">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">Work</dt><dd>{a.occupation}</dd>
              <dt className="text-muted-foreground">Monthly income</dt><dd>{formatNaira(a.monthlyIncome)}</dd>
              <dt className="text-muted-foreground">Rent / income</dt>
              <dd>{Math.round((a.listing.pricing.annualRent / 12 / a.monthlyIncome) * 100)}% of monthly income</dd>
              <dt className="text-muted-foreground">Guarantor</dt><dd>{a.guarantorName}</dd>
              <dt className="text-muted-foreground">ID</dt><dd><Badge variant="success" size="sm">NIN verified</Badge></dd>
            </dl>
            {a.status === "pending" && (
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    decide.mutate({ id: a.id, status: "approved" }, { onSuccess: () => toastManager.add({ type: "success", title: `Approved ${a.applicantName}`, description: "They can now accept the agreement and pay." }) })
                  }
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  onClick={() => decide.mutate({ id: a.id, status: "rejected" }, { onSuccess: () => toastManager.add({ title: "Application declined" }) })}
                >
                  Decline
                </Button>
              </div>
            )}
          </CardPanel>
        </Card>
      ))}
    </div>
  );
}

function Inspections() {
  const { data, isPending } = useInspections();
  if (isPending) return <Skeleton className="h-40 rounded-2xl" />;
  if (!data?.length) return <p className="text-muted-foreground">No bookings yet.</p>;
  return (
    <Card className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((i) => (
            <TableRow key={i.id}>
              <TableCell>{formatDateTime(i.startsAt)}</TableCell>
              <TableCell>{i.listing.title}</TableCell>
              <TableCell><Badge variant={i.status === "cancelled" ? "outline" : "success"}>{i.status}</Badge></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

const mandateBadge: Record<MandateStatus, { label: string; variant: "success" | "warning" | "error" }> = {
  pending: { label: "Waiting for owner", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Declined", variant: "error" },
};

function Mandates() {
  const { data } = useMandates();
  const request = useRequestMandate();
  const [commission, setCommission] = useState("10");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    request.mutate(
      {
        propertyAddress: String(fd.get("address")),
        ownerPhone: String(fd.get("phone")).replace(/\s/g, ""),
        commissionPct: Number(commission),
      },
      {
        onSuccess: () => {
          form.reset();
          toastManager.add({ type: "success", title: "Mandate request sent", description: "The owner approves with one tap from an SMS link." });
        },
        onError: (err) => toastManager.add({ type: "error", title: "Couldn’t send request", description: err.message }),
      },
    );
  }

  const over = Number(commission) > 10;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Request a mandate</CardTitle>
          <CardDescription>Agents can only list a property once its verified owner approves. No mandate, no listing.</CardDescription>
        </CardHeader>
        <CardPanel>
          <Form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Field>
              <FieldLabel>Property address</FieldLabel>
              <Input name="address" required placeholder="12 Adelabu St, Surulere" />
            </Field>
            <Field>
              <FieldLabel>Owner’s phone number</FieldLabel>
              <Input name="phone" type="tel" inputMode="tel" required placeholder="0803 000 0000" />
              <FieldDescription>We text the owner a link to approve. They must be verified on the platform.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel>Your commission (% of annual rent)</FieldLabel>
              <Input type="number" min={1} max={10} value={commission} onChange={(e) => setCommission(e.target.value)} aria-invalid={over || undefined} />
              <FieldDescription>Capped at 10% under Lagos rules. Shown to tenants on the listing.</FieldDescription>
            </Field>
            {over && (
              <Alert variant="error">
                <AlertDescription>Commission can’t be more than 10%.</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="self-start" disabled={over} loading={request.isPending}>
              Send request
            </Button>
          </Form>
        </CardPanel>
      </Card>

      <div className="flex flex-col gap-3">
        <h3 className="font-medium">Your mandates</h3>
        {data?.map((m) => (
          <Card key={m.id} className="flex-row items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{m.propertyAddress}</span>
              <span className="text-muted-foreground text-sm">Owner {m.ownerPhone} · {m.commissionPct}% · {formatDate(m.createdAt)}</span>
            </div>
            <Badge variant={mandateBadge[m.status].variant}>{mandateBadge[m.status].label}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
