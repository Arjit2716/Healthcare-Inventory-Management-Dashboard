"use client";

import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { StockMovementForm } from "./stock-movement-form";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockMovementModalProps {
  open: boolean;
  onClose: () => void;
  type: "STOCK_IN" | "STOCK_OUT";
  onSuccess: () => void;
}

export function StockMovementModal({ open, onClose, type, onSuccess }: StockMovementModalProps) {
  const isStockIn = type === "STOCK_IN";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className={cn(
          "px-6 pt-6 pb-4 border-b border-white/[0.06]",
          isStockIn ? "bg-emerald-500/5" : "bg-amber-500/5"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              isStockIn
                ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            )}>
              {isStockIn ? <ArrowDownToLine className="h-5 w-5" /> : <ArrowUpFromLine className="h-5 w-5" />}
            </div>
            <div>
              <DialogTitle>
                {isStockIn ? "Stock In" : "Stock Out"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-slate-400">
                {isStockIn
                  ? "Record new inventory received from suppliers."
                  : "Log inventory dispatched or consumed."
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <StockMovementForm
          type={type}
          onSuccess={() => { onSuccess(); onClose(); }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
