"use client";

import { SlidersHorizontal, X } from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CATEGORIES = [
  "all", "Antibiotics", "Analgesics", "Antifungals", "Antivirals",
  "Cardiovascular", "Diabetes", "Dermatology", "Gastrointestinal",
  "Neurology", "Oncology", "Ophthalmology", "PPE",
  "Respiratory", "Vaccines", "Vitamins", "Equipment", "Other",
];

const STOCK_STATUSES = [
  { value: "all",      label: "All statuses" },
  { value: "ok",       label: "✅ In Stock"   },
  { value: "low",      label: "⚠️ Low Stock"  },
  { value: "critical", label: "🔴 Critical"   },
  { value: "out",      label: "⛔ Out of Stock"},
];

interface ProductFiltersProps {
  category: string;
  stockStatus: string;
  onCategoryChange: (v: string) => void;
  onStockStatusChange: (v: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

export function ProductFilters({
  category, stockStatus,
  onCategoryChange, onStockStatusChange,
  onReset, hasActiveFilters,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters:
      </div>

      {/* Category */}
      <div className="w-44">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="h-9 border-white/[0.06] bg-slate-800/50 text-xs">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stock Status */}
      <div className="w-40">
        <Select value={stockStatus} onValueChange={onStockStatusChange}>
          <SelectTrigger className="h-9 border-white/[0.06] bg-slate-800/50 text-xs">
            <SelectValue placeholder="Stock status" />
          </SelectTrigger>
          <SelectContent>
            {STOCK_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 gap-1.5 text-xs text-slate-500 hover:text-slate-200"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
