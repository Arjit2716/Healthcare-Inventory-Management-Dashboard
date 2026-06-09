"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Package, Hash, Tag, FileText, Box, AlertCircle } from "lucide-react";
import { createProductSchema, type CreateProductInput } from "@/validations/product.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSuppliers } from "@/hooks/use-suppliers";
import type { Product } from "@/types";
import { toast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Antibiotics", "Analgesics", "Antifungals", "Antivirals",
  "Cardiovascular", "Diabetes", "Dermatology", "Gastrointestinal",
  "Neurology", "Oncology", "Ophthalmology", "PPE",
  "Respiratory", "Vaccines", "Vitamins", "Equipment", "Other",
];

const UNITS = [
  "tablets", "capsules", "vials", "ampules", "ml", "mg",
  "units", "pairs", "boxes", "bags", "strips", "pieces",
];

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = !!product;
  const { suppliers, isLoading: suppliersLoading } = useSuppliers();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name:          product?.name          ?? "",
      sku:           product?.sku           ?? "",
      category:      product?.category      ?? "",
      description:   product?.description   ?? "",
      unit:          product?.unit          ?? "tablets",
      quantity:      product?.quantity      ?? 0,
      minStockLevel: product?.minStockLevel ?? 10,
      expiryDate:    product?.expiryDate
        ? product.expiryDate.slice(0, 10)
        : "",
      price:         product?.price         ? Number(product.price) : 0,
      supplierId:    product?.supplierId    ?? "",
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        name:          product.name,
        sku:           product.sku,
        category:      product.category,
        description:   product.description ?? "",
        unit:          product.unit,
        quantity:      product.quantity,
        minStockLevel: product.minStockLevel,
        expiryDate:    product.expiryDate ? product.expiryDate.slice(0, 10) : "",
        price:         Number(product.price),
        supplierId:    product.supplierId,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: CreateProductInput) => {
    const url    = isEditing ? `/api/products/${product.id}` : "/api/products";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(
          isEditing ? "Update failed" : "Creation failed",
          json.error ?? "Please check your inputs and try again."
        );
        return;
      }

      toast.success(
        isEditing ? "Product updated" : "Product created",
        isEditing ? `${data.name} has been updated.` : `${data.name} added to inventory.`
      );
      onSuccess();
    } catch {
      toast.error("Network error", "Please check your connection.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-0">
      {/* Scrollable body */}
      <div className="max-h-[65vh] overflow-y-auto p-6 space-y-5">

        {/* ── Row 1: Name + SKU ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              <span className="flex items-center gap-1.5">
                <Package className="h-3 w-3 text-slate-500" /> Product name *
              </span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. Amoxicillin 500mg"
              error={errors.name?.message}
              {...register("name")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">
              <span className="flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-slate-500" /> SKU *
              </span>
            </Label>
            <Input
              id="sku"
              placeholder="e.g. MED-AMX-500"
              error={errors.sku?.message}
              {...register("sku")}
            />
          </div>
        </div>

        {/* ── Row 2: Category + Unit ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="category">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3 w-3 text-slate-500" /> Category *
              </span>
            </Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger error={errors.category?.message}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="unit">Unit *</Label>
            <Controller
              name="unit"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger error={errors.unit?.message}>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* ── Row 3: Quantity + Min Stock + Price ── */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min={0}
              placeholder="0"
              error={errors.quantity?.message}
              {...register("quantity")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="minStockLevel">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 text-amber-500" /> Min Level *
              </span>
            </Label>
            <Input
              id="minStockLevel"
              type="number"
              min={1}
              placeholder="10"
              error={errors.minStockLevel?.message}
              {...register("minStockLevel")}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (USD) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min={0}
              placeholder="0.00"
              error={errors.price?.message}
              {...register("price")}
            />
          </div>
        </div>

        {/* ── Row 4: Supplier + Expiry ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="supplierId">Supplier *</Label>
            <Controller
              name="supplierId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={suppliersLoading}>
                  <SelectTrigger error={errors.supplierId?.message}>
                    <SelectValue placeholder={suppliersLoading ? "Loading…" : "Select supplier"} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiryDate">
              Expiry date
              <span className="ml-1 text-[10px] text-slate-600">(optional)</span>
            </Label>
            <Input
              id="expiryDate"
              type="date"
              error={errors.expiryDate?.message}
              className="[color-scheme:dark]"
              {...register("expiryDate")}
            />
          </div>
        </div>

        {/* ── Description ── */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            <span className="flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-slate-500" /> Description
              <span className="text-[10px] text-slate-600">(optional)</span>
            </span>
          </Label>
          <Textarea
            id="description"
            placeholder="Clinical notes, usage instructions, storage requirements…"
            rows={3}
            error={errors.description?.message}
            {...register("description")}
          />
        </div>

      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[130px]">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {isEditing ? "Updating…" : "Creating…"}</>
          ) : (
            isEditing ? "Update product" : "Create product"
          )}
        </Button>
      </div>
    </form>
  );
}
