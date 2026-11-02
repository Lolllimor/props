import { BadgeCheckIcon, CalendarCheckIcon, ReceiptTextIcon } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { FeaturedListings } from "./_home/featured-listings";
import { HomeSearch } from "./_home/home-search";

const promises = [
  {
    icon: BadgeCheckIcon,
    title: "Every listing verified",
    body: "Owner ID, proof of ownership and real photos are checked before a listing goes live. Unconfirmed listings expire after 30 days.",
  },
  {
    icon: ReceiptTextIcon,
    title: "Every fee upfront",
    body: "Rent, caution, agency, legal and service charge shown before you call anyone. Agency fees capped at 10%.",
  },
  {
    icon: CalendarCheckIcon,
    title: "Free inspections",
    body: "Book a slot in the app. No registration fee, no viewing fee, no “drink”. Ever.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="border-b bg-gradient-to-b from-primary/8 to-transparent">
        <div className="container flex flex-col gap-8 py-14 sm:py-20">
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="font-medium text-primary text-sm">Now in {BRAND.city}</p>
            <h1 className="text-balance font-semibold text-4xl tracking-tight sm:text-5xl">
              Find a real home without paying fake agents.
            </h1>
            <p className="text-balance text-lg text-muted-foreground">{BRAND.tagline}</p>
          </div>
          <HomeSearch />
        </div>
      </section>

      <section className="container grid gap-6 py-12 md:grid-cols-3">
        {promises.map((p) => (
          <div key={p.title} className="flex flex-col gap-2">
            <p.icon className="size-6 text-primary" />
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-muted-foreground text-sm">{p.body}</p>
          </div>
        ))}
      </section>

      <section className="container flex flex-col gap-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-semibold text-2xl">Freshly confirmed homes</h2>
            <p className="text-muted-foreground text-sm">Availability re-confirmed by the owner or agent this week.</p>
          </div>
        </div>
        <FeaturedListings />
      </section>
    </>
  );
}
