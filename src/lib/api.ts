/**
 * Fake API. Every function mirrors an endpoint in the Dev PRD and resolves
 * after a short delay so loading states are real. Swap the bodies for
 * fetch() calls to `/api/v1/...` when the NestJS API exists — the
 * function signatures and the query hooks in ./queries.ts stay the same.
 *
 * State lives in memory for the lifetime of the browser tab.
 */
import {
  initialApplications,
  initialInspections,
  initialMandates,
  initialMessages,
  initialOnboarding,
  initialPayments,
  listers,
  listings as seedListings,
  slots as seedSlots,
  threads as seedThreads,
} from "./mock-data";
import { daysAgo, LISTING_TTL_DAYS, totalMoveIn } from "./format";
import type {
  Application,
  Inspection,
  InspectionSlot,
  Lister,
  Listing,
  Mandate,
  Message,
  OnboardingState,
  OnboardingStepId,
  Payment,
  Pricing,
  PropertyType,
  SearchFilters,
  Thread,
} from "./types";

const db = {
  listings: structuredClone(seedListings),
  slots: structuredClone(seedSlots),
  inspections: structuredClone(initialInspections),
  applications: structuredClone(initialApplications),
  payments: structuredClone(initialPayments),
  threads: structuredClone(seedThreads),
  messages: structuredClone(initialMessages),
  onboarding: structuredClone(initialOnboarding),
  mandates: structuredClone(initialMandates),
  saved: new Set<string>(["lst-104"]),
  myApplicationIds: new Set<string>(["app-1"]),
};

const wait = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const clone = <T,>(v: T): T => structuredClone(v);
const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

export class ApiError extends Error {}

/* ------------------------------ Listings ------------------------------ */

function isLive(l: Listing): boolean {
  return l.status === "live" && daysAgo(l.availabilityConfirmedAt) <= LISTING_TTL_DAYS;
}

/** GET /properties */
export async function searchListings(f: SearchFilters): Promise<Listing[]> {
  await wait();
  const q = f.q.trim().toLowerCase();
  let rows = db.listings.filter(isLive).filter((l) => {
    const rent = l.pricing.annualRent / 100;
    if (q && !`${l.area} ${l.lga} ${l.address} ${l.title}`.toLowerCase().includes(q)) return false;
    if (rent < f.minRent || rent > f.maxRent) return false;
    if (f.types.length && !f.types.includes(l.type)) return false;
    if (l.bedrooms < f.minBedrooms) return false;
    return true;
  });

  rows = rows.sort((a, b) => {
    switch (f.sort) {
      case "price-asc":
        return a.pricing.annualRent - b.pricing.annualRent;
      case "price-desc":
        return b.pricing.annualRent - a.pricing.annualRent;
      case "newest":
        return b.createdAt.localeCompare(a.createdAt);
      default:
        // Verified + freshest first
        return b.availabilityConfirmedAt.localeCompare(a.availabilityConfirmedAt);
    }
  });

  // Sponsored slots: capped at 1 in 10, always labelled, never above position 2.
  const sponsored = rows.filter((l) => l.sponsored);
  const organic = rows.filter((l) => !l.sponsored);
  const maxSponsored = Math.max(1, Math.floor(rows.length / 10));
  const result = [...organic];
  sponsored.slice(0, maxSponsored).forEach((s, i) => {
    result.splice(Math.min(2 + i * 10, result.length), 0, s);
  });
  return clone(result);
}

/** GET /properties/:id */
export async function getListing(listingId: string): Promise<{ listing: Listing; lister: Lister }> {
  await wait(250);
  const listing = db.listings.find((l) => l.id === listingId);
  if (!listing) throw new ApiError("Listing not found");
  const lister = listers.find((x) => x.id === listing.listerId) ?? listers[0];
  return clone({ listing, lister });
}

export async function getFeatured(): Promise<Listing[]> {
  await wait(250);
  return clone(
    db.listings
      .filter(isLive)
      .sort((a, b) => b.availabilityConfirmedAt.localeCompare(a.availabilityConfirmedAt))
      .slice(0, 6),
  );
}

export interface NewListingInput {
  title: string;
  description: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: string;
  address: string;
  pricing: Pricing;
  amenities: string[];
  photoCount: number;
}

/** POST /properties — goes to admin review (status "pending") */
export async function createListing(input: NewListingInput): Promise<Listing> {
  await wait(600);
  const listing: Listing = {
    ...input,
    id: id("lst"),
    lga: input.area,
    mapX: 20 + Math.random() * 60,
    mapY: 20 + Math.random() * 60,
    hue: Math.floor(Math.random() * 360),
    status: "pending",
    verified: false,
    availabilityConfirmedAt: new Date().toISOString(),
    sponsored: false,
    listerId: "l-bello",
    createdAt: new Date().toISOString(),
  };
  db.listings.unshift(listing);
  return clone(listing);
}

/** Owner's own units (mock: everything listed by l-bello) */
export async function getMyListings(): Promise<Listing[]> {
  await wait();
  return clone(db.listings.filter((l) => l.listerId === "l-bello"));
}

/** PATCH /properties/:id — re-confirm availability (resets the 30-day clock) */
export async function confirmAvailability(listingId: string): Promise<void> {
  await wait(300);
  const l = db.listings.find((x) => x.id === listingId);
  if (l) l.availabilityConfirmedAt = new Date().toISOString();
}

/* ------------------------------ Saved ------------------------------ */

export async function getSavedIds(): Promise<string[]> {
  await wait(150);
  return [...db.saved];
}

export async function toggleSaved(listingId: string): Promise<boolean> {
  await wait(150);
  if (db.saved.has(listingId)) {
    db.saved.delete(listingId);
    return false;
  }
  db.saved.add(listingId);
  return true;
}

export async function getSavedListings(): Promise<Listing[]> {
  await wait();
  return clone(db.listings.filter((l) => db.saved.has(l.id)));
}

/* ------------------------------ Inspections ------------------------------ */

/** GET /properties/:id/slots */
export async function getSlots(listingId: string): Promise<InspectionSlot[]> {
  await wait(200);
  return clone(db.slots.filter((s) => s.listingId === listingId));
}

/** POST /inspections — always free for tenants */
export async function bookInspection(slotId: string): Promise<Inspection> {
  await wait(500);
  const slot = db.slots.find((s) => s.id === slotId);
  if (!slot) throw new ApiError("Slot not found");
  if (slot.booked >= slot.capacity) throw new ApiError("That slot just filled up. Pick another time.");
  slot.booked += 1;
  const inspection: Inspection = {
    id: id("insp"),
    slotId,
    listingId: slot.listingId,
    startsAt: slot.startsAt,
    status: "booked",
  };
  db.inspections.push(inspection);
  return clone(inspection);
}

export async function getMyInspections(): Promise<(Inspection & { listing: Listing })[]> {
  await wait();
  return clone(
    db.inspections.map((i) => ({
      ...i,
      listing: db.listings.find((l) => l.id === i.listingId)!,
    })),
  );
}

export async function cancelInspection(inspectionId: string): Promise<void> {
  await wait(300);
  const i = db.inspections.find((x) => x.id === inspectionId);
  if (i) i.status = "cancelled";
}

/** Landlord view: all bookings on their units */
export async function getLandlordInspections(): Promise<(Inspection & { listing: Listing })[]> {
  return getMyInspections();
}

/* ------------------------------ Applications ------------------------------ */

export interface ApplicationInput {
  listingId: string;
  applicantName: string;
  occupation: string;
  monthlyIncome: number;
  guarantorName: string;
}

/** POST /applications */
export async function submitApplication(input: ApplicationInput): Promise<Application> {
  await wait(700);
  const app: Application = {
    ...input,
    id: id("app"),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.applications.unshift(app);
  db.myApplicationIds.add(app.id);
  // Demo convenience: auto-approve after a few seconds so the payment flow is reachable.
  setTimeout(() => {
    const a = db.applications.find((x) => x.id === app.id);
    if (a && a.status === "pending") a.status = "approved";
  }, 4000);
  return clone(app);
}

/** Tenant view: applications the signed-in tenant submitted */
export async function getMyApplications(): Promise<(Application & { listing: Listing })[]> {
  await wait();
  return clone(
    db.applications
      .filter((a) => db.myApplicationIds.has(a.id))
      .map((a) => ({ ...a, listing: db.listings.find((l) => l.id === a.listingId)! })),
  );
}

/** Landlord view: applications on the signed-in owner's units */
export async function getLandlordApplications(): Promise<(Application & { listing: Listing })[]> {
  await wait();
  const mine = new Set(db.listings.filter((l) => l.listerId === "l-bello").map((l) => l.id));
  return clone(
    db.applications
      .filter((a) => mine.has(a.listingId))
      .map((a) => ({ ...a, listing: db.listings.find((l) => l.id === a.listingId)! })),
  );
}

export async function getApplication(appId: string): Promise<Application & { listing: Listing }> {
  await wait(200);
  const a = db.applications.find((x) => x.id === appId);
  if (!a) throw new ApiError("Application not found");
  return clone({ ...a, listing: db.listings.find((l) => l.id === a.listingId)! });
}

/** PATCH /applications/:id */
export async function decideApplication(appId: string, status: "approved" | "rejected"): Promise<void> {
  await wait(400);
  const a = db.applications.find((x) => x.id === appId);
  if (a) a.status = status;
}

/* ------------------------------ Payments ------------------------------ */

/**
 * POST /payments/initialize → Paystack (split payments).
 * Funds are "held" until the tenant confirms move-in (escrow pending legal sign-off).
 */
export async function payForApplication(appId: string): Promise<Payment> {
  await wait(1200);
  const a = db.applications.find((x) => x.id === appId);
  if (!a) throw new ApiError("Application not found");
  if (a.status !== "approved") throw new ApiError("The landlord hasn't approved this application yet.");
  const listing = db.listings.find((l) => l.id === a.listingId)!;
  const payment: Payment = {
    id: id("pay"),
    applicationId: appId,
    listingId: listing.id,
    amount: totalMoveIn(listing.pricing),
    status: "held",
    reference: `RW-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    agreementAcceptedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  db.payments.push(payment);
  return clone(payment);
}

export async function getPaymentForApplication(appId: string): Promise<Payment | null> {
  await wait(150);
  return clone(db.payments.find((p) => p.applicationId === appId) ?? null);
}

export async function getMyPayments(): Promise<(Payment & { listing: Listing })[]> {
  await wait();
  return clone(db.payments.map((p) => ({ ...p, listing: db.listings.find((l) => l.id === p.listingId)! })));
}

/** Tenant confirms move-in → landlord payout released */
export async function confirmMoveIn(paymentId: string): Promise<void> {
  await wait(600);
  const p = db.payments.find((x) => x.id === paymentId);
  if (!p) return;
  p.status = "released";
  p.releasedAt = new Date().toISOString();
  const l = db.listings.find((x) => x.id === p.listingId);
  if (l) l.status = "rented";
}

/* ------------------------------ Messages ------------------------------ */

export async function getThreads(): Promise<(Thread & { listing: Listing; last?: Message })[]> {
  await wait(200);
  return clone(
    db.threads.map((t) => ({
      ...t,
      listing: db.listings.find((l) => l.id === t.listingId)!,
      last: [...db.messages].reverse().find((m) => m.threadId === t.id),
    })),
  );
}

export async function getMessages(threadId: string): Promise<Message[]> {
  await wait(150);
  return clone(db.messages.filter((m) => m.threadId === threadId));
}

export async function sendMessage(threadId: string, body: string): Promise<Message> {
  await wait(200);
  const msg: Message = { id: id("m"), threadId, from: "me", body, sentAt: new Date().toISOString() };
  db.messages.push(msg);
  return clone(msg);
}

/** Opens (or reuses) the thread tied to a listing */
export async function openThreadForListing(listingId: string): Promise<string> {
  await wait(150);
  const existing = db.threads.find((t) => t.listingId === listingId);
  if (existing) return existing.id;
  const listing = db.listings.find((l) => l.id === listingId)!;
  const lister = listers.find((x) => x.id === listing.listerId)!;
  const t: Thread = { id: id("th"), listingId, withName: lister.name };
  db.threads.push(t);
  return t.id;
}

/* ------------------------------ Onboarding ------------------------------ */

/** GET /onboarding */
export async function getOnboarding(): Promise<OnboardingState> {
  await wait(200);
  return clone(db.onboarding);
}

export async function setOnboardingRole(role: "owner" | "agent"): Promise<OnboardingState> {
  await wait(150);
  db.onboarding.role = role;
  return clone(db.onboarding);
}

/**
 * PATCH /onboarding — submit a step. Automated checks (identity, payout name match)
 * resolve quickly; document reviews stay "pending" until an admin acts.
 */
export async function submitOnboardingStep(
  stepId: OnboardingStepId,
  data: Record<string, string>,
): Promise<OnboardingState> {
  await wait(900);
  const step = db.onboarding.steps.find((s) => s.id === stepId);
  if (!step) throw new ApiError("Unknown step");

  step.reason = undefined;
  if (stepId === "identity") {
    if (!/^\d{11}$/.test(data.nin ?? "")) {
      step.status = "rejected";
      step.reason = "NIN must be 11 digits. Check the number on your NIN slip.";
    } else {
      step.status = "approved";
    }
  } else if (stepId === "payout") {
    const fullName = (data.accountName ?? "").toLowerCase();
    step.status = fullName.includes("adeyemi") || fullName.includes("okafor") ? "approved" : "pending";
    if (step.status === "pending") step.reason = "Account name didn't auto-match your NIN name. A reviewer will check it.";
  } else if (stepId === "credentials") {
    step.status = "pending";
  } else {
    step.status = "approved";
  }

  // Demo: pending document reviews get approved after a few seconds.
  if (step.status === "pending") {
    setTimeout(() => {
      if (step.status === "pending") {
        step.status = "approved";
        step.reason = undefined;
      }
    }, 6000);
  }
  return clone(db.onboarding);
}

/* ------------------------------ Mandates ------------------------------ */

export async function getMandates(): Promise<Mandate[]> {
  await wait(200);
  return clone(db.mandates);
}

/** POST /mandates — agent requests; owner approves in-app */
export async function requestMandate(input: {
  propertyAddress: string;
  ownerPhone: string;
  commissionPct: number;
}): Promise<Mandate> {
  await wait(500);
  if (input.commissionPct > 10) throw new ApiError("Agency commission is capped at 10% in Lagos.");
  const m: Mandate = {
    id: id("md"),
    ...input,
    ownerPhone: input.ownerPhone.replace(/(\d{4})\d{3}(\d{4})/, "$1 *** $2"),
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.mandates.unshift(m);
  return clone(m);
}

/* ------------------------------ Reports ------------------------------ */

/** POST /reports */
export async function reportListing(listingId: string, reason: string, details: string): Promise<void> {
  await wait(500);
  void listingId;
  void reason;
  void details;
}
