"use client";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { SupplierForm } from "./supplier-form";
import { Building2, Pencil } from "lucide-react";
import type { Supplier } from "@/types";

interface SupplierModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
  onSuccess: () => void;
}

export function SupplierModal({ open, onClose, supplier, onSuccess }: SupplierModalProps) {
  const isEditing = !!supplier;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isEditing
                ? "bg-violet-500/20 text-violet-400"
                : "bg-emerald-500/20 text-emerald-400"
            }`}>
              {isEditing ? <Pencil className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle>
                {isEditing ? "Edit supplier" : "Add new supplier"}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEditing
                  ? `Update contact details for ${supplier.name}`
                  : "Register a new medical supplier in the system."
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <SupplierForm
          supplier={supplier}
          onSuccess={() => { onSuccess(); onClose(); }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
