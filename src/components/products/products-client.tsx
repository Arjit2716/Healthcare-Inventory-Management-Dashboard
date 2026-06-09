"use client";

import { useState } from "react";
import { Plus, RefreshCw, Package, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductTable } from "@/components/products/product-table";
import { ProductModal } from "@/components/products/product-modal";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { ProductSearch } from "@/components/products/product-search";
import { ProductFilters } from "@/components/products/product-filters";
import { Pagination } from "@/components/products/pagination";
import { useProducts } from "@/hooks/use-products";
import { useAuth } from "@/hooks/use-auth";
import type { Product } from "@/types";

export function ProductsClient() {
  const { can, isLoading: authLoading } = useAuth();

  const {
    products, total, totalPages, page, isLoading, error,
    filters, setSearch, setCategory, setStockStatus,
    setPage, resetFilters, refresh,
  } = useProducts();

  const [addOpen, setAddOpen]           = useState(false);
  const [editProduct, setEditProduct]   = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.stockStatus !== "all" ||
    filters.search !== "";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Derived stats for the summary bar
  const lowStockCount  = products.filter((p) => p.stockStatus === "low" || p.stockStatus === "critical").length;
  const expiringCount  = products.filter((p) => p.daysUntilExpiry !== null && (p.daysUntilExpiry ?? 9999) <= 30).length;

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your healthcare inventory products
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
          {can("product:create") && (
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          )}
        </div>
      </div>

      {/* ── Summary Pills ────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-slate-800/40 px-4 py-2">
          <Package className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-semibold text-white">{total}</span>
          <span className="text-xs text-slate-500">total products</span>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">{lowStockCount}</span>
            <span className="text-xs text-amber-500/70">low / critical stock</span>
          </div>
        )}
        {expiringCount > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2">
            <Clock className="h-4 w-4 text-red-400" />
            <span className="text-sm font-semibold text-red-300">{expiringCount}</span>
            <span className="text-xs text-red-500/70">expiring ≤30 days</span>
          </div>
        )}
      </div>

      {/* ── Table Card ──────────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-white/[0.06] p-6 space-y-4">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="w-full max-w-sm">
            <ProductSearch
              value={filters.search}
              onChange={setSearch}
            />
          </div>

          {/* Filters */}
          <ProductFilters
            category={filters.category}
            stockStatus={filters.stockStatus}
            onCategoryChange={setCategory}
            onStockStatusChange={setStockStatus}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error} —{" "}
            <button onClick={handleRefresh} className="underline hover:no-underline">
              retry
            </button>
          </div>
        )}

        {/* Table */}
        <ProductTable
          products={products}
          isLoading={isLoading}
          onEdit={(p) => setEditProduct(p)}
          onDelete={(p) => setDeleteProduct(p)}
          canDelete={can("product:delete")}
        />

        {/* Pagination */}
        {!isLoading && total > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={filters.limit}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────── */}
      <ProductModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={refresh}
      />

      <ProductModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
        onSuccess={refresh}
      />

      <DeleteProductDialog
        open={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        product={deleteProduct}
        onSuccess={refresh}
      />
    </div>
  );
}
