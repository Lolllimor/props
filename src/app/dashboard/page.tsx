import type { Metadata } from "next";
import { Suspense } from "react";
import { TenantDashboard } from "./tenant-dashboard";

export const metadata: Metadata = { title: "My renting" };

export default function DashboardPage() {
  return (
    <Suspense>
      <TenantDashboard />
    </Suspense>
  );
}
