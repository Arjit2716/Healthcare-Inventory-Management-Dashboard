import { ArrowUpCircle, ArrowDownCircle, AlertTriangle, UserPlus, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITIES = [
  {
    id: 1, type: "stock_in",
    product: "Paracetamol 1000mg", quantity: 500, unit: "tablets",
    user: "Dr. Sarah Johnson", role: "Admin", time: "2 min ago",
  },
  {
    id: 2, type: "stock_out",
    product: "Amoxicillin 500mg", quantity: 192, unit: "capsules",
    user: "Mike Thompson", role: "Staff", time: "15 min ago",
  },
  {
    id: 3, type: "alert",
    product: "Influenza Vaccine", quantity: 0, unit: "",
    user: "System", role: "Auto", time: "1 hr ago",
    note: "Expires in 10 days — critical",
  },
  {
    id: 4, type: "stock_in",
    product: "Surgical Gloves Med", quantity: 200, unit: "pairs",
    user: "Dr. Sarah Johnson", role: "Admin", time: "3 hr ago",
  },
  {
    id: 5, type: "stock_out",
    product: "Insulin NPH 10ml", quantity: 30, unit: "vials",
    user: "Mike Thompson", role: "Staff", time: "5 hr ago",
  },
  {
    id: 6, type: "new_supplier",
    product: "BioMedical Corp", quantity: 0, unit: "",
    user: "Dr. Sarah Johnson", role: "Admin", time: "1 day ago",
    note: "New supplier onboarded",
  },
];

const TYPE_CONFIG = {
  stock_in: {
    icon: ArrowUpCircle,
    iconCls: "text-emerald-400",
    bg: "bg-emerald-500/10",
    label: "Stock In",
    labelCls: "text-emerald-300",
  },
  stock_out: {
    icon: ArrowDownCircle,
    iconCls: "text-red-400",
    bg: "bg-red-500/10",
    label: "Stock Out",
    labelCls: "text-red-300",
  },
  alert: {
    icon: AlertTriangle,
    iconCls: "text-amber-400",
    bg: "bg-amber-500/10",
    label: "Alert",
    labelCls: "text-amber-300",
  },
  new_supplier: {
    icon: UserPlus,
    iconCls: "text-blue-400",
    bg: "bg-blue-500/10",
    label: "New Supplier",
    labelCls: "text-blue-300",
  },
};

export function RecentActivity() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Recent Activity</h3>
          <p className="mt-0.5 text-xs text-slate-500">Last 24 hours of movements</p>
        </div>
        <button className="rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-slate-700/50 hover:text-slate-200">
          View all
        </button>
      </div>

      {/* Activity list */}
      <div className="space-y-1">
        {ACTIVITIES.map((activity, i) => {
          const cfg = TYPE_CONFIG[activity.type as keyof typeof TYPE_CONFIG];
          const Icon = cfg.icon;

          return (
            <div
              key={activity.id}
              className="group flex items-start gap-3 rounded-xl p-3 transition-all hover:bg-slate-800/40"
            >
              {/* Icon */}
              <div className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", cfg.bg)}>
                <Icon className={cn("h-4 w-4", cfg.iconCls)} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold", cfg.bg, cfg.labelCls)}>
                      {cfg.label}
                    </span>
                    <p className="truncate text-sm font-medium text-slate-200">
                      {activity.product}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] text-slate-600">{activity.time}</span>
                </div>

                <div className="mt-0.5 flex items-center gap-2">
                  {activity.quantity > 0 && (
                    <span className="text-xs text-slate-500">
                      {activity.quantity} {activity.unit}
                    </span>
                  )}
                  {activity.note && (
                    <span className="text-xs text-slate-500">{activity.note}</span>
                  )}
                  <span className="text-xs text-slate-600">·</span>
                  <span className="text-xs text-slate-500">
                    {activity.user}{" "}
                    <span className="text-slate-600">({activity.role})</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
