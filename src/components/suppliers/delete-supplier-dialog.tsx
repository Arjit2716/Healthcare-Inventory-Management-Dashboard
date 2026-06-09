"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, Trash2, PackageX } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast }  from "@/hooks/use-toast";
import type { Supplier } from "@/types";

interface DeleteSupplierDialogProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onSuccess: () => void;
}

export function DeleteSupplierDialog({
  open, onClose, supplier, onSuccess,
}: DeleteSupplierDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const productCount = supplier?._count?.products ?? 0;
  const hasProducts  = productCount > 0;

  const handleDelete = async () => {
    if (!supplier) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/suppliers/${supplier.id}`, { method: "DELETE" });
      const json = await res.json();

      if (!res.ok) {
        // 409 = has linked products
        if (res.status === 409) {
          toast.error(
            "Cannot delete supplier",
            `${supplier.name} has ${productCount} linked product${productCount > 1 ? "s" : ""}. Reassign or delete them first.`
          );
        } else {
          toast.error("Delete failed", json.error ?? "Please try again.");
        }
        return;
      }
      toast.success("Supplier deleted", `${supplier.name} has been removed.`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Network error", "Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <DialogTitle>Delete supplier</DialogTitle>
              <DialogDescription>This action cannot be undone.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-2 space-y-3">
          <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
            <p className="text-sm text-slate-300">
              You are about to permanently delete{" "}
              <span className="font-semibold text-white">{supplier?.name}</span>.
            </p>
          </div>

          {/* Warning if has linked products */}
          {hasProducts && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <PackageX className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-amber-300">
                  {productCount} linked product{productCount > 1 ? "s" : ""}
                </p>
                <p className="mt-0.5 text-xs text-amber-500/80">
                  PostgreSQL RESTRICT policy prevents deletion. Please reassign or delete
                  all products from this supplier first.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || hasProducts}
            className="min-w-[130px]"
            title={hasProducts ? "Reassign products before deleting" : undefined}
          >
            {isDeleting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Delete supplier</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
