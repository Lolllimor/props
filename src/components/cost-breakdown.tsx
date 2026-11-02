import { TriangleAlertIcon } from "lucide-react";
import { Table, TableBody, TableCell, TableFooter, TableRow } from "@/components/ui/table";
import { agencyFeeOverCap, formatNaira, totalMoveIn } from "@/lib/format";
import type { Pricing } from "@/lib/types";

const rows: { key: keyof Pricing; label: string; hint?: string }[] = [
  { key: "annualRent", label: "Rent (1 year)" },
  { key: "cautionFee", label: "Caution deposit", hint: "Refundable when you move out" },
  { key: "agencyFee", label: "Agency fee", hint: "Capped at 10% of rent" },
  { key: "legalFee", label: "Legal / agreement fee" },
  { key: "serviceCharge", label: "Service charge" },
];

export function CostBreakdown({ pricing }: { pricing: Pricing }) {
  const overCap = agencyFeeOverCap(pricing);
  return (
    <div className="flex flex-col gap-3">
      <Table>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.key}>
              <TableCell>
                <div className="font-medium">{r.label}</div>
                {r.hint && <div className="text-muted-foreground text-xs">{r.hint}</div>}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {pricing[r.key] === 0 ? <span className="text-muted-foreground">None</span> : formatNaira(pricing[r.key])}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-semibold">Total to move in</TableCell>
            <TableCell className="text-right font-semibold tabular-nums">{formatNaira(totalMoveIn(pricing))}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      {overCap && (
        <p className="flex items-center gap-1.5 text-warning-foreground text-xs">
          <TriangleAlertIcon className="size-3.5" />
          Agency fee is above the 10% Lagos cap. We’ve flagged this listing for review.
        </p>
      )}
      <p className="text-muted-foreground text-xs">
        This is everything. No registration, inspection, “drink” or any other fee is payable to anyone.
      </p>
    </div>
  );
}
