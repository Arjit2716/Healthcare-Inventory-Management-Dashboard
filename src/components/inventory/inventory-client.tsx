"use client";

import { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Search, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/use-inventory";
import { useAuth } from "@/hooks/use-auth";
import { InventoryStats } from "./inventory-stats";
import { InventoryTrendChart } from "./inventory-trend-chart";
import { InventoryLogsTable } from "./inventory-logs-table";
import { StockMovementModal } from "./stock-movement-modal";
import { Pagination } from "@/components/products/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InventoryClient() {
  const { can } = useAuth();
  
  const {
    logs, total, totalPages, page, search, type,
    summary, isLoading, error,
    setPage, setSearch, setType, refresh
  } = useInventory();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stockInOpen, setStockInOpen] = useState(false);
  const [stockOutOpen, setStockOutOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inventory Tracking</h1>
          <p className="mt-1 text-sm text-slate-400">
            Monitor stock movements, log receipts, and track dispatch
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
          {can("inventory:create") && (
            <>
              <Button 
                onClick={() => setStockInOpen(true)} 
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Stock In
              </Button>
              <Button 
                onClick={() => setStockOutOpen(true)} 
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                <ArrowUpFromLine className="h-4 w-4" />
                Stock Out
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ── Summary & Trend ──────────────────────────────── */}
      <InventoryStats summary={summary} isLoading={isLoading && !summary} />
      <InventoryTrendChart />

      {/* ── Logs Section ─────────────────────────────────── */}
      <div className="glass-card rounded-2xl border border-white/[0.06] p-6 space-y-4">
        
        <div className="flex items-center gap-2 mb-2">
          <FileText className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Movement Logs</h3>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by product, SKU, or notes..."
              className="w-full rounded-xl border border-white/[0.06] bg-slate-800/50 py-2 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={type} onValueChange={(val: any) => setType(val)}>
              <SelectTrigger className="w-[140px] bg-slate-800/50">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Movements</SelectItem>
                <SelectItem value="STOCK_IN">Stock In Only</SelectItem>
                <SelectItem value="STOCK_OUT">Stock Out Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <InventoryLogsTable logs={logs} isLoading={isLoading} />
        
        {/* Pagination */}
        {!isLoading && total > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={15}
            onPageChange={setPage}
          />
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────── */}
      <StockMovementModal
        open={stockInOpen}
        onClose={() => setStockInOpen(false)}
        type="STOCK_IN"
        onSuccess={refresh}
      />
      <StockMovementModal
        open={stockOutOpen}
        onClose={() => setStockOutOpen(false)}
        type="STOCK_OUT"
        onSuccess={refresh}
      />

    </div>
  );
}
