/** Money is always stored in kobo (integer). Use formatNaira() to display. */
export type Kobo = number;

export type Role = "tenant" | "owner" | "agent" | "admin";

export type PropertyType =
  | "self-contain"
  | "mini-flat"
  | "flat"
  | "duplex"
  | "bungalow";

export type ListingStatus = "draft" | "pending" | "live" | "paused" | "rented";

export type VerificationStatus = "not_started" | "pending" | "approved" | "rejected";

export interface Pricing {
  annualRent: Kobo;
  cautionFee: Kobo;
  agencyFee: Kobo;
  legalFee: Kobo;
  serviceCharge: Kobo;
}

export interface Lister {
  id: string;
  name: string;
  role: "owner" | "agent";
  verified: boolean;
  /** e.g. "LASRERA verified" or "Owner ID + C of O checked" */
  verifiedBy: string;
  verifiedAt: string;
  responseTime: string;
  listingsCount: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: string;
  lga: string;
  address: string;
  /** 0–100 grid coords for the mock map */
  mapX: number;
  mapY: number;
  pricing: Pricing;
  amenities: string[];
  photoCount: number;
  hue: number;
  status: ListingStatus;
  verified: boolean;
  /** ISO date of last availability confirmation; listings expire after 30 days */
  availabilityConfirmedAt: string;
  sponsored: boolean;
  listerId: string;
  createdAt: string;
}

export interface InspectionSlot {
  id: string;
  listingId: string;
  startsAt: string;
  capacity: number;
  booked: number;
}

export type InspectionStatus = "booked" | "confirmed" | "attended" | "cancelled";

export interface Inspection {
  id: string;
  slotId: string;
  listingId: string;
  startsAt: string;
  status: InspectionStatus;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface Application {
  id: string;
  listingId: string;
  applicantName: string;
  occupation: string;
  monthlyIncome: Kobo;
  guarantorName: string;
  status: ApplicationStatus;
  createdAt: string;
}

export type PaymentStatus = "pending" | "held" | "released" | "refunded";

export interface Payment {
  id: string;
  applicationId: string;
  listingId: string;
  amount: Kobo;
  status: PaymentStatus;
  reference: string;
  agreementAcceptedAt: string;
  createdAt: string;
  releasedAt?: string;
}

export interface Message {
  id: string;
  threadId: string;
  from: "me" | "them";
  body: string;
  sentAt: string;
}

export interface Thread {
  id: string;
  listingId: string;
  withName: string;
}

export type OnboardingStepId =
  | "account"
  | "identity"
  | "credentials"
  | "business"
  | "payout"
  | "terms";

export interface OnboardingStep {
  id: OnboardingStepId;
  status: VerificationStatus;
  reason?: string;
}

export interface OnboardingState {
  role: "owner" | "agent";
  steps: OnboardingStep[];
}

export type MandateStatus = "pending" | "approved" | "rejected";

export interface Mandate {
  id: string;
  propertyAddress: string;
  ownerPhone: string;
  commissionPct: number;
  status: MandateStatus;
  createdAt: string;
}

export interface SearchFilters {
  q: string;
  minRent: number; // naira
  maxRent: number; // naira
  types: PropertyType[];
  minBedrooms: number;
  sort: "verified" | "price-asc" | "price-desc" | "newest";
}
