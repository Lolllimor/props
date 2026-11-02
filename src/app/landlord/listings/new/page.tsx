"use client";

import { ArrowLeftIcon, CameraIcon, CircleAlertIcon, ImageIcon, TriangleAlertIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AreaAutocomplete } from "@/components/area-autocomplete";
import { CostBreakdown } from "@/components/cost-breakdown";
import { ListingPhoto } from "@/components/listing-photo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { AGENCY_FEE_CAP, agencyFeeOverCap, formatNaira, naira2kobo, propertyTypeLabels } from "@/lib/format";
import { useCreateListing } from "@/lib/queries";
import type { Pricing, PropertyType } from "@/lib/types";

const STEPS = ["Details", "Photos", "Pricing", "Review"] as const;
const AMENITIES = ["Prepaid meter", "Borehole", "Water heater", "Kitchen cabinets", "Tiled floors", "Gated compound", "Security", "Parking", "BQ", "24h power", "Inverter", "Wardrobe"];
const typeItems = (Object.entries(propertyTypeLabels) as [PropertyType, string][]).map(([value, label]) => ({ value, label }));

type FeeKey = keyof Pricing;
const FEE_FIELDS: { key: FeeKey; label: string; hint: string }[] = [
  { key: "annualRent", label: "Annual rent", hint: "What the tenant pays for one year." },
  { key: "cautionFee", label: "Caution deposit", hint: "Refundable. Enter 0 if none." },
  { key: "agencyFee", label: "Agency fee", hint: "Max 10% of annual rent. Enter 0 if none." },
  { key: "legalFee", label: "Legal / agreement fee", hint: "Enter 0 if none." },
  { key: "serviceCharge", label: "Service charge (per year)", hint: "Enter 0 if none. “TBD” isn’t allowed." },
];

export default function NewListingPage() {
  const router = useRouter();
  const create = useCreateListing();
  const [step, setStep] = useState(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<PropertyType>("flat");
  const [bedrooms, setBedrooms] = useState("2");
  const [bathrooms, setBathrooms] = useState("2");
  const [area, setArea] = useState("");
  const [address, setAddress] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState(0);
  const [fees, setFees] = useState<Record<FeeKey, string>>({
    annualRent: "",
    cautionFee: "",
    agencyFee: "",
    legalFee: "",
    serviceCharge: "",
  });

  const pricing: Pricing = {
    annualRent: naira2kobo(Number(fees.annualRent) || 0),
    cautionFee: naira2kobo(Number(fees.cautionFee) || 0),
    agencyFee: naira2kobo(Number(fees.agencyFee) || 0),
    legalFee: naira2kobo(Number(fees.legalFee) || 0),
    serviceCharge: naira2kobo(Number(fees.serviceCharge) || 0),
  };
  const overCap = pricing.annualRent > 0 && agencyFeeOverCap(pricing);

  const valid = [
    title.trim().length >= 8 && area && address.trim().length >= 5,
    photos >= 4,
    Object.values(fees).every((v) => v !== "" && Number(v) >= 0) && pricing.annualRent > 0 && !overCap,
    true,
  ];

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
  }

  function publish() {
    create.mutate(
      {
        title,
        description: description || title,
        type,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area,
        address,
        pricing,
        amenities,
        photoCount: photos,
      },
      {
        onSuccess: () => {
          toastManager.add({
            type: "success",
            title: "Sent for review",
            description: "We check photos and fees, usually within 24 hours. It goes live with a Verified badge.",
          });
          router.push("/landlord");
        },
      },
    );
  }

  return (
    <div className="container flex max-w-3xl flex-col gap-6 py-8">
      <Button variant="ghost" size="sm" className="self-start" render={<Link href="/landlord" />}>
        <ArrowLeftIcon />
        Dashboard
      </Button>

      <div className="flex flex-col gap-3">
        <h1 className="font-semibold text-2xl">New listing</h1>
        <div className="flex justify-between text-sm">
          <span>
            Step {step + 1} of {STEPS.length}: <strong>{STEPS[step]}</strong>
          </span>
          <span className="text-muted-foreground">About 5 minutes</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} aria-label="Listing progress" />
      </div>

      <Card>
        {step === 0 && (
          <>
            <CardHeader>
              <CardTitle>The basics</CardTitle>
              <CardDescription>Use the words tenants search for: self-contain, mini flat, BQ.</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bright 2-bedroom flat, all rooms en suite" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field>
                  <FieldLabel>Type</FieldLabel>
                  <Select items={typeItems} value={type} onValueChange={(v) => setType((v ?? "flat") as PropertyType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectPopup>
                      {typeItems.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectPopup>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Bedrooms</FieldLabel>
                  <Input type="number" min={1} max={10} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} />
                </Field>
                <Field>
                  <FieldLabel>Bathrooms</FieldLabel>
                  <Input type="number" min={1} max={10} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} />
                </Field>
              </div>
              <Field>
                <FieldLabel>Area</FieldLabel>
                <AreaAutocomplete value={area} onValueChange={setArea} />
              </Field>
              <Field>
                <FieldLabel>Street address</FieldLabel>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shown only after a tenant books an inspection" />
                <FieldDescription>Tenants see the street and area; the exact number is shared once they book.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>Description (optional)</FieldLabel>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Water, power, road, neighbours, what makes it good…" />
              </Field>
              <fieldset className="flex flex-col gap-2">
                <legend className="mb-2 font-medium text-sm">Amenities</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {AMENITIES.map((a) => (
                    <Label key={a}>
                      <Checkbox
                        checked={amenities.includes(a)}
                        onCheckedChange={(on) => setAmenities((cur) => (on ? [...cur, a] : cur.filter((x) => x !== a)))}
                      />
                      {a}
                    </Label>
                  ))}
                </div>
              </fieldset>
            </CardPanel>
          </>
        )}

        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>Take them in the app, at the property. Location and time are checked; stock or reused photos get rejected.</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {Array.from({ length: photos }, (_, i) => (
                  <ListingPhoto key={i} hue={140} index={i} className="aspect-square rounded-xl" />
                ))}
                <button
                  type="button"
                  onClick={() => setPhotos((p) => Math.min(20, p + 1))}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed text-muted-foreground text-xs hover:bg-accent"
                >
                  <CameraIcon className="size-5" />
                  Take photo
                </button>
              </div>
              <p className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <ImageIcon className="size-4" />
                {photos} of at least 4 photos · up to 20, plus one walkthrough video
              </p>
              {photos === 3 && (
                <Alert variant="warning">
                  <TriangleAlertIcon />
                  <AlertTitle>One photo looks like it’s on another listing</AlertTitle>
                  <AlertDescription>Demo of duplicate detection: we compare every upload against existing listings before publishing.</AlertDescription>
                </Alert>
              )}
            </CardPanel>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle>Every fee, upfront</CardTitle>
              <CardDescription>All five fields are required. Tenants see the total before they contact you.</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {FEE_FIELDS.map((f) => (
                  <Field key={f.key}>
                    <FieldLabel>{f.label} (₦)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={fees[f.key]}
                      onChange={(e) => setFees((cur) => ({ ...cur, [f.key]: e.target.value }))}
                      aria-invalid={f.key === "agencyFee" && overCap ? true : undefined}
                    />
                    <FieldDescription>{f.hint}</FieldDescription>
                  </Field>
                ))}
              </div>
              {overCap && (
                <Alert variant="error">
                  <CircleAlertIcon />
                  <AlertTitle>Agency fee is over the cap</AlertTitle>
                  <AlertDescription>
                    Max is {formatNaira(pricing.annualRent * AGENCY_FEE_CAP)} ({AGENCY_FEE_CAP * 100}% of annual rent).
                  </AlertDescription>
                </Alert>
              )}
              {pricing.annualRent > 0 && <CostBreakdown pricing={pricing} />}
            </CardPanel>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle>Review and submit</CardTitle>
              <CardDescription>Our team checks it before it goes live.</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4 text-sm">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
                <dt className="text-muted-foreground">Title</dt><dd className="font-medium">{title}</dd>
                <dt className="text-muted-foreground">Type</dt><dd>{propertyTypeLabels[type]} · {bedrooms} bed · {bathrooms} bath</dd>
                <dt className="text-muted-foreground">Location</dt><dd>{address}, {area}</dd>
                <dt className="text-muted-foreground">Photos</dt><dd>{photos}</dd>
                <dt className="text-muted-foreground">Amenities</dt><dd>{amenities.join(", ") || "—"}</dd>
              </dl>
              <CostBreakdown pricing={pricing} />
              <Alert variant="info">
                <AlertDescription>
                  Inspections on your listing are free for tenants. You’ll be asked to re-confirm availability every 30 days, or the listing expires.
                </AlertDescription>
              </Alert>
            </CardPanel>
          </>
        )}

        <CardFooter className="justify-between gap-2">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next} disabled={!valid[step]}>
              Continue
            </Button>
          ) : (
            <Button onClick={publish} loading={create.isPending}>
              Submit for review
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
