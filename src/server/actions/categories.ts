"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { CategorySchema, CategoryInput } from "@/lib/schemas/category";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { materials: true },
        },
      },
      orderBy: { code: "asc" },
    });
    return { success: true, data: categories };
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return { success: false, error: error.message };
  }
}

export async function createCategory(input: CategoryInput) {
  try {
    const validated = CategorySchema.parse(input);

    const existingCode = await prisma.category.findUnique({
      where: { code: validated.code },
    });
    if (existingCode) {
      return { success: false, error: `Category with code "${validated.code}" already exists.` };
    }

    const existingName = await prisma.category.findUnique({
      where: { name: validated.name },
    });
    if (existingName) {
      return { success: false, error: `Category with name "${validated.name}" already exists.` };
    }

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        code: validated.code,
        description: validated.description || null,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/materials");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategory(id: string, input: CategoryInput) {
  try {
    const validated = CategorySchema.parse(input);

    // Check code collision
    const existingCode = await prisma.category.findUnique({
      where: { code: validated.code },
    });
    if (existingCode && existingCode.id !== id) {
      return { success: false, error: `Category with code "${validated.code}" already exists.` };
    }

    // Check name collision
    const existingName = await prisma.category.findUnique({
      where: { name: validated.name },
    });
    if (existingName && existingName.id !== id) {
      return { success: false, error: `Category with name "${validated.name}" already exists.` };
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: validated.name,
        code: validated.code,
        description: validated.description || null,
      },
    });

    // Update cached category name in linked materials
    await prisma.material.updateMany({
      where: { categoryId: id },
      data: { category: validated.name },
    });

    revalidatePath("/categories");
    revalidatePath("/materials");
    return { success: true, data: category };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { materials: true } } },
    });

    if (!category) {
      return { success: false, error: "Category not found." };
    }

    if (category._count.materials > 0) {
      return {
        success: false,
        error: `Cannot delete category "${category.name}". It is currently assigned to ${category._count.materials} material(s).`,
      };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath("/categories");
    revalidatePath("/materials");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
