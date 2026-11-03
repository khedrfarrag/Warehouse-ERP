import { z } from "zod";

export const MaterialOutItemSchema = z.object({
  materialId: z.string().min(1, "Please select a material"),
  quantity: z.coerce
    .number()
    .positive("Quantity must be greater than 0"),
  notes: z.string().max(250).optional().or(z.literal("")),
});

export const MaterialOutVoucherSchema = z.object({
  voucherNo: z.string().optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
  projectName: z
    .string()
    .min(2, "Project name must be at least 2 characters")
    .max(150, "Project name cannot exceed 150 characters"),
  siteLocation: z
    .string()
    .min(2, "Specific site work location / area is required (e.g. Kiln Tower Level 4)")
    .max(150, "Location cannot exceed 150 characters"),
  requisitionNo: z
    .string()
    .min(1, "Material Requisition Note # is required")
    .max(100, "Requisition number cannot exceed 100 characters"),
  recipient: z
    .string()
    .min(2, "Recipient engineer/contractor must be at least 2 characters")
    .max(100, "Recipient cannot exceed 100 characters"),
  notes: z.string().max(500).optional().or(z.literal("")),
  items: z
    .array(MaterialOutItemSchema)
    .min(1, "Voucher must contain at least one line item"),
});

export type MaterialOutVoucherInput = z.infer<typeof MaterialOutVoucherSchema>;
