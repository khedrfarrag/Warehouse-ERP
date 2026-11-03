import { z } from "zod";

export const MaterialInItemSchema = z.object({
  materialId: z.string().min(1, "Please select a material"),
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0"),
  unitPrice: z.coerce.number().nonnegative().optional().default(0),
  notes: z.string().max(250).optional().or(z.literal("")),
});

export const MaterialInVoucherSchema = z.object({
  voucherNo: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  supplierName: z
    .string()
    .min(2, "Supplier name must be at least 2 characters")
    .max(150, "Supplier name cannot exceed 150 characters"),
  poNumber: z.string().max(100).optional().or(z.literal("")),
  deliveryNote: z.string().max(100).optional().or(z.literal("")),
  receivedBy: z
    .string()
    .min(2, "Receiving officer name must be at least 2 characters")
    .max(100, "Receiving officer name cannot exceed 100 characters"),
  notes: z.string().max(500).optional().or(z.literal("")),
  items: z
    .array(MaterialInItemSchema)
    .min(1, "Voucher must contain at least one line item"),
});

export type MaterialInVoucherInput = z.infer<typeof MaterialInVoucherSchema>;

