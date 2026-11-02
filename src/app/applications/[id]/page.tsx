"use client";

import { ArrowLeftIcon, CheckCircle2Icon, FileTextIcon, HourglassIcon, KeyRoundIcon, LockIcon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { CostBreakdown } from "@/components/cost-breakdown";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { toastManager } from "@/components/ui/toast";
import { formatDate, formatNaira, totalMoveIn } from "@/lib/format";
import { useApplication, useConfirmMoveIn, usePay, usePayment } from "@/lib/queries";

export default function ApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: app, isPending } = useApplication(id);
  const { data: payment } = usePayment(id);
  const pay = usePay();
  const confirmMoveIn = useConfirmMoveIn();
  const [agreed, setAgreed] = useState(false);

  if (isPending || !app) {
    return (
      <div className="container flex max-w-3xl flex-col gap-4 py-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const total = totalMoveIn(app.listing.pricing);

  return (
    <div className="container flex max-w-3xl flex-col gap-6 py-8">
      <Button variant="ghost" size="sm" className="self-start" render={<Link href="/dashboard?tab=applications" />}>
        <ArrowLeftIcon />
        My applications
      </Button>

      <div className="flex flex-col gap-2">
        <h1 className="font-semibold text-2xl">{app.listing.title}</h1>
        <p className="text-muted-foreground">
          {app.listing.address} · Applied {formatDate(app.createdAt)}
        </p>
      </div>

      <Steps app={app.status} paid={payment?.status} />

      {app.status === "pending" && (
        <Alert variant="info">
          <HourglassIcon />
          <AlertTitle>Waiting for the landlord</AlertTitle>
          <AlertDescription>Most landlords decide within 48 hours. You haven’t paid anything.</AlertDescription>
        </Alert>
      )}

      {app.status === "rejected" && (
        <Alert variant="error">
          <XCircleIcon />
          <AlertTitle>Not approved this time</AlertTitle>
          <AlertDescription>
            You haven’t paid anything. <Link className="underline" href="/search">See similar homes</Link>.
          </AlertDescription>
        </Alert>
      )}

      {app.status === "approved" && !payment && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="size-5" />
                Tenancy agreement
              </CardTitle>
              <CardDescription>Standard Lagos tenancy agreement, pre-filled for this home.</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <ScrollArea className="h-48 rounded-xl border bg-muted/40 text-sm">
                <div className="flex flex-col gap-3 p-4">
                  <p><strong>Parties.</strong> This agreement is between the landlord of {app.listing.address} and {app.applicantName} (the tenant).</p>
                  <p><strong>Term.</strong> One (1) year from the move-in date confirmed in the app.</p>
                  <p><strong>Rent.</strong> {formatNaira(app.listing.pricing.annualRent)} per annum, paid in advance.</p>
                  <p><strong>Caution deposit.</strong> {formatNaira(app.listing.pricing.cautionFee)}, refundable at the end of the tenancy less the cost of any damage beyond fair wear and tear.</p>
                  <p><strong>Fees.</strong> No fee other than those listed in the cost breakdown is payable by the tenant to the landlord, agent or any other party.</p>
                  <p><strong>Notice.</strong> Notice to quit is governed by the Tenancy Law of Lagos State 2011.</p>
                  <p className="text-muted-foreground">Prototype text. Final agreement to be reviewed by a lawyer before launch.</p>
                </div>
              </ScrollArea>
              <Label className="items-start">
                <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(Boolean(v))} />
                <span>I’ve read and accept the tenancy agreement. The landlord accepts it too when they receive payment.</span>
              </Label>
            </CardPanel>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pay {formatNaira(total)}</CardTitle>
              <CardDescription>Card, bank transfer or USSD via Paystack.</CardDescription>
            </CardHeader>
            <CardPanel className="flex flex-col gap-4">
              <CostBreakdown pricing={app.listing.pricing} />
              <Alert>
                <LockIcon />
                <AlertDescription>
                  We hold your money until you confirm you’ve moved in. If the keys aren’t handed over, you get it back.
                </AlertDescription>
              </Alert>
              <Button
                size="lg"
                disabled={!agreed}
                loading={pay.isPending}
                onClick={() =>
                  pay.mutate(id, {
                    onSuccess: (p) =>
                      toastManager.add({ type: "success", title: "Payment received", description: `Reference ${p.reference}. Funds are held safely.` }),
                    onError: (e) => toastManager.add({ type: "error", title: "Payment failed", description: e.message }),
                  })
                }
              >
                Accept agreement and pay {formatNaira(total)}
              </Button>
            </CardPanel>
          </Card>
        </>
      )}

      {payment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {payment.status === "released" ? (
                <>
                  <CheckCircle2Icon className="size-5 text-success" /> Welcome home
                </>
              ) : (
                <>
                  <LockIcon className="size-5 text-primary" /> {formatNaira(payment.amount)} held safely
                </>
              )}
            </CardTitle>
            <CardDescription>
              Reference {payment.reference} · Paid {formatDate(payment.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardPanel className="flex flex-col gap-4">
            {payment.status === "held" ? (
              <>
                <p className="text-muted-foreground text-sm">
                  Once you have the keys and the home matches the listing, confirm move-in. We then pay the landlord. If you
                  don’t confirm or raise an issue within 72 hours of the agreed date, payment is released automatically.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger render={<Button size="lg" className="self-start" />}>
                    <KeyRoundIcon />
                    I’ve moved in
                  </AlertDialogTrigger>
                  <AlertDialogPopup>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm you’ve moved in?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This releases {formatNaira(payment.amount)} to the landlord. You can’t undo it. Only confirm if you have the keys and the home matches the listing.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogClose render={<Button variant="ghost" />}>Not yet</AlertDialogClose>
                      <AlertDialogClose
                        render={
                          <Button
                            onClick={() =>
                              confirmMoveIn.mutate(payment.id, {
                                onSuccess: () => toastManager.add({ type: "success", title: "Move-in confirmed", description: "The landlord has been paid. Enjoy your new home." }),
                              })
                            }
                          />
                        }
                      >
                        Yes, release payment
                      </AlertDialogClose>
                    </AlertDialogFooter>
                  </AlertDialogPopup>
                </AlertDialog>
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Payment released to the landlord on {payment.releasedAt ? formatDate(payment.releasedAt) : "—"}. Your receipt and signed agreement are in your dashboard.
              </p>
            )}
          </CardPanel>
        </Card>
      )}
    </div>
  );
}

function Steps({ app, paid }: { app: "pending" | "approved" | "rejected"; paid?: string }) {
  const steps = [
    { label: "Applied", done: true },
    { label: "Approved", done: app === "approved" },
    { label: "Paid (held)", done: !!paid },
    { label: "Moved in", done: paid === "released" },
  ];
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
      {steps.map((s, i) => (
        <li key={s.label} className="flex flex-col gap-1.5">
          <span className={s.done ? "h-1.5 rounded-full bg-primary" : "h-1.5 rounded-full bg-muted"} />
          <span className="flex items-center gap-1 text-xs">
            <Badge variant={s.done ? "success" : "outline"} size="sm">{i + 1}</Badge>
            <span className={s.done ? "font-medium" : "text-muted-foreground"}>{s.label}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
