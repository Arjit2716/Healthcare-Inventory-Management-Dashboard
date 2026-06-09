import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  type: z.enum(["STOCK_IN", "STOCK_OUT"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  notes: z.string().max(500).optional(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;
