"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AreaAutocomplete } from "@/components/area-autocomplete";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select";

const budgets = [
  { label: "Any budget", value: "any" },
  { label: "Up to ₦1m / year", value: "1000000" },
  { label: "Up to ₦2m / year", value: "2000000" },
  { label: "Up to ₦3.5m / year", value: "3500000" },
  { label: "Up to ₦6m / year", value: "6000000" },
  { label: "Up to ₦10m / year", value: "10000000" },
];

const types = [
  { label: "Any type", value: "any" },
  { label: "Self-contain", value: "self-contain" },
  { label: "Mini flat", value: "mini-flat" },
  { label: "Flat", value: "flat" },
  { label: "Duplex", value: "duplex" },
  { label: "Bungalow", value: "bungalow" },
];

export function HomeSearch() {
  const router = useRouter();
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("any");
  const [type, setType] = useState("any");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (area) params.set("q", area);
    if (budget !== "any") params.set("max", budget);
    if (type !== "any") params.set("type", type);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <Card className="p-3">
      <form onSubmit={submit} className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_auto]">
        <AreaAutocomplete value={area} onValueChange={setArea} />
        <Select items={budgets} value={budget} onValueChange={(v) => setBudget(String(v ?? "any"))}>
          <SelectTrigger aria-label="Budget">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {budgets.map((b) => (
              <SelectItem key={b.value} value={b.value}>
                {b.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <Select items={types} value={type} onValueChange={(v) => setType(String(v ?? "any"))}>
          <SelectTrigger aria-label="Property type">
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {types.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
        <Button type="submit" size="lg">
          <SearchIcon />
          Search
        </Button>
      </form>
    </Card>
  );
}
