import type { Metadata } from "next";
import { Suspense } from "react";
import { LandlordDashboard } from "./landlord-dashboard";

export const metadata: Metadata = { title: "Landlord dashboard" };

export default function LandlordPage() {
  return (
    <Suspense>
      <LandlordDashboard />
    </Suspense>
  );
}
