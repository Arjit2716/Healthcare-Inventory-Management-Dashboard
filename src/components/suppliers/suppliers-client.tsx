"use client";

import { useState } from "react";
import {
  Plus, RefreshCw, Building2, Search, X,
  LayoutGrid, List, AlertTriangle,
} from "lucide-react";
import { Button }                  from "@/components/ui/button";
import { SupplierCard, SupplierCardSkeleton } from "./supplier-card";
import { SupplierModal }           from "./supplier-modal";
import { DeleteSupplierDialog }    from "./delete-supplier-dialog";
import { SupplierProfileDrawer }   from "./supplier-profile-drawer";
import { Pagination }              from "@/components/products/pagination";
import { useSupplierList }         from "@/hooks/use-supplier-list";
import { useAuth }                 from "@/hooks/use-auth";
import type { Supplier }           from "@/types";
import { cn }                      from "@/lib/utils";

type ViewMode = "grid" | "list";

export function SuppliersClient() {
  const { can } = useAuth();

  const {
    suppliers, total, totalPages, page, search, isLoading, error,
    setSearch, setPage, refresh,
  } = useSupplierList();

  const [viewMode, setViewMode]       = useState<ViewMode>("grid");
  const [addOpen, setAddOpen]         = useState(false);
  const [editSupplier, setEditSupplier]     = useState<Supplier | null>(null);
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);
  const [profileSupplier, setProfileSupplier] = useState<Supplier | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const openProfile = (s: Supplier) => {
    setProfileSupplier(s);
    setProfileOpen(true);
  };

  const closeProfile = () => setProfileOpen(false);

  // When editing from drawer — close drawer, open modal
  const handleEditFromDrawer = (s: Supplier) => {
    closeProfile();
    setTimeout(() => setEditSupplier(s), 200);
  };

  // When deleting from drawer
  const handleDeleteFromDrawer = (s: Supplier) => {
    closeProfile();
    setTimeout(() => setDeleteSupplier(s), 200);
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Suppliers</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your medical supply partners and vendor relationships
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {can("supplier:create") && (
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add supplier
            </Button>
          )}
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-slate-800/40 px-4 py-2">
          <Building2 className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-semibold text-white">{total}</span>
          <span className="text-xs text-slate-500">total suppliers</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-slate-800/40 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
          <span className="text-xs text-slate-400">All active</span>
        </div>
      </div>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          {/* Search */}
          <div className={cn(
            "flex items-center gap-2.5 rounded-xl border px-3 py-2 transition-all duration-200 w-full max-w-sm",
            search
              ? "border-blue-500/40 bg-blue-500/5"
              : "border-white/[0.06] bg-slate-800/50 hover:border-white/10"
          )}>
            <Search className={cn("h-4 w-4 shrink-0 transition-colors", search ? "text-blue-400" : "text-slate-500")} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, contact…"
              className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-slate-200 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-white/[0.06] bg-slate-800/50 p-1">
            {(["grid", "list"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  viewMode === mode
                    ? "bg-blue-600 text-white shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {mode === "grid" ? <LayoutGrid className="h-3.5 w-3.5" /> : <List className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error} —{" "}
          <button onClick={handleRefresh} className="underline hover:no-underline">retry</button>
        </div>
      )}

      {/* ── Grid / List ─────────────────────────────────── */}
      {viewMode === "grid" ? (
        <>
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => <SupplierCardSkeleton key={i} />)}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-24 text-center">
              <Building2 className="h-12 w-12 text-slate-700" />
              <p className="mt-4 text-sm font-medium text-slate-400">No suppliers found</p>
              <p className="mt-1 text-xs text-slate-600">
                {search ? "Try a different search term." : "Add your first supplier to get started."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suppliers.map((s) => (
                <SupplierCard
                  key={s.id}
                  supplier={s}
                  onEdit={setEditSupplier}
                  onDelete={setDeleteSupplier}
                  onProfile={openProfile}
                  canDelete={can("supplier:delete")}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        /* List view — compact table-style */
        <div className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-14 rounded-xl" />
              ))}
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Building2 className="h-8 w-8 text-slate-700" />
              <p className="mt-3 text-sm text-slate-500">No suppliers found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-white/[0.05]">
                <tr>
                  {["Supplier", "Contact", "Email", "Phone", "Products", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {suppliers.map((s) => (
                  <tr key={s.id} className="group transition-colors hover:bg-slate-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-[10px] font-bold text-white">
                          {getInitials(s.name)}
                        </div>
                        <span className="font-medium text-slate-200">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.contactPerson}</td>
                    <td className="px-4 py-3">
                      <a href={`mailto:${s.email}`} className="text-blue-400 hover:text-blue-300 transition-colors">
                        {s.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{s.phone}</td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                        (s._count?.products ?? 0) > 0
                          ? "bg-blue-500/15 text-blue-300"
                          : "bg-slate-700/60 text-slate-500"
                      )}>
                        {s._count?.products ?? 0} items
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"
                          onClick={() => openProfile(s)}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"
                          onClick={() => setEditSupplier(s)}
                        >
                          <Plus className="h-3.5 w-3.5 rotate-45" />
                        </Button>
                        {can("supplier:delete") && (
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                            onClick={() => setDeleteSupplier(s)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────── */}
      {!isLoading && total > 12 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={12}
          onPageChange={setPage}
        />
      )}

      {/* ── Modals ─────────────────────────────────────── */}
      <SupplierModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={refresh}
      />
      <SupplierModal
        open={!!editSupplier}
        onClose={() => setEditSupplier(null)}
        supplier={editSupplier}
        onSuccess={refresh}
      />
      <DeleteSupplierDialog
        open={!!deleteSupplier}
        onClose={() => setDeleteSupplier(null)}
        supplier={deleteSupplier}
        onSuccess={refresh}
      />

      {/* ── Profile Drawer ─────────────────────────────── */}
      <SupplierProfileDrawer
        supplier={profileSupplier}
        open={profileOpen}
        onClose={closeProfile}
        onEdit={handleEditFromDrawer}
        onDelete={handleDeleteFromDrawer}
        canDelete={can("supplier:delete")}
      />
    </div>
  );
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}
