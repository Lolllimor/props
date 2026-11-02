"use client";

import { BadgeCheckIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipPopup, TooltipTrigger } from "@/components/ui/tooltip";
import { formatDate } from "@/lib/format";

export function VerifiedBadge({ by, at }: { by?: string; at?: string }) {
  const badge = (
    <Badge variant="success" size="lg">
      <BadgeCheckIcon />
      Verified
    </Badge>
  );
  if (!by) return badge;
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" tabIndex={0} />}>{badge}</TooltipTrigger>
      <TooltipPopup>
        {by}
        {at ? ` · ${formatDate(at)}` : ""}
      </TooltipPopup>
    </Tooltip>
  );
}
