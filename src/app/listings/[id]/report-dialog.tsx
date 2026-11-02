"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { toastManager } from "@/components/ui/toast";
import { useReportListing } from "@/lib/queries";

const reasons = [
  "Asked me to pay to inspect",
  "House doesn’t match the photos",
  "Already rented / not available",
  "Extra fees not listed here",
  "Lister isn’t the owner or agent",
  "Something else",
];

export function ReportDialog({ listingId, children }: { listingId: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const report = useReportListing();

  function submit() {
    report.mutate(
      { listingId, reason, details },
      {
        onSuccess: () => {
          setOpen(false);
          setReason("");
          setDetails("");
          toastManager.add({
            type: "success",
            title: "Thanks — we’re on it",
            description: "Our team reviews reports within 24 hours. You won’t be charged anything.",
          });
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm" className="text-muted-foreground" />}>
        {children}
      </DialogTrigger>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
          <DialogDescription>Reports are anonymous to the lister.</DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-4">
          <RadioGroup aria-label="Reason" value={reason} onValueChange={(v) => setReason(String(v))}>
            {reasons.map((r) => (
              <Label key={r}>
                <Radio value={r} /> {r}
              </Label>
            ))}
          </RadioGroup>
          <Field>
            <FieldLabel>What happened? (optional)</FieldLabel>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Amounts asked, dates, phone numbers used…" />
          </Field>
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button variant="destructive" onClick={submit} disabled={!reason} loading={report.isPending}>
            Send report
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
