import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ALERTS = [
  {
    id: 1, type: "EXPIRY", severity: "CRITICAL",
    product: "Influenza Vaccine Vials",
    message: "Expires in 10 days",
    sku: "VAC-FLU-INF",
  },
  {
    id: 2, type: "LOW_STOCK", severity: "CRITICAL",
    product: "Amoxicillin 500mg Capsules",
    message: "8 units remaining (min: 50)",
    sku: "MED-AMX-500",
  },
  {
    id: 3, type: "LOW_STOCK", severity: "CRITICAL",
    product: "Ibuprofen 400mg Tablets",
    message: "5 units remaining (min: 75)",
    sku: "MED-IBU-400",
  },
  {
    id: 4, type: "LOW_STOCK", severity: "HIGH",
    product: "Surgical Gloves Medium",
    message: "45 pairs remaining (min: 100)",
    sku: "SUP-GLV-MED",
  },
  {
    id: 5, type: "EXPIRY", severity: "HIGH",
    product: "Amoxicillin 500mg",
    message: "Expires in 15 days",
    sku: "MED-AMX-500",
  },
];

const SEVERITY_CONFIG = {
  CRITICAL: {
    dot:     "bg-red-500 animate-pulse-dot",
    badge:   "bg-red-500/15 text-red-300 border border-red-500/20",
    hover:   "hover:border-red-500/20",
    border:  "border-red-500/10",
  },
  HIGH: {
    dot:     "bg-amber-500",
    badge:   "bg-amber-500/15 text-amber-300 border border-amber-500/20",
    hover:   "hover:border-amber-500/20",
    border:  "border-amber-500/10",
  },
  MEDIUM: {
    dot:     "bg-blue-500",
    badge:   "bg-blue-500/15 text-blue-300 border border-blue-500/20",
    hover:   "hover:border-blue-500/20",
    border:  "border-blue-500/10",
  },
};

const TYPE_LABEL = { LOW_STOCK: "Low Stock", EXPIRY: "Expiry" };
const TYPE_ICON  = { LOW_STOCK: AlertTriangle, EXPIRY: Clock };

export function AlertsWidget() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/15">
            <AlertTriangle className="h-4 w-4 text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Active Alerts</h3>
            <p className="text-xs text-slate-500">
              <span className="text-red-400 font-medium">3 critical</span> · 2 high priority
            </p>
          </div>
        </div>
        <button className="rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-200">
          View all
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {ALERTS.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG];
          const TypeIcon = TYPE_ICON[alert.type as keyof typeof TYPE_ICON];

          return (
            <div
              key={alert.id}
              className={cn(
                "group flex items-center gap-3 rounded-xl border bg-slate-800/20 p-3 transition-all",
                cfg.border, cfg.hover, "cursor-pointer"
              )}
            >
              {/* Dot + icon */}
              <div className="flex items-center gap-2.5">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", cfg.dot)} />
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800/80">
                  <TypeIcon className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-200">{alert.product}</p>
                  <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.badge)}>
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  {TYPE_LABEL[alert.type as keyof typeof TYPE_LABEL]} · {alert.message}
                </p>
              </div>

              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
