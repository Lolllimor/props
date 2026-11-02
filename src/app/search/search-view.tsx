"use client";

import { ListIcon, MapIcon, SearchXIcon, SlidersHorizontalIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { AreaAutocomplete } from "@/components/area-autocomplete";
import { ListingCard, ListingCardSkeleton } from "@/components/listing-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerClose,
  DrawerFooter,
  DrawerHeader,
  DrawerPanel,
  DrawerPopup,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatNairaShort } from "@/lib/format";
import { useSearch } from "@/lib/queries";
import type { Listing, PropertyType, SearchFilters } from "@/lib/types";
import { cn } from "@/lib/utils";
import { defaultFilters, Filters, RENT_MAX } from "./filters";

const sorts: { label: string; value: SearchFilters["sort"] }[] = [
  { label: "Verified & freshest", value: "verified" },
  { label: "Price: low to high", value: "price-asc" },
  { label: "Price: high to low", value: "price-desc" },
  { label: "Newest", value: "newest" },
];

function filtersFromParams(params: URLSearchParams): SearchFilters {
  const type = params.get("type");
  const max = Number(params.get("max"));
  return {
    ...defaultFilters,
    q: params.get("q") ?? "",
    maxRent: max > 0 ? Math.min(max, RENT_MAX) : RENT_MAX,
    types: type ? [type as PropertyType] : [],
  };
}

export function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>(() => filtersFromParams(new URLSearchParams(params.toString())));
  const [view, setView] = useState<"list" | "map">("list");
  const { data, isPending, isFetching } = useSearch(filters);

  const activeCount = useMemo(
    () =>
      (filters.types.length ? 1 : 0) +
      (filters.minBedrooms ? 1 : 0) +
      (filters.minRent > 0 || filters.maxRent < RENT_MAX ? 1 : 0),
    [filters],
  );

  function setQuery(q: string) {
    setFilters((f) => ({ ...f, q }));
    const next = new URLSearchParams(params.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    router.replace(`/search?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="container flex flex-col gap-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <AreaAutocomplete value={filters.q} onValueChange={setQuery} />
        </div>
        <div className="flex items-center gap-2">
          <Drawer>
            <DrawerTrigger render={<Button variant="outline" className="lg:hidden" />}>
              <SlidersHorizontalIcon />
              Filters{activeCount ? ` (${activeCount})` : ""}
            </DrawerTrigger>
            <DrawerPopup showBar>
              <DrawerHeader>
                <DrawerTitle>Filters</DrawerTitle>
              </DrawerHeader>
              <DrawerPanel>
                <Filters value={filters} onChange={setFilters} />
              </DrawerPanel>
              <DrawerFooter>
                <DrawerClose render={<Button size="lg" className="w-full" />}>
                  Show {data?.length ?? 0} homes
                </DrawerClose>
              </DrawerFooter>
            </DrawerPopup>
          </Drawer>

          <Select
            items={sorts}
            value={filters.sort}
            onValueChange={(v) => setFilters((f) => ({ ...f, sort: (v ?? "verified") as SearchFilters["sort"] }))}
          >
            <SelectTrigger aria-label="Sort" className="min-w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              {sorts.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>

          <ToggleGroup
            variant="outline"
            value={[view]}
            onValueChange={(v) => v[0] && setView(v[0] as "list" | "map")}
            aria-label="View"
          >
            <ToggleGroupItem value="list" aria-label="List view">
              <ListIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="map" aria-label="Map view">
              <MapIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <Filters value={filters} onChange={setFilters} />
          </div>
        </aside>

        <section aria-busy={isFetching} className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm" aria-live="polite">
            {isPending ? "Searching…" : `${data?.length ?? 0} verified homes${filters.q ? ` in “${filters.q}”` : ""}`}
          </p>

          {isPending ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : !data?.length ? (
            <Empty className="rounded-2xl border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <SearchXIcon />
                </EmptyMedia>
                <EmptyTitle>No verified homes match yet</EmptyTitle>
                <EmptyDescription>
                  Try a nearby area or widen your budget. We only show listings confirmed available in the last 30 days.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" onClick={() => setFilters({ ...defaultFilters })}>
                  Clear search and filters
                </Button>
              </EmptyContent>
            </Empty>
          ) : view === "list" ? (
            <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", isFetching && "opacity-70")}>
              {data.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <MapView listings={data} />
          )}
        </section>
      </div>
    </div>
  );
}

/** Stand-in map. The real build swaps this for Google Maps with the same pins. */
function MapView({ listings }: { listings: Listing[] }) {
  const [selected, setSelected] = useState<string>(listings[0]?.id ?? "");
  const active = listings.find((l) => l.id === selected);

  return (
    <div className="flex flex-col gap-4">
      <Card className="relative aspect-[16/10] overflow-hidden bg-[linear-gradient(0deg,var(--color-muted)_1px,transparent_1px),linear-gradient(90deg,var(--color-muted)_1px,transparent_1px)] bg-[size:40px_40px] p-0">
        <div className="absolute inset-x-0 bottom-[18%] h-[22%] bg-info/10" aria-hidden />
        <span className="absolute bottom-[24%] left-4 text-info-foreground/70 text-xs" aria-hidden>
          Lagos Lagoon
        </span>
        {listings.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => setSelected(l.id)}
            aria-pressed={l.id === selected}
            aria-label={`${l.title}, ${formatNairaShort(l.pricing.annualRent)} per year`}
            className={cn(
              "absolute -translate-x-1/2 -translate-y-1/2 rounded-full border bg-background px-2 py-0.5 font-semibold text-xs shadow-sm transition-transform hover:scale-105",
              l.id === selected && "z-10 scale-110 border-primary bg-primary text-primary-foreground",
            )}
            style={{ left: `${l.mapX}%`, top: `${l.mapY}%` }}
          >
            {formatNairaShort(l.pricing.annualRent)}
          </button>
        ))}
      </Card>
      {active && <ListingCard listing={active} className="sm:max-w-sm" />}
    </div>
  );
}
