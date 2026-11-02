import type { Kobo, Pricing, PropertyType } from "./types";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(kobo: Kobo): string {
  return naira.format(kobo / 100);
}

/** Compact form for cards: ₦2.5m, ₦850k */
export function formatNairaShort(kobo: Kobo): string {
  const n = kobo / 100;
  if (n >= 1_000_000) return `₦${trim(n / 1_000_000)}m`;
  if (n >= 1_000) return `₦${trim(n / 1_000)}k`;
  return `₦${n}`;
}

function trim(n: number): string {
  return n.toFixed(1).replace(/\.0$/, "");
}

export function naira2kobo(n: number): Kobo {
  return Math.round(n * 100);
}

export function totalMoveIn(p: Pricing): Kobo {
  return p.annualRent + p.cautionFee + p.agencyFee + p.legalFee + p.serviceCharge;
}

/** Lagos tenancy rules cap agency fee at 10% of annual rent. */
export const AGENCY_FEE_CAP = 0.1;

export function agencyFeeOverCap(p: Pricing): boolean {
  return p.agencyFee > p.annualRent * AGENCY_FEE_CAP;
}

export const propertyTypeLabels: Record<PropertyType, string> = {
  "self-contain": "Self-contain",
  "mini-flat": "Mini flat",
  flat: "Flat",
  duplex: "Duplex",
  bungalow: "Bungalow",
};

export function daysAgo(iso: string, now: Date = new Date()): number {
  const ms = now.getTime() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export function freshnessLabel(iso: string): string {
  const d = daysAgo(iso);
  if (d === 0) return "Confirmed available today";
  if (d === 1) return "Confirmed available yesterday";
  return `Confirmed available ${d} days ago`;
}

export const LISTING_TTL_DAYS = 30;

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
