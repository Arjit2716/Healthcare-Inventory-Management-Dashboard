"use client";

import { Pencil, Trash2, Clock, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

// ─── Stock Status Badge ─────────────────────────────────────

function StockBadge({ status }: { status?: string }) {
  const config = {
    ok:       { label: "In Stock",   cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20" },
    low:      { label: "Low Stock",  cls: "bg-amber-500/15  text-amber-300  border-amber-500/20"  },
    critical: { label: "Critical",   cls: "bg-red-500/15    text-red-300    border-red-500/20"    },
    out:      { label: "Out",        cls: "bg-slate-500/15  text-slate-300  border-slate-500/20"  },
  }[status ?? "ok"] ?? { label: "Unknown", cls: "bg-slate-500/15 text-slate-400 border-slate-500/20" };

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold", config.cls)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", {
        "bg-emerald-400": status === "ok",
        "bg-amber-400":   status === "low",
        "bg-red-400 animate-pulse-dot": status === "critical",
        "bg-slate-500":   status === "out",
      })} />
      {config.label}
    </span>
  );
}

// ─── Expiry Badge ───────────────────────────────────────────

function ExpiryBadge({ days }: { days?: number | null }) {
  if (days === null || days === undefined) {
    return <span className="text-xs text-slate-600">—</span>;
  }
  if (days < 0) return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-400">
      <AlertTriangle className="h-3 w-3" /> Expired
    </span>
  );
  if (days <= 30) return (
    <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
      <Clock className="h-3 w-3" /> {days}d left
    </span>
  );
  return <span className="text-xs text-slate-500">{days}d</span>;
}

// ─── Skeleton Row ────────────────────────────────────────────

function SkeletonRow() {
  return (
    <TableRow>
      {[...Array(8)].map((_, i) => (
        <TableCell key={i}>
          <div className="skeleton h-4 rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
        </TableCell>
      ))}
    </TableRow>
  );
}

// ─── Main Table ──────────────────────────────────────────────

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
  canDelete: boolean;
}

export function ProductTable({
  products, isLoading, onEdit, onDelete, canDelete,
}: ProductTableProps) {
  if (!isLoading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/60">
          <AlertTriangle className="h-7 w-7 text-slate-600" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-400">No products found</p>
        <p className="mt-1 text-xs text-slate-600">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06]">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[220px]">Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expiry</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="w-[90px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
            : products.map((p) => (
                <TableRow key={p.id}>
                  {/* Product name + description */}
                  <TableCell>
                    <div className="max-w-[210px]">
                      <p className="truncate font-medium text-slate-200">{p.name}</p>
                      {p.description && (
                        <p className="mt-0.5 truncate text-[10px] text-slate-600">{p.description}</p>
                      )}
                    </div>
                  </TableCell>

                  {/* SKU */}
                  <TableCell>
                    <code className="rounded bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-400">
                      {p.sku}
                    </code>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <span className="rounded-full bg-slate-800/60 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                      {p.category}
                    </span>
                  </TableCell>

                  {/* Quantity */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "font-semibold tabular-nums",
                        p.stockStatus === "out"      ? "text-slate-500" :
                        p.stockStatus === "critical" ? "text-red-400" :
                        p.stockStatus === "low"      ? "text-amber-400" :
                        "text-slate-200"
                      )}>
                        {p.quantity}
                      </span>
                      <span className="text-[9px] text-slate-600">{p.unit}</span>
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right font-medium tabular-nums text-slate-300">
                    ${Number(p.price).toFixed(2)}
                  </TableCell>

                  {/* Stock Status */}
                  <TableCell>
                    <StockBadge status={p.stockStatus} />
                  </TableCell>

                  {/* Expiry */}
                  <TableCell>
                    <ExpiryBadge days={p.daysUntilExpiry} />
                  </TableCell>

                  {/* Supplier */}
                  <TableCell>
                    <p className="max-w-[100px] truncate text-xs text-slate-500">
                      {p.supplier?.name ?? "—"}
                    </p>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10"
                        onClick={() => onEdit(p)}
                        title="Edit product"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                          onClick={() => onDelete(p)}
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
          }
        </TableBody>
      </Table>
    </div>
  );
}
