import { z } from "zod";

export const CategorySchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),
  code: z
    .string()
    .min(1, "Numeric code is required")
    .max(3, "Code must be 1 to 3 digits")
    .regex(/^[0-9]+$/, "Code must contain numbers only (e.g. 1, 2, 3)"),
  description: z.string().max(250).optional().or(z.literal("")),
});

export type CategoryInput = z.infer<typeof CategorySchema>;

