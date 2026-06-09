"use client";

import { useEffect, useState } from "react";
import {
  X, Building2, Mail, Phone, MapPin, Package,
  Calendar, Pencil, Trash2, AlertTriangle, Clock,
  TrendingUp, TrendingDown, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn }     from "@/lib/utils";
import type { Supplier } from "@/types";

// Inline mini product type for the linked products list
interface SupplierProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  minStockLevel: number;
  price: number;
  expiryDate: string | null;
  stockStatus: string;
  updatedAt: string;
}

const STOCK_CONFIG: Record<string, { label: string; cls: string; dotCls: string }> = {
  ok:       { label: "In Stock",  cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20", dotCls: "bg-emerald-400" },
  low:      { label: "Low",       cls: "bg-amber-500/15  text-amber-300  border-amber-500/20",     dotCls: "bg-amber-400" },
  critical: { label: "Critical",  cls: "bg-red-500/15    text-red-300    border-red-500/20",        dotCls: "bg-red-400 animate-pulse-dot" },
  out:      { label: "Out",       cls: "bg-slate-700/60  text-slate-400  border-slate-600/30",      dotCls: "bg-slate-500" },
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

interface SupplierProfileDrawerProps {
  supplier: Supplier | null;
  open: boolean;
  onClose: () => void;
  onEdit:   (s: Supplier) => void;
  onDelete: (s: Supplier) => void;
  canDelete: boolean;
}

export function SupplierProfileDrawer({
  supplier, open, onClose, onEdit, onDelete, canDelete,
}: SupplierProfileDrawerProps) {
  const [products, setProducts]   = useState<SupplierProduct[]>([]);
  const [loadingP, setLoadingP]   = useState(false);
  const [searchP,  setSearchP]    = useState("");

  // Fetch linked products whenever supplier changes
  useEffect(() => {
    if (!supplier?.id) { setProducts([]); return; }
    setLoadingP(true);
    fetch(`/api/suppliers/${supplier.id}/products`)
      .then((r) => r.json())
      .then((j) => setProducts(j.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingP(false));
  }, [supplier?.id]);

  // Reset search when closed
  useEffect(() => { if (!open) setSearchP(""); }, [open]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchP.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchP.toLowerCase())
  );

  const totalValue = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const lowCount   = products.filter((p) => p.stockStatus === "low" || p.stockStatus === "critical" || p.stockStatus === "out").length;

  if (!supplier) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div className={cn(
        "fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-white/[0.08] bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-out",
        open ? "translate-x-0" : "translate-x-full"
      )}>

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-white/[0.06] p-6">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg font-bold text-white shadow-lg shadow-blue-500/25">
              {getInitials(supplier.name)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{supplier.name}</h2>
              <p className="mt-0.5 text-sm text-slate-400">{supplier.contactPerson}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(supplier)}
              className="gap-2"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(supplier)}
                className="gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-slate-800/50 text-slate-400 transition-all hover:bg-slate-700/60 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Contact info section */}
          <div className="border-b border-white/[0.04] p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Contact Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Mail,     label: "Email",   value: supplier.email,   href: `mailto:${supplier.email}` },
                { icon: Phone,    label: "Phone",   value: supplier.phone,   href: `tel:${supplier.phone}` },
                { icon: Calendar, label: "Since",   value: formatDate(supplier.createdAt) },
                { icon: MapPin,   label: "Address", value: supplier.address },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="rounded-xl bg-slate-800/40 p-3">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    <Icon className="h-3 w-3" />
                    {label}
                  </div>
                  {href ? (
                    <a
                      href={href}
                      className="mt-1.5 block text-sm text-blue-400 transition-colors hover:text-blue-300"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">{value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Inventory stats section */}
          <div className="border-b border-white/[0.04] p-6">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
              Inventory Summary
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 p-4 text-center">
                <p className="text-2xl font-bold text-blue-300">{products.length}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">Total products</p>
              </div>
              <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 text-center">
                <p className="text-2xl font-bold text-emerald-300">
                  ${totalValue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Inventory value</p>
              </div>
              <div className={cn(
                "rounded-xl border p-4 text-center",
                lowCount > 0
                  ? "border-amber-500/15 bg-amber-500/5"
                  : "border-white/[0.04] bg-slate-800/30"
              )}>
                <p className={cn("text-2xl font-bold", lowCount > 0 ? "text-amber-300" : "text-slate-400")}>
                  {lowCount}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-500">Low / critical</p>
              </div>
            </div>
          </div>

          {/* Linked products section */}
          <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Linked Products ({products.length})
              </h3>
              {/* Inline search for products */}
              {products.length > 4 && (
                <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-slate-800/50 px-3 py-1.5">
                  <input
                    type="text"
                    value={searchP}
                    onChange={(e) => setSearchP(e.target.value)}
                    placeholder="Search products…"
                    className="w-36 bg-transparent text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {loadingP ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 py-12 text-center">
                <Package className="h-8 w-8 text-slate-700" />
                <p className="mt-3 text-sm text-slate-500">
                  {products.length === 0 ? "No products linked" : "No products match your search"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProducts.map((product) => {
                  const sc  = STOCK_CONFIG[product.stockStatus] ?? STOCK_CONFIG.ok;
                  const expiring =
                    product.expiryDate
                      ? Math.ceil((new Date(product.expiryDate).getTime() - Date.now()) / 86_400_000)
                      : null;

                  return (
                    <div
                      key={product.id}
                      className="group flex items-center gap-3 rounded-xl border border-white/[0.04] bg-slate-800/30 p-3 transition-all hover:border-white/[0.08] hover:bg-slate-800/50"
                    >
                      {/* Category colour dot */}
                      <div className={cn(
                        "h-2 w-2 shrink-0 rounded-full",
                        sc.dotCls
                      )} />

                      {/* Name + SKU */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">{product.name}</p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <code className="text-[10px] text-slate-600">{product.sku}</code>
                          <span className="text-[10px] text-slate-600">·</span>
                          <span className="text-[10px] text-slate-500">{product.category}</span>
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="text-right">
                        <p className={cn("text-sm font-semibold tabular-nums",
                          product.stockStatus === "critical" ? "text-red-400" :
                          product.stockStatus === "low"      ? "text-amber-400" :
                          product.stockStatus === "out"      ? "text-slate-500" :
                          "text-slate-300"
                        )}>
                          {product.quantity}
                        </p>
                        <p className="text-[10px] text-slate-600">{product.unit}</p>
                      </div>

                      {/* Price */}
                      <div className="w-16 text-right">
                        <p className="text-sm font-medium text-slate-400">
                          ${product.price.toFixed(2)}
                        </p>
                      </div>

                      {/* Stock badge */}
                      <span className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        sc.cls
                      )}>
                        {sc.label}
                      </span>

                      {/* Expiry */}
                      {expiring !== null && (
                        <div className="shrink-0 text-right">
                          {expiring < 0 ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-red-400">
                              <AlertTriangle className="h-3 w-3" /> Expired
                            </span>
                          ) : expiring <= 30 ? (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400">
                              <Clock className="h-3 w-3" /> {expiring}d
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
