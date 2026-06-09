"use client";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/product-form";
import type { Product } from "@/types";
import { Plus, Pencil } from "lucide-react";

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductModal({ open, onClose, product, onSuccess }: ProductModalProps) {
  const isEditing = !!product;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 pb-0 border-b-0">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isEditing
                ? "bg-violet-500/20 text-violet-400"
                : "bg-blue-500/20 text-blue-400"
            }`}>
              {isEditing ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Edit product" : "Add new product"}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEditing
                  ? `Updating details for ${product.name}`
                  : "Fill in the product details below to add it to inventory."
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ProductForm
          product={product}
          onSuccess={() => { onSuccess(); onClose(); }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
