"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatNairaShort, propertyTypeLabels } from "@/lib/format";
import type { PropertyType, SearchFilters } from "@/lib/types";

export const RENT_MIN = 0;
export const RENT_MAX = 15_000_000;

export const defaultFilters: SearchFilters = {
  q: "",
  minRent: RENT_MIN,
  maxRent: RENT_MAX,
  types: [],
  minBedrooms: 0,
  sort: "verified",
};

const typeOptions = Object.entries(propertyTypeLabels) as [PropertyType, string][];

export function Filters({
  value,
  onChange,
}: {
  value: SearchFilters;
  onChange: (next: SearchFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label>Rent per year</Label>
          <span className="text-muted-foreground text-sm tabular-nums">
            {formatNairaShort(value.minRent * 100)} – {value.maxRent >= RENT_MAX ? "Any" : formatNairaShort(value.maxRent * 100)}
          </span>
        </div>
        <Slider
          min={RENT_MIN}
          max={RENT_MAX}
          step={100_000}
          value={[value.minRent, value.maxRent]}
          getAriaLabel={(i) => (i === 0 ? "Minimum rent" : "Maximum rent")}
          onValueChange={(v) => {
            if (typeof v === "number") return;
            onChange({ ...value, minRent: v[0] ?? RENT_MIN, maxRent: v[1] ?? RENT_MAX });
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <Label>Property type</Label>
        <ToggleGroup
          multiple
          className="w-full flex-wrap justify-start"
          value={value.types}
          onValueChange={(v) => onChange({ ...value, types: [...v] as PropertyType[] })}
        >
          {typeOptions.map(([key, label]) => (
            <ToggleGroupItem key={key} value={key} size="sm">
              {label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex flex-col gap-3">
        <Label>Bedrooms</Label>
        <ToggleGroup
          variant="outline"
          value={[String(value.minBedrooms)]}
          onValueChange={(v) => onChange({ ...value, minBedrooms: Number(v[0] ?? 0) })}
        >
          {["0", "1", "2", "3", "4"].map((n) => (
            <ToggleGroupItem key={n} value={n} size="sm" aria-label={n === "0" ? "Any bedrooms" : `${n} or more bedrooms`}>
              {n === "0" ? "Any" : `${n}+`}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Button variant="ghost" className="self-start" onClick={() => onChange({ ...defaultFilters, q: value.q, sort: value.sort })}>
        Reset filters
      </Button>
    </div>
  );
}
