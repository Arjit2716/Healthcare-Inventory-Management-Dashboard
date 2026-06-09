import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  contactPerson: z.string().min(2, "Contact person required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Phone number required").max(20),
  address: z.string().min(5, "Address required").max(500),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
