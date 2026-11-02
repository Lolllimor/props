"use client";

import { CheckIcon, CircleAlertIcon, ClockIcon, ShieldCheckIcon, UploadIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { useOnboarding, useSetRole, useSubmitStep } from "@/lib/queries";
import type { OnboardingStepId, VerificationStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEP_META: Record<OnboardingStepId, { title: string; owner: string; agent: string }> = {
  account: { title: "Account", owner: "Phone verified", agent: "Phone verified" },
  identity: { title: "Identity", owner: "NIN + selfie", agent: "NIN + selfie" },
  credentials: { title: "Credentials", owner: "Proof of ownership", agent: "LASRERA licence" },
  business: { title: "Business", owner: "", agent: "Company details" },
  payout: { title: "Payout", owner: "Bank account", agent: "Bank account" },
  terms: { title: "Terms & fees", owner: "Fees and rules", agent: "Commission and code of conduct" },
};

const statusBadge: Record<VerificationStatus, { label: string; variant: "success" | "warning" | "error" | "outline" }> = {
  not_started: { label: "To do", variant: "outline" },
  pending: { label: "In review", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Needs a fix", variant: "error" },
};

export default function OnboardingPage() {
  const { data, isPending } = useOnboarding();
  const setRole = useSetRole();
  const [current, setCurrent] = useState<OnboardingStepId | null>(null);

  const steps = data ? data.steps.filter((s) => data.role === "agent" || s.id !== "business") : [];
  const firstOpen = steps.find((s) => s.status === "not_started" || s.status === "rejected")?.id ?? null;

  useEffect(() => {
    if (current === null && firstOpen) setCurrent(firstOpen);
  }, [current, firstOpen]);

  if (isPending || !data) {
    return (
      <div className="container grid gap-6 py-8 md:grid-cols-[280px_1fr]">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const done = steps.filter((s) => s.status === "approved").length;
  const allApproved = done === steps.length;
  const anySubmitted = steps.every((s) => s.status !== "not_started" && s.status !== "rejected");
  const active = steps.find((s) => s.id === current) ?? steps[steps.length - 1];

  return (
    <div className="container flex flex-col gap-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-semibold text-2xl">Get verified to list</h1>
          <p className="text-muted-foreground">
            You can draft listings now. Publishing unlocks once every step is approved.
          </p>
        </div>
        <RadioGroup
          value={data.role}
          onValueChange={(v) => {
            setRole.mutate(v as "owner" | "agent");
            setCurrent(null);
          }}
          className="flex gap-2"
          aria-label="I am"
        >
          {(["owner", "agent"] as const).map((r) => (
            <Label key={r} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 has-data-checked:border-primary has-data-checked:bg-primary/5">
              <Radio value={r} />
              {r === "owner" ? "Property owner" : "Agent"}
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span>
            Step {Math.min(done + 1, steps.length)} of {steps.length}
          </span>
          <span className="text-muted-foreground">{done} approved</span>
        </div>
        <Progress value={(done / steps.length) * 100} aria-label="Verification progress" />
      </div>

      {allApproved ? (
        <Alert variant="success">
          <ShieldCheckIcon />
          <AlertTitle>You’re verified</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-2">
            <p>Your listings will carry the Verified badge.</p>
            <Button size="sm" render={<Link href={data.role === "owner" ? "/landlord/listings/new" : "/landlord?tab=mandates"} />}>
              {data.role === "owner" ? "Create your first listing" : "Request a mandate from an owner"}
            </Button>
          </AlertDescription>
        </Alert>
      ) : anySubmitted ? (
        <Alert variant="info">
          <ClockIcon />
          <AlertTitle>All submitted — we’re reviewing</AlertTitle>
          <AlertDescription>Most reviews finish within 48 hours. We’ll send an SMS when you’re approved.</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <Card className="h-fit p-2">
          <ol className="flex flex-col">
            {steps.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={s.id === "account"}
                  onClick={() => setCurrent(s.id)}
                  aria-current={active?.id === s.id ? "step" : undefined}
                  className="flex w-full items-center gap-3 rounded-xl p-3 text-left hover:bg-accent disabled:cursor-default aria-[current=step]:bg-accent"
                >
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border font-medium text-xs",
                      s.status === "approved" && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {s.status === "approved" ? <CheckIcon className="size-4" /> : i + 1}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-medium text-sm">{STEP_META[s.id].title}</span>
                    <span className="truncate text-muted-foreground text-xs">{STEP_META[s.id][data.role]}</span>
                  </span>
                  <Badge variant={statusBadge[s.status].variant} size="sm">{statusBadge[s.status].label}</Badge>
                </button>
              </li>
            ))}
          </ol>
        </Card>

        {active && (
          <StepCard
            key={`${data.role}-${active.id}`}
            stepId={active.id}
            role={data.role}
            status={active.status}
            reason={active.reason}
            onDone={() => setCurrent(null)}
          />
        )}
      </div>
    </div>
  );
}

function StepCard({
  stepId,
  role,
  status,
  reason,
  onDone,
}: {
  stepId: OnboardingStepId;
  role: "owner" | "agent";
  status: VerificationStatus;
  reason?: string;
  onDone: () => void;
}) {
  const submit = useSubmitStep();
  const [file, setFile] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [bank, setBank] = useState("gtbank");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {};
    fd.forEach((v, k) => {
      payload[k] = String(v);
    });
    submit.mutate(
      { stepId, data: payload },
      {
        onSuccess: (state) => {
          const s = state.steps.find((x) => x.id === stepId);
          if (s?.status === "rejected") {
            toastManager.add({ type: "error", title: "Needs a fix", description: s.reason });
            return;
          }
          toastManager.add({
            type: "success",
            title: s?.status === "pending" ? "Submitted for review" : "Step approved",
            description: "Progress saved. You can finish the rest later.",
          });
          onDone();
        },
      },
    );
  }

  const meta = STEP_META[stepId];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {meta.title}
          <Badge variant={statusBadge[status].variant}>{statusBadge[status].label}</Badge>
        </CardTitle>
        <CardDescription>{meta[role]}</CardDescription>
      </CardHeader>
      <Form onSubmit={onSubmit} className="contents">
        <CardPanel className="flex flex-col gap-5">
          {status === "rejected" && reason && (
            <Alert variant="error">
              <CircleAlertIcon />
              <AlertTitle>Please fix this</AlertTitle>
              <AlertDescription>{reason}</AlertDescription>
            </Alert>
          )}
          {status === "pending" && (
            <Alert variant="warning">
              <ClockIcon />
              <AlertTitle>In review</AlertTitle>
              <AlertDescription>{reason ?? "A reviewer is checking your documents. You can carry on with other steps."}</AlertDescription>
            </Alert>
          )}

          {stepId === "identity" && (
            <>
              <Field>
                <FieldLabel>NIN (National Identification Number)</FieldLabel>
                <Input name="nin" inputMode="numeric" maxLength={11} required placeholder="11 digits" />
                <FieldDescription>We check it with NIMC and keep only a reference, never the full number.</FieldDescription>
              </Field>
              <UploadBox label={file || "Take a selfie"} hint="We match it to your NIN photo. Good light, no glasses." onFile={setFile} accept="image/*" capture />
            </>
          )}

          {stepId === "credentials" && role === "owner" && (
            <>
              <Field>
                <FieldLabel>Document type</FieldLabel>
                <Select
                  name="docType"
                  defaultValue="c_of_o"
                  items={[
                    { label: "Certificate of Occupancy (C of O)", value: "c_of_o" },
                    { label: "Governor’s Consent", value: "consent" },
                    { label: "Deed of Assignment", value: "deed" },
                    { label: "Land use charge / utility bill in your name", value: "utility" },
                  ]}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="c_of_o">Certificate of Occupancy (C of O)</SelectItem>
                    <SelectItem value="consent">Governor’s Consent</SelectItem>
                    <SelectItem value="deed">Deed of Assignment</SelectItem>
                    <SelectItem value="utility">Land use charge / utility bill in your name</SelectItem>
                  </SelectPopup>
                </Select>
                <FieldDescription>No title documents? A bill in your name plus a site visit gets you “Owner verified, documents pending”.</FieldDescription>
              </Field>
              <UploadBox label={file || "Upload the document"} hint="Photo or PDF. Only our review team sees it." onFile={setFile} accept="image/*,.pdf" />
            </>
          )}

          {stepId === "credentials" && role === "agent" && (
            <>
              <Field>
                <FieldLabel>LASRERA registration number</FieldLabel>
                <Input name="lasrera" required placeholder="LASRERA/…" />
                <FieldDescription>Required for agents operating in Lagos. We verify it with LASRERA.</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>NIESV or ESVARBON number (optional)</FieldLabel>
                <Input name="niesv" placeholder="Earns an extra badge" />
              </Field>
            </>
          )}

          {stepId === "business" && (
            <>
              <Field>
                <FieldLabel>Company name</FieldLabel>
                <Input name="company" required placeholder="Okafor Realty" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel>CAC number (optional)</FieldLabel>
                  <Input name="cac" placeholder="RC 1234567" />
                </Field>
                <Field>
                  <FieldLabel>Areas you cover</FieldLabel>
                  <Input name="areas" placeholder="Yaba, Surulere, Gbagada" />
                </Field>
              </div>
              <Field>
                <FieldLabel>Office address</FieldLabel>
                <Input name="office" required />
              </Field>
            </>
          )}

          {stepId === "payout" && (
            <>
              <Field>
                <FieldLabel>Bank</FieldLabel>
                <Select
                  name="bank"
                  value={bank}
                  onValueChange={(v) => setBank(String(v ?? "gtbank"))}
                  items={[
                    { label: "GTBank", value: "gtbank" },
                    { label: "Access Bank", value: "access" },
                    { label: "Zenith Bank", value: "zenith" },
                    { label: "First Bank", value: "firstbank" },
                    { label: "Kuda", value: "kuda" },
                    { label: "Opay", value: "opay" },
                  ]}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectPopup>
                    <SelectItem value="gtbank">GTBank</SelectItem>
                    <SelectItem value="access">Access Bank</SelectItem>
                    <SelectItem value="zenith">Zenith Bank</SelectItem>
                    <SelectItem value="firstbank">First Bank</SelectItem>
                    <SelectItem value="kuda">Kuda</SelectItem>
                    <SelectItem value="opay">Opay</SelectItem>
                  </SelectPopup>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Account number</FieldLabel>
                <Input name="accountNumber" inputMode="numeric" maxLength={10} required placeholder="10 digits" />
              </Field>
              <Field>
                <FieldLabel>Account name</FieldLabel>
                <Input name="accountName" required placeholder="As shown by your bank" defaultValue="Bello Adeyemi" />
                <FieldDescription>Must match the name on your NIN. This is how we stop payout fraud.</FieldDescription>
              </Field>
            </>
          )}

          {stepId === "terms" && (
            <div className="flex flex-col gap-3 text-sm">
              <ul className="flex list-disc flex-col gap-1.5 ps-5 text-muted-foreground">
                {role === "owner" ? (
                  <>
                    <li>Success fee of 3–5% of annual rent, only when a tenant pays through us.</li>
                    <li>Every fee must be listed upfront. Agency fee is capped at 10% of rent.</li>
                    <li>Confirm availability every 30 days or the listing expires.</li>
                  </>
                ) : (
                  <>
                    <li>Declare your commission upfront, capped at 10% of rent.</li>
                    <li>No registration, inspection or “drink” fees outside the platform.</li>
                    <li>You need an approved owner mandate for every listing.</li>
                    <li>Confirm availability every 30 days. Three confirmed violations = suspension.</li>
                  </>
                )}
              </ul>
              <Label className="items-start">
                <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
                <span>I accept these terms.</span>
              </Label>
            </div>
          )}
        </CardPanel>
        <CardFooter className="justify-between gap-2">
          <Button variant="ghost" onClick={onDone}>Save and finish later</Button>
          <Button type="submit" loading={submit.isPending} disabled={stepId === "terms" && !agreed}>
            {status === "rejected" ? "Resubmit" : "Submit"}
          </Button>
        </CardFooter>
      </Form>
    </Card>
  );
}

function UploadBox({
  label,
  hint,
  onFile,
  accept,
  capture,
}: {
  label: string;
  hint: string;
  onFile: (name: string) => void;
  accept: string;
  capture?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 hover:bg-accent">
      <UploadIcon className="size-5 text-muted-foreground" />
      <span className="flex flex-col">
        <span className="font-medium text-sm">{label}</span>
        <span className="text-muted-foreground text-xs">{hint}</span>
      </span>
      <input
        type="file"
        accept={accept}
        capture={capture ? "user" : undefined}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0]?.name ?? "")}
      />
    </label>
  );
}
