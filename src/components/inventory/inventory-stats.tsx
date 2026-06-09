"use client";

import { ArrowDownToLine, ArrowUpFromLine, Activity, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventorySummary } from "@/hooks/use-inventory";

interface InventoryStatsProps {
  summary: InventorySummary | null;
  isLoading: boolean;
}

export function InventoryStats({ summary, isLoading }: InventoryStatsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl border border-white/[0.06] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="skeleton h-10 w-10 rounded-xl" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
            <div className="skeleton h-8 w-16 rounded mb-2" />
            <div className="skeleton h-3 w-32 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Stock In",
      value: summary.totalStockIn,
      subValue: `+${summary.weekStockIn} this week`,
      icon: ArrowDownToLine,
      color: "emerald",
    },
    {
      label: "Total Stock Out",
      value: summary.totalStockOut,
      subValue: `+${summary.weekStockOut} this week`,
      icon: ArrowUpFromLine,
      color: "amber",
    },
    {
      label: "Net Inventory Change",
      value: summary.totalStockIn - summary.totalStockOut,
      subValue: "Lifetime volume",
      icon: Layers,
      color: "blue",
    },
    {
      label: "Total Movements",
      value: summary.totalMovements,
      subValue: "Recorded transactions",
      icon: Activity,
      color: "violet",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const isPositive = typeof stat.value === 'number' && stat.value > 0;
        const displayValue = stat.label === "Net Inventory Change" 
          ? (stat.value > 0 ? `+${stat.value}` : stat.value)
          : stat.value;

        return (
          <div key={i} className="glass-card group relative flex flex-col rounded-2xl border border-white/[0.06] p-5 transition-all hover:border-white/[0.1] hover:shadow-xl hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                stat.color === "emerald" && "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25",
                stat.color === "amber"   && "bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25",
                stat.color === "blue"    && "bg-blue-500/15 text-blue-400 group-hover:bg-blue-500/25",
                stat.color === "violet"  && "bg-violet-500/15 text-violet-400 group-hover:bg-violet-500/25"
              )}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
            </div>
            
            <p className={cn(
              "text-3xl font-bold font-mono tracking-tight",
              stat.label === "Net Inventory Change" && isPositive && "text-emerald-400",
              stat.label === "Net Inventory Change" && !isPositive && "text-amber-400",
              stat.label !== "Net Inventory Change" && "text-white"
            )}>
              {displayValue.toLocaleString()}
            </p>
            
            <p className="mt-2 text-xs text-slate-500">
              {stat.subValue}
            </p>
          </div>
        );
      })}
    </div>
  );
}
