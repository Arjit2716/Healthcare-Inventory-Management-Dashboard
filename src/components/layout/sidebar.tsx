"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, Truck, ClipboardList,
  BellRing, BarChart3, ShieldCheck, User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Products",   href: "/products",   icon: Package },
  { label: "Suppliers",  href: "/suppliers",  icon: Truck,         adminOnly: true },
  { label: "Inventory",  href: "/inventory",  icon: ClipboardList },
  { label: "Alerts",     href: "/alerts",     icon: BellRing },
  { label: "Analytics",  href: "/analytics",  icon: BarChart3 },
];

interface SidebarProps {
  userRole: string;
}

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === "ADMIN";

  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900/50">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-white">HealthInventory</p>
          <p className="text-[10px] text-slate-500">Inventory System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    isActive
                      ? "nav-item-active text-blue-300"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-blue-400" : "")} />
                  {item.label}
                  {item.adminOnly && (
                    <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-blue-400/70">
                      Admin
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Role badge at bottom */}
      <div className="border-t border-slate-800 p-4">
        <div className={cn(
          "flex items-center gap-2.5 rounded-xl border p-3",
          isAdmin
            ? "border-blue-500/20 bg-blue-500/5"
            : "border-violet-500/20 bg-violet-500/5"
        )}>
          <div className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            isAdmin ? "bg-blue-500/20" : "bg-violet-500/20"
          )}>
            {isAdmin
              ? <ShieldCheck className="h-4 w-4 text-blue-400" />
              : <User className="h-4 w-4 text-violet-400" />
            }
          </div>
          <div>
            <p className={cn("text-xs font-semibold", isAdmin ? "text-blue-300" : "text-violet-300")}>
              {isAdmin ? "Administrator" : "Staff Member"}
            </p>
            <p className="text-[10px] text-slate-500">
              {isAdmin ? "Full access" : "Limited access"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
