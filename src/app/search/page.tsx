import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "./search-view";

export const metadata: Metadata = { title: "Find a home" };

export default function SearchPage() {
  return (
    <Suspense>
      <SearchView />
    </Suspense>
  );
}
