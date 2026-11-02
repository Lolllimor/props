import { naira2kobo } from "./format";
import type {
  Application,
  Inspection,
  InspectionSlot,
  Lister,
  Listing,
  Mandate,
  Message,
  OnboardingState,
  Payment,
  Pricing,
  PropertyType,
  Thread,
} from "./types";

const DAY = 86_400_000;
const now = Date.now();
const daysFromNow = (d: number, hour = 10): string => {
  const date = new Date(now + d * DAY);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

function pricing(rent: number, opts: Partial<Record<keyof Pricing, number>> = {}): Pricing {
  return {
    annualRent: naira2kobo(rent),
    cautionFee: naira2kobo(opts.cautionFee ?? rent * 0.1),
    agencyFee: naira2kobo(opts.agencyFee ?? rent * 0.1),
    legalFee: naira2kobo(opts.legalFee ?? rent * 0.1),
    serviceCharge: naira2kobo(opts.serviceCharge ?? 0),
  };
}

export const listers: Lister[] = [
  {
    id: "l-bello",
    name: "Mr. Bello Adeyemi",
    role: "owner",
    verified: true,
    verifiedBy: "Owner ID + C of O checked",
    verifiedAt: daysFromNow(-40),
    responseTime: "Usually replies within 2 hours",
    listingsCount: 4,
  },
  {
    id: "l-tunde",
    name: "Tunde Okafor · Okafor Realty",
    role: "agent",
    verified: true,
    verifiedBy: "LASRERA licence + owner mandate",
    verifiedAt: daysFromNow(-12),
    responseTime: "Usually replies within 1 hour",
    listingsCount: 11,
  },
  {
    id: "l-ngozi",
    name: "Mrs. Ngozi Eze",
    role: "owner",
    verified: true,
    verifiedBy: "Owner ID + deed of assignment checked",
    verifiedAt: daysFromNow(-90),
    responseTime: "Usually replies same day",
    listingsCount: 2,
  },
  {
    id: "l-kemi",
    name: "Kemi Lawal · Lawal Homes",
    role: "agent",
    verified: true,
    verifiedBy: "LASRERA licence + NIESV member",
    verifiedAt: daysFromNow(-5),
    responseTime: "Usually replies within 30 minutes",
    listingsCount: 23,
  },
];

interface Seed {
  title: string;
  type: PropertyType;
  beds: number;
  baths: number;
  area: string;
  lga: string;
  address: string;
  rent: number;
  fees?: Partial<Record<keyof Pricing, number>>;
  amenities: string[];
  lister: string;
  confirmedDaysAgo: number;
  sponsored?: boolean;
  x: number;
  y: number;
}

const seeds: Seed[] = [
  {
    title: "Bright 2-bedroom flat, all rooms en suite",
    type: "flat",
    beds: 2,
    baths: 2,
    area: "Yaba",
    lga: "Lagos Mainland",
    address: "Off Herbert Macaulay Way, Yaba",
    rent: 2_800_000,
    fees: { serviceCharge: 150_000 },
    amenities: ["Prepaid meter", "Water heater", "Tiled floors", "Gated compound"],
    lister: "l-bello",
    confirmedDaysAgo: 1,
    x: 38,
    y: 46,
  },
  {
    title: "Clean mini flat close to UNILAG",
    type: "mini-flat",
    beds: 1,
    baths: 1,
    area: "Akoka",
    lga: "Lagos Mainland",
    address: "Ogunlana St, Akoka",
    rent: 1_200_000,
    amenities: ["Prepaid meter", "Borehole", "Kitchen cabinets"],
    lister: "l-tunde",
    confirmedDaysAgo: 3,
    x: 34,
    y: 40,
  },
  {
    title: "Self-contain in quiet estate",
    type: "self-contain",
    beds: 1,
    baths: 1,
    area: "Gbagada",
    lga: "Kosofe",
    address: "Phase 2 Estate, Gbagada",
    rent: 850_000,
    amenities: ["Security", "Borehole", "Wardrobe"],
    lister: "l-kemi",
    confirmedDaysAgo: 0,
    x: 30,
    y: 28,
  },
  {
    title: "Spacious 3-bedroom flat with BQ",
    type: "flat",
    beds: 3,
    baths: 3,
    area: "Surulere",
    lga: "Surulere",
    address: "Adelabu St, Surulere",
    rent: 4_500_000,
    fees: { serviceCharge: 300_000 },
    amenities: ["BQ", "Parking for 2", "Prepaid meter", "Water treatment"],
    lister: "l-ngozi",
    confirmedDaysAgo: 6,
    x: 42,
    y: 58,
  },
  {
    title: "Newly built 2-bedroom, Ifako",
    type: "flat",
    beds: 2,
    baths: 3,
    area: "Gbagada",
    lga: "Kosofe",
    address: "Ifako, Gbagada",
    rent: 3_500_000,
    fees: { serviceCharge: 200_000 },
    amenities: ["Newly built", "Guest toilet", "Fully tiled", "Kitchen cabinets"],
    lister: "l-kemi",
    confirmedDaysAgo: 2,
    sponsored: true,
    x: 27,
    y: 31,
  },
  {
    title: "Serviced studio, 24h power",
    type: "self-contain",
    beds: 1,
    baths: 1,
    area: "Lekki Phase 1",
    lga: "Eti-Osa",
    address: "Admiralty Way, Lekki Phase 1",
    rent: 4_000_000,
    fees: { serviceCharge: 1_200_000 },
    amenities: ["24h power", "Gym", "Pool", "Security"],
    lister: "l-tunde",
    confirmedDaysAgo: 4,
    x: 78,
    y: 66,
  },
  {
    title: "4-bedroom semi-detached duplex",
    type: "duplex",
    beds: 4,
    baths: 5,
    area: "Ikeja GRA",
    lga: "Ikeja",
    address: "Isaac John St, Ikeja GRA",
    rent: 12_000_000,
    fees: { serviceCharge: 800_000 },
    amenities: ["BQ", "Parking for 4", "Inverter", "Garden"],
    lister: "l-bello",
    confirmedDaysAgo: 9,
    x: 40,
    y: 14,
  },
  {
    title: "Mini flat, upstairs, fenced with gate",
    type: "mini-flat",
    beds: 1,
    baths: 1,
    area: "Ajah",
    lga: "Eti-Osa",
    address: "Thomas Estate, Ajah",
    rent: 1_300_000,
    amenities: ["Fenced", "Prepaid meter", "POP ceiling"],
    lister: "l-kemi",
    confirmedDaysAgo: 1,
    x: 90,
    y: 72,
  },
  {
    title: "3-bedroom bungalow with compound",
    type: "bungalow",
    beds: 3,
    baths: 2,
    area: "Ikorodu",
    lga: "Ikorodu",
    address: "Ebute Rd, Ikorodu",
    rent: 1_800_000,
    amenities: ["Big compound", "Borehole", "Parking"],
    lister: "l-ngozi",
    confirmedDaysAgo: 12,
    x: 70,
    y: 12,
  },
  {
    title: "Cosy 1-bedroom flat by the third mainland",
    type: "flat",
    beds: 1,
    baths: 1,
    area: "Ebute Metta",
    lga: "Lagos Mainland",
    address: "Oyingbo, Ebute Metta",
    rent: 1_500_000,
    amenities: ["Prepaid meter", "Tiled", "Close to BRT"],
    lister: "l-tunde",
    confirmedDaysAgo: 5,
    x: 45,
    y: 50,
  },
  {
    title: "Executive 2-bedroom, Oniru",
    type: "flat",
    beds: 2,
    baths: 2,
    area: "Oniru",
    lga: "Eti-Osa",
    address: "Elegba Festival Dr, Oniru",
    rent: 9_000_000,
    fees: { serviceCharge: 1_500_000 },
    amenities: ["Elevator", "24h power", "Pool", "Smart locks"],
    lister: "l-kemi",
    confirmedDaysAgo: 2,
    sponsored: true,
    x: 66,
    y: 70,
  },
  {
    title: "Room self-contain near Ojuelegba",
    type: "self-contain",
    beds: 1,
    baths: 1,
    area: "Surulere",
    lga: "Surulere",
    address: "Ojuelegba Rd, Surulere",
    rent: 600_000,
    amenities: ["Prepaid meter", "Shared compound"],
    lister: "l-bello",
    confirmedDaysAgo: 0,
    x: 39,
    y: 62,
  },
];

export const listings: Listing[] = seeds.map((s, i) => ({
  id: `lst-${101 + i}`,
  title: s.title,
  description: `${s.title} at ${s.address}. Viewed and verified by our team. Every fee is listed below — nothing extra is payable to anyone, and inspections are always free.`,
  type: s.type,
  bedrooms: s.beds,
  bathrooms: s.baths,
  area: s.area,
  lga: s.lga,
  address: s.address,
  mapX: s.x,
  mapY: s.y,
  pricing: pricing(s.rent, s.fees),
  amenities: s.amenities,
  photoCount: 6 + (i % 5),
  hue: (i * 47) % 360,
  status: "live",
  verified: true,
  availabilityConfirmedAt: daysFromNow(-s.confirmedDaysAgo),
  sponsored: s.sponsored ?? false,
  listerId: s.lister,
  createdAt: daysFromNow(-(s.confirmedDaysAgo + 10)),
}));

export const slots: InspectionSlot[] = listings.flatMap((l, li) =>
  [1, 2, 3, 5].map((d, si) => ({
    id: `slot-${l.id}-${si}`,
    listingId: l.id,
    startsAt: daysFromNow(d, si % 2 === 0 ? 10 : 15),
    capacity: 4,
    booked: (li + si) % 5,
  })),
);

export const initialInspections: Inspection[] = [
  {
    id: "insp-1",
    slotId: `slot-${listings[0].id}-0`,
    listingId: listings[0].id,
    startsAt: daysFromNow(1, 10),
    status: "confirmed",
  },
];

export const initialApplications: Application[] = [
  {
    id: "app-1",
    listingId: listings[2].id,
    applicantName: "Ada Nwosu",
    occupation: "Product designer, Paystack",
    monthlyIncome: naira2kobo(650_000),
    guarantorName: "Chinedu Nwosu",
    status: "approved",
    createdAt: daysFromNow(-3),
  },
  {
    id: "app-2",
    listingId: listings[0].id,
    applicantName: "Seun Balogun",
    occupation: "Accountant, KPMG",
    monthlyIncome: naira2kobo(900_000),
    guarantorName: "Funke Balogun",
    status: "pending",
    createdAt: daysFromNow(-1),
  },
  {
    id: "app-3",
    listingId: listings[0].id,
    applicantName: "Ifeanyi Obi",
    occupation: "Software engineer, Moniepoint",
    monthlyIncome: naira2kobo(1_200_000),
    guarantorName: "Grace Obi",
    status: "pending",
    createdAt: daysFromNow(-2),
  },
];

export const initialPayments: Payment[] = [];

export const threads: Thread[] = [
  { id: "th-1", listingId: listings[0].id, withName: "Mr. Bello Adeyemi" },
  { id: "th-2", listingId: listings[2].id, withName: "Kemi Lawal" },
];

export const initialMessages: Message[] = [
  { id: "m1", threadId: "th-1", from: "me", body: "Good afternoon sir, is the flat still available?", sentAt: daysFromNow(-1, 13) },
  { id: "m2", threadId: "th-1", from: "them", body: "Yes it is. You can book any of the inspection slots on the listing.", sentAt: daysFromNow(-1, 14) },
  { id: "m3", threadId: "th-2", from: "them", body: "Your application has been approved. You can proceed to the agreement.", sentAt: daysFromNow(-2, 9) },
];

export const initialOnboarding: OnboardingState = {
  role: "owner",
  steps: [
    { id: "account", status: "approved" },
    { id: "identity", status: "not_started" },
    { id: "credentials", status: "not_started" },
    { id: "business", status: "not_started" },
    { id: "payout", status: "not_started" },
    { id: "terms", status: "not_started" },
  ],
};

export const initialMandates: Mandate[] = [
  {
    id: "md-1",
    propertyAddress: "12 Adelabu St, Surulere",
    ownerPhone: "0803 *** 4412",
    commissionPct: 10,
    status: "approved",
    createdAt: daysFromNow(-8),
  },
];

export const LAGOS_AREAS: string[] = Array.from(
  new Set([
    ...listings.map((l) => l.area),
    "Ikoyi",
    "Victoria Island",
    "Maryland",
    "Ogba",
    "Magodo",
    "Festac",
    "Ipaja",
    "Ojodu",
  ]),
).sort();
