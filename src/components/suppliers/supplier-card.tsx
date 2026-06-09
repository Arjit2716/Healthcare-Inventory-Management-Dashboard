"use client";

import { Building2, Mail, Phone, MapPin, Package, Pencil, Trash2, Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Supplier } from "@/types";

// Generate a deterministic gradient from supplier name
function getSupplierGradient(name: string) {
  const gradients = [
    "from-blue-600 to-violet-600",
    "from-emerald-600 to-cyan-600",
    "from-violet-600 to-pink-600",
    "from-orange-600 to-red-600",
    "from-cyan-600 to-blue-600",
    "from-pink-600 to-rose-600",
    "from-amber-600 to-orange-600",
    "from-teal-600 to-emerald-600",
  ];
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

interface SupplierCardProps {
  supplier: Supplier;
  onEdit:    (s: Supplier) => void;
  onDelete:  (s: Supplier) => void;
  onProfile: (s: Supplier) => void;
  canDelete: boolean;
}

export function SupplierCard({ supplier, onEdit, onDelete, onProfile, canDelete }: SupplierCardProps) {
  const gradient = getSupplierGradient(supplier.name);
  const products = supplier._count?.products ?? 0;

  return (
    <div className="glass-card group relative flex flex-col rounded-2xl border border-white/[0.06] p-5 transition-all duration-300 hover:border-blue-500/20 hover:shadow-xl hover:shadow-blue-500/5">

      {/* Top row: Avatar + actions */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-bold text-white shadow-lg",
            gradient
          )}>
            {getInitials(supplier.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{supplier.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{supplier.contactPerson}</p>
          </div>
        </div>

        {/* Products badge */}
        <div className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold",
          products > 0
            ? "bg-blue-500/15 text-blue-300"
            : "bg-slate-700/60 text-slate-500"
        )}>
          <Package className="h-3 w-3" />
          {products} {products === 1 ? "product" : "products"}
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-white/[0.04]" />

      {/* Contact details */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-600" />
          <a
            href={`mailto:${supplier.email}`}
            className="truncate hover:text-blue-400 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {supplier.email}
          </a>
        </div>
        <div className="flex items-center gap-2.5 text-xs text-slate-400">
          <Phone className="h-3.5 w-3.5 shrink-0 text-slate-600" />
          <a
            href={`tel:${supplier.phone}`}
            className="hover:text-blue-400 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {supplier.phone}
          </a>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-slate-400">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
          <span className="line-clamp-2">{supplier.address}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-white/[0.04]" />

      {/* Action row */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onProfile(supplier)}
          className="flex-1 h-8 gap-1.5 text-xs text-slate-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          <Eye className="h-3.5 w-3.5" />
          View profile
          <ChevronRight className="h-3 w-3 ml-auto" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(supplier)}
          className="h-8 w-8 text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"
          title="Edit supplier"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(supplier)}
            className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            title="Delete supplier"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// Skeleton card for loading state
export function SupplierCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl border border-white/[0.06] p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="skeleton h-12 w-12 rounded-2xl" />
          <div className="space-y-2">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        </div>
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="my-4 border-t border-white/[0.04]" />
      <div className="space-y-2.5">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-3/4 rounded" />
        <div className="skeleton h-3 w-5/6 rounded" />
      </div>
    </div>
  );
}
