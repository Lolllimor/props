"use client";

import { CalendarCheckIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/format";
import { useBookInspection, useSlots } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function BookInspectionDialog({ listingId, disabled }: { listingId: string; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [slotId, setSlotId] = useState<string>("");
  const { data: slots, isPending } = useSlots(listingId);
  const book = useBookInspection();

  function confirm() {
    book.mutate(slotId, {
      onSuccess: (i) => {
        setOpen(false);
        setSlotId("");
        toastManager.add({
          type: "success",
          title: "Inspection booked — it’s free",
          description: `${formatDateTime(i.startsAt)}. We’ll send an SMS reminder 24 hours before.`,
        });
      },
      onError: (e) => toastManager.add({ type: "error", title: "Couldn’t book that slot", description: e.message }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" disabled={disabled} />}>
        <CalendarCheckIcon />
        Book a free inspection
      </DialogTrigger>
      <DialogPopup className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pick an inspection time</DialogTitle>
          <DialogDescription>
            Free, always. The owner or verified agent will meet you at the property.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          {isPending ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <RadioGroup
              aria-label="Inspection slot"
              value={slotId}
              onValueChange={(v) => setSlotId(String(v))}
              className="flex flex-col gap-2"
            >
              {slots?.map((s) => {
                const full = s.booked >= s.capacity;
                const left = s.capacity - s.booked;
                return (
                  <Label
                    key={s.id}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border p-3 has-data-checked:border-primary has-data-checked:bg-primary/5",
                      full && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <Radio value={s.id} disabled={full} />
                    <span className="flex-1 font-medium">{formatDateTime(s.startsAt)}</span>
                    {full ? (
                      <Badge variant="secondary">Full</Badge>
                    ) : left <= 1 ? (
                      <Badge variant="warning">1 spot left</Badge>
                    ) : (
                      <Badge variant="outline">{left} spots</Badge>
                    )}
                  </Label>
                );
              })}
            </RadioGroup>
          )}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
          <Button onClick={confirm} disabled={!slotId} loading={book.isPending}>
            Confirm booking
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
