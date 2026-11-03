import { z } from "zod";

export const UnitOfMeasureSchema = z.object({
  name: z
    .string()
    .min(2, "Unit name must be at least 2 characters")
    .max(100, "Unit name cannot exceed 100 characters"),
  abbreviation: z
    .string()
    .min(1, "Abbreviation is required")
    .max(15, "Abbreviation cannot exceed 15 characters")
    .toUpperCase(),
  code: z
    .string()
    .min(1, "Numeric code is required")
    .max(3, "Code must be 1 to 3 digits")
    .regex(/^[0-9]+$/, "Code must contain numbers only (e.g. 1, 2, 3)"),
  description: z.string().max(250).optional().or(z.literal("")),
});

export type UnitOfMeasureInput = z.infer<typeof UnitOfMeasureSchema>;

