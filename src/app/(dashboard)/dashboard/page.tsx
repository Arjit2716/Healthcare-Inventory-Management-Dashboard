import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Package, AlertTriangle, Clock, Truck,
  TrendingUp, ShoppingCart, Activity,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { InventoryTrendChart } from "@/components/dashboard/inventory-trend-chart";
import { CategoryDistributionChart } from "@/components/dashboard/category-chart";
import { TopProductsChart } from "@/components/dashboard/top-products-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AlertsWidget } from "@/components/dashboard/alerts-widget";
import { LowStockTable } from "@/components/dashboard/low-stock-table";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const isAdmin = session.user.role === "ADMIN";

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-full space-y-6">

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Here&apos;s what&apos;s happening with your healthcare inventory today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date badge */}
          <div className="rounded-xl border border-white/[0.06] bg-slate-800/50 px-4 py-2 text-xs text-slate-400">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short", month: "short", day: "numeric", year: "numeric",
            })}
          </div>

          {/* Role badge */}
          <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
            isAdmin
              ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
              : "border-violet-500/20 bg-violet-500/10 text-violet-300"
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full animate-pulse-dot ${isAdmin ? "bg-blue-400" : "bg-violet-400"}`} />
            {session.user.role}
          </div>
        </div>
      </div>

      {/* ── KPI Stat Cards ──────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value="124"
          subtitle="Across 7 categories"
          icon={Package}
          variant="blue"
          trend={{ value: 8, label: "vs last month" }}
          progress={62}
          delay="delay-75"
        />
        <StatCard
          title="Low Stock"
          value="5"
          subtitle="Require reordering"
          icon={AlertTriangle}
          variant="amber"
          trend={{ value: -12, label: "vs last week" }}
          progress={10}
          delay="delay-150"
        />
        <StatCard
          title="Expiring Soon"
          value="3"
          subtitle="Within 30 days"
          icon={Clock}
          variant="red"
          trend={{ value: 2, label: "new this week" }}
          progress={6}
          delay="delay-225"
        />
        <StatCard
          title="Total Suppliers"
          value="4"
          subtitle="All active"
          icon={Truck}
          variant="emerald"
          trend={{ value: 0, label: "no change" }}
          progress={80}
          delay="delay-300"
        />
      </div>

      {/* ── Secondary KPI Row ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass-card rounded-2xl border border-white/[0.06] p-5 opacity-0 animate-fade-in-up delay-75">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Total Inventory Value</p>
              <p className="mt-2 text-2xl font-bold text-white">$48,320</p>
              <p className="mt-1 text-xs text-emerald-400">↑ $2,150 this month</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/[0.06] p-5 opacity-0 animate-fade-in-up delay-150">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Stock Movements</p>
              <p className="mt-2 text-2xl font-bold text-white">847</p>
              <p className="mt-1 text-xs text-blue-400">This month · ↑ 23%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15">
              <ShoppingCart className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl border border-white/[0.06] p-5 opacity-0 animate-fade-in-up delay-225">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">System Uptime</p>
              <p className="mt-2 text-2xl font-bold text-white">99.9%</p>
              <p className="mt-1 text-xs text-emerald-400">All services operational</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
              <Activity className="h-6 w-6 text-violet-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Trend chart — spans 2 cols */}
        <div className="lg:col-span-2 opacity-0 animate-fade-in-up delay-150">
          <InventoryTrendChart />
        </div>
        {/* Category donut */}
        <div className="opacity-0 animate-fade-in-up delay-225">
          <CategoryDistributionChart />
        </div>
      </div>

      {/* ── Middle Row: Top Products + Alerts ───────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="opacity-0 animate-fade-in-up delay-150">
          <TopProductsChart />
        </div>
        <div className="opacity-0 animate-fade-in-up delay-225">
          <AlertsWidget />
        </div>
      </div>

      {/* ── Bottom Row: Low Stock + Activity ────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 opacity-0 animate-fade-in-up delay-75">
          <LowStockTable />
        </div>
        <div className="opacity-0 animate-fade-in-up delay-150">
          <RecentActivity />
        </div>
      </div>

    </div>
  );
}
