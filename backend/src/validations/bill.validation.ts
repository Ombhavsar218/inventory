import { z } from "zod";

const billItemSchema = z.object({
  stockId: z.number().int().positive("Stock item is required"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price must be 0 or more"),
});

export const createBillSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  date: z.string().optional(),
  items: z.array(billItemSchema).min(1, "At least one item is required"),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;
