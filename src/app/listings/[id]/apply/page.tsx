"use client";

import { ArrowLeftIcon, LockIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Fieldset, FieldsetLegend } from "@/components/ui/fieldset";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { formatNairaShort } from "@/lib/format";
import { useListing, useSubmitApplication } from "@/lib/queries";

export default function ApplyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data } = useListing(id);
  const submit = useSubmitApplication();
  const [idFile, setIdFile] = useState<string>("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    submit.mutate(
      {
        listingId: id,
        applicantName: String(fd.get("name")),
        occupation: `${fd.get("job")}, ${fd.get("employer")}`,
        monthlyIncome: Number(fd.get("income")) * 100,
        guarantorName: String(fd.get("guarantor")),
      },
      {
        onSuccess: () => {
          toastManager.add({
            type: "success",
            title: "Application sent",
            description: "The landlord usually decides within 48 hours. We’ll text you.",
          });
          router.push("/dashboard?tab=applications");
        },
      },
    );
  }

  return (
    <div className="container flex max-w-2xl flex-col gap-6 py-8">
      <Button variant="ghost" size="sm" className="self-start" render={<Link href={`/listings/${id}`} />}>
        <ArrowLeftIcon />
        Back to listing
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Apply to rent</CardTitle>
          <CardDescription>
            {data ? (
              <>
                {data.listing.title} · {formatNairaShort(data.listing.pricing.annualRent)}/year
              </>
            ) : (
              <Skeleton className="h-4 w-64" />
            )}
          </CardDescription>
        </CardHeader>
        <Form onSubmit={onSubmit} className="contents">
          <CardPanel className="flex flex-col gap-6">
            <Fieldset>
              <FieldsetLegend>About you</FieldsetLegend>
              <Field name="name">
                <FieldLabel>Full name (as on your ID)</FieldLabel>
                <Input name="name" required defaultValue="Ada Nwosu" />
                <FieldError>Enter your full name.</FieldError>
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field name="job">
                  <FieldLabel>Job title</FieldLabel>
                  <Input name="job" required placeholder="e.g. Product designer" />
                  <FieldError>Required.</FieldError>
                </Field>
                <Field name="employer">
                  <FieldLabel>Employer</FieldLabel>
                  <Input name="employer" required placeholder="Company or “Self-employed”" />
                  <FieldError>Required.</FieldError>
                </Field>
              </div>
              <Field name="income">
                <FieldLabel>Monthly income (₦)</FieldLabel>
                <Input name="income" type="number" inputMode="numeric" min={0} required placeholder="650000" />
                <FieldDescription>Only the landlord sees this. It helps them decide faster.</FieldDescription>
                <FieldError>Enter an amount.</FieldError>
              </Field>
            </Fieldset>

            <Fieldset>
              <FieldsetLegend>Guarantor</FieldsetLegend>
              <Field name="guarantor">
                <FieldLabel>Guarantor’s full name</FieldLabel>
                <Input name="guarantor" required />
                <FieldError>Required.</FieldError>
              </Field>
              <Field name="guarantorPhone">
                <FieldLabel>Guarantor’s phone</FieldLabel>
                <Input name="guarantorPhone" type="tel" inputMode="tel" required placeholder="0803 000 0000" />
                <FieldError>Required.</FieldError>
              </Field>
            </Fieldset>

            <Fieldset>
              <FieldsetLegend>Documents</FieldsetLegend>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 hover:bg-accent">
                <UploadIcon className="size-5 text-muted-foreground" />
                <span className="flex flex-col">
                  <span className="font-medium text-sm">{idFile || "Upload a valid ID"}</span>
                  <span className="text-muted-foreground text-xs">NIN slip, driver’s licence or international passport · JPG, PNG or PDF</span>
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="sr-only"
                  onChange={(e) => setIdFile(e.target.files?.[0]?.name ?? "")}
                />
              </label>
            </Fieldset>

            <Alert>
              <LockIcon />
              <AlertDescription>
                You pay nothing now. If the landlord approves you, you’ll accept the tenancy agreement and pay through
                {" "}us. We hold the money until you confirm you’ve moved in.
              </AlertDescription>
            </Alert>
          </CardPanel>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost" render={<Link href={`/listings/${id}`} />}>
              Cancel
            </Button>
            <Button type="submit" size="lg" loading={submit.isPending}>
              Send application
            </Button>
          </CardFooter>
        </Form>
      </Card>
    </div>
  );
}
