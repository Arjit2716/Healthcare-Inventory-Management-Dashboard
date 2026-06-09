"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowDownToLine, ArrowUpFromLine, Search, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { stockMovementSchema, type StockMovementInput } from "@/validations/inventory.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useProducts } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

interface StockMovementFormProps {
  type: "STOCK_IN" | "STOCK_OUT";
  onSuccess: () => void;
  onCancel: () => void;
}

export function StockMovementForm({ type, onSuccess, onCancel }: StockMovementFormProps) {
  // We use useProducts hook to fetch products for the selection
  const { products, search, setSearch } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<StockMovementInput>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: {
      type,
      productId: "",
      quantity: 1,
      notes: "",
    },
  });

  const qty = watch("quantity");
  const selectedProductDetails = products.find(p => p.id === selectedProduct);

  const handleSelectProduct = (id: string) => {
    setSelectedProduct(id);
    setValue("productId", id, { shouldValidate: true });
    setSearch("");
  };

  const onSubmit = async (data: StockMovementInput) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 422) {
          toast.error("Validation failed", json.error);
        } else {
          toast.error("Failed to log movement", json.error ?? "Please check inputs.");
        }
        return;
      }

      toast.success(
        type === "STOCK_IN" ? "Stock added" : "Stock removed",
        `Successfully logged ${data.quantity} units.`
      );
      onSuccess();
    } catch {
      toast.error("Network error", "Please try again.");
    }
  };

  const isStockIn = type === "STOCK_IN";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        
        {/* Product Selection */}
        <div className="space-y-3">
          <Label>
            Select Product *
          </Label>
          
          {selectedProductDetails ? (
            <div className="flex items-center justify-between rounded-xl border border-blue-500/30 bg-blue-500/10 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">{selectedProductDetails.name}</p>
                  <p className="text-xs text-slate-400">
                    SKU: {selectedProductDetails.sku} • In stock: <span className="font-semibold text-white">{selectedProductDetails.quantity}</span>
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
                onClick={() => {
                  setSelectedProduct(null);
                  setValue("productId", "", { shouldValidate: true });
                }}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search products by name or SKU..."
                  className="w-full rounded-xl border border-white/[0.06] bg-slate-800/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {search && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-slate-800/80 p-1 shadow-xl">
                  {products.length === 0 ? (
                    <p className="p-3 text-center text-sm text-slate-400">No products found</p>
                  ) : (
                    products.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg p-2 text-left hover:bg-slate-700/50"
                        onClick={() => handleSelectProduct(p.id)}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-500">{p.sku}</p>
                        </div>
                        <span className="text-xs text-slate-400">{p.quantity} in stock</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          {errors.productId && <p className="text-xs text-red-400">{errors.productId.message}</p>}
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label htmlFor="quantity">Quantity *</Label>
          <div className="relative">
            <Input
              id="quantity"
              type="number"
              min={1}
              error={errors.quantity?.message}
              className="pl-9"
              {...register("quantity")}
            />
            {isStockIn ? (
              <ArrowDownToLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
            ) : (
              <ArrowUpFromLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-500" />
            )}
          </div>
          {/* Helper text showing new balance */}
          {selectedProductDetails && qty > 0 && (
            <p className="text-xs text-slate-400">
              New stock balance will be:{" "}
              <strong className={cn(
                "text-white",
                !isStockIn && selectedProductDetails.quantity - qty < 0 ? "text-red-400" : ""
              )}>
                {isStockIn 
                  ? selectedProductDetails.quantity + Number(qty)
                  : selectedProductDetails.quantity - Number(qty)
                } {selectedProductDetails.unit}
              </strong>
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder={isStockIn ? "e.g. PO-12345 received" : "e.g. Dispatched to Ward 3"}
            rows={3}
            error={errors.notes?.message}
            {...register("notes")}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4 bg-slate-900/50">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || !selectedProduct} 
          className={cn(
            "min-w-[140px]",
            isStockIn 
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
              : "bg-amber-600 hover:bg-amber-700 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          )}
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
          ) : (
            isStockIn ? "Add Stock" : "Remove Stock"
          )}
        </Button>
      </div>
    </form>
  );
}
