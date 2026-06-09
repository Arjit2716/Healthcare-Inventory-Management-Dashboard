import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  sku: z.string().min(2, "SKU required").max(50),
  category: z.string().min(1, "Category is required"),
  description: z.string().max(500).optional(),
  unit: z.string().min(1, "Unit is required"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  minStockLevel: z.coerce.number().int().min(1, "Minimum stock level must be at least 1"),
  expiryDate: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  supplierId: z.string().min(1, "Supplier is required"),
});

export const updateProductSchema = createProductSchema.partial();

export const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  stockStatus: z.enum(["all", "ok", "low", "critical", "out"]).optional(),
  supplierId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
