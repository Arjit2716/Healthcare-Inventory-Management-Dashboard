"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Truck, ClipboardList,
  BellRing, BarChart3, ShieldCheck, User, Activity,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  badge?: number;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Products",   href: "/products",   icon: Package },
  { label: "Suppliers",  href: "/suppliers",  icon: Truck,         adminOnly: true },
  { label: "Inventory",  href: "/inventory",  icon: ClipboardList },
  { label: "Alerts",     href: "/alerts",     icon: BellRing,      badge: 7 },
  { label: "Analytics",  href: "/analytics",  icon: BarChart3 },
];

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  blue:   { bg: "bg-blue-500/15",   text: "text-blue-300",   border: "border-blue-500/25",   glow: "glow-blue" },
  violet: { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/25", glow: "" },
};

interface SidebarProps { userRole: string; }

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";
  const roleColor = isAdmin ? COLOR_MAP.blue : COLOR_MAP.violet;

  return (
    <aside className="flex w-64 flex-col border-r border-white/[0.05] bg-slate-900/60 backdrop-blur-xl">
      {/* ── Brand ── */}
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.05] px-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/30">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-transparent" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-none">HealthInventory</p>
          <p className="mt-0.5 text-[10px] text-slate-500">v1.0 · Management System</p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-5 px-3">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Main Menu
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "nav-item-active text-blue-300"
                      : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-200"
                  )}
                >
                  <div className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
                    isActive
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-slate-800/60 text-slate-500 group-hover:bg-slate-700/60 group-hover:text-slate-300"
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <span className="flex-1">{item.label}</span>

                  {item.badge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.adminOnly && (
                    <span className="text-[9px] font-semibold uppercase tracking-wider text-blue-400/60">
                      Admin
                    </span>
                  )}
                  {isActive && !item.badge && !item.adminOnly && (
                    <ChevronRight className="h-3 w-3 text-blue-400/50" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* System section */}
        <p className="mb-2 mt-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          System
        </p>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="#"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-800/60 hover:text-slate-200"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800/60 text-slate-500 group-hover:bg-slate-700/60 group-hover:text-slate-300">
                <Activity className="h-3.5 w-3.5" />
              </div>
              Activity Logs
            </Link>
          </li>
        </ul>
      </nav>

      {/* ── Role badge ── */}
      <div className="border-t border-white/[0.05] p-4">
        <div className={cn(
          "flex items-center gap-3 rounded-xl border p-3 transition-all",
          roleColor.bg, roleColor.border
        )}>
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", roleColor.bg)}>
            {isAdmin
              ? <ShieldCheck className={cn("h-4 w-4", roleColor.text)} />
              : <User className={cn("h-4 w-4", roleColor.text)} />
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-semibold truncate", roleColor.text)}>
              {isAdmin ? "Administrator" : "Staff Member"}
            </p>
            <p className="text-[10px] text-slate-500">
              {isAdmin ? "Full system access" : "Limited access"}
            </p>
          </div>
          <div className={cn("h-2 w-2 shrink-0 rounded-full animate-pulse-dot",
            isAdmin ? "bg-blue-400" : "bg-violet-400"
          )} />
        </div>
      </div>
    </aside>
  );
}
