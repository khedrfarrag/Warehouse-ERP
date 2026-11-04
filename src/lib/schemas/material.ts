import { z } from "zod";

export const MaterialSchema = z.object({
  itemCode: z
    .string()
    .min(2, "Item code must be at least 2 characters")
    .max(50, "Item code cannot exceed 50 characters")
    .regex(
      /^[A-Z0-9_-]+$/,
      "Item code must be uppercase letters, numbers, hyphens or underscores"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name cannot exceed 150 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  unitId: z.string().min(1, "Please select a unit of measure"),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  subCategoryCode: z.string().optional(),
  unit: z.string().optional(),
  imageUrl: z.string().optional().or(z.literal("")),
  minStock: z.coerce
    .number()
    .min(0, "Minimum safety stock must be greater than or equal to 0")
    .default(0),
  location: z
    .string()
    .min(1, "Storage location is required")
    .max(100, "Location cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
});

export type MaterialInput = z.infer<typeof MaterialSchema>;

export const UpdateMaterialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  categoryId: z.string().min(1, "Please select a category").optional(),
  unitId: z.string().min(1, "Please select a unit of measure").optional(),
  subCategory: z.string().optional().nullable(),
  subCategoryCode: z.string().optional().nullable(),
  location: z.string().min(1, "Storage location is required").max(100),
  minStock: z.coerce.number().min(0, "Minimum safety stock must be >= 0"),
  imageUrl: z.string().optional().nullable(),
  description: z.string().max(500).optional().nullable(),
});

export type UpdateMaterialInput = z.infer<typeof UpdateMaterialSchema>;
