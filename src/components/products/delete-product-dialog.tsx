"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Product } from "@/types";

interface DeleteProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess: () => void;
}

export function DeleteProductDialog({
  open, onClose, product, onSuccess,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json();
        toast.error("Delete failed", json.error ?? "Could not delete product.");
        return;
      }
      toast.success("Product deleted", `${product.name} has been removed from inventory.`);
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
              <DialogTitle>Delete product</DialogTitle>
              <DialogDescription className="mt-0.5">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 pb-2">
          <div className="rounded-xl border border-red-500/15 bg-red-500/5 p-4">
            <p className="text-sm text-slate-300">
              You are about to permanently delete{" "}
              <span className="font-semibold text-white">{product?.name}</span>{" "}
              <span className="text-slate-500">({product?.sku})</span>.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              All associated inventory logs and alerts will also be deleted due to cascade rules.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="min-w-[120px]"
          >
            {isDeleting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Deleting…</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Delete product</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
