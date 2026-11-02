"use client";

import { MapPinIcon } from "lucide-react";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "@/components/ui/autocomplete";
import { LAGOS_AREAS } from "@/lib/mock-data";

export function AreaAutocomplete({
  value,
  onValueChange,
  className,
}: {
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
}) {
  return (
    <Autocomplete items={LAGOS_AREAS} value={value} onValueChange={(v) => onValueChange(String(v ?? ""))}>
      <AutocompleteInput
        aria-label="Area"
        placeholder="Area, e.g. Yaba, Gbagada, Lekki"
        className={className}
        startAddon={<MapPinIcon />}
      />
      <AutocompletePopup>
        <AutocompleteEmpty>No matching area. Try a nearby one.</AutocompleteEmpty>
        <AutocompleteList>
          {(area: string) => (
            <AutocompleteItem key={area} value={area}>
              {area}
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompletePopup>
    </Autocomplete>
  );
}
