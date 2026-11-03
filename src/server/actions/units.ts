"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { UnitOfMeasureSchema, UnitOfMeasureInput } from "@/lib/schemas/uom";

export async function getUnitsOfMeasure() {
  try {
    const units = await prisma.unitOfMeasure.findMany({
      include: {
        _count: {
          select: { materials: true },
        },
      },
      orderBy: { code: "asc" },
    });
    return { success: true, data: units };
  } catch (error: any) {
    console.error("Error fetching units:", error);
    return { success: false, error: error.message };
  }
}

export async function createUnitOfMeasure(input: UnitOfMeasureInput) {
  try {
    const validated = UnitOfMeasureSchema.parse(input);

    const existingCode = await prisma.unitOfMeasure.findUnique({
      where: { code: validated.code },
    });
    if (existingCode) {
      return { success: false, error: `Unit with code "${validated.code}" already exists.` };
    }

    const existingAbbr = await prisma.unitOfMeasure.findUnique({
      where: { abbreviation: validated.abbreviation.toUpperCase() },
    });
    if (existingAbbr) {
      return { success: false, error: `Unit with abbreviation "${validated.abbreviation}" already exists.` };
    }

    const unit = await prisma.unitOfMeasure.create({
      data: {
        name: validated.name,
        abbreviation: validated.abbreviation.toUpperCase(),
        code: validated.code,
        description: validated.description || null,
      },
    });

    revalidatePath("/units");
    revalidatePath("/materials");
    return { success: true, data: unit };
  } catch (error: any) {
    console.error("Error creating unit:", error);
    return { success: false, error: error.message || "Failed to create unit" };
  }
}

export async function updateUnitOfMeasure(id: string, input: UnitOfMeasureInput) {
  try {
    const validated = UnitOfMeasureSchema.parse(input);

    // Check code collision
    const existingCode = await prisma.unitOfMeasure.findUnique({
      where: { code: validated.code },
    });
    if (existingCode && existingCode.id !== id) {
      return { success: false, error: `Unit with code "${validated.code}" already exists.` };
    }

    // Check abbreviation collision
    const existingAbbr = await prisma.unitOfMeasure.findUnique({
      where: { abbreviation: validated.abbreviation.toUpperCase() },
    });
    if (existingAbbr && existingAbbr.id !== id) {
      return { success: false, error: `Unit with abbreviation "${validated.abbreviation}" already exists.` };
    }

    const unit = await prisma.unitOfMeasure.update({
      where: { id },
      data: {
        name: validated.name,
        abbreviation: validated.abbreviation.toUpperCase(),
        code: validated.code,
        description: validated.description || null,
      },
    });

    // Update cached unit abbreviation in linked materials
    await prisma.material.updateMany({
      where: { unitId: id },
      data: { unit: validated.abbreviation.toUpperCase() },
    });

    revalidatePath("/units");
    revalidatePath("/materials");
    return { success: true, data: unit };
  } catch (error: any) {
    console.error("Error updating unit:", error);
    return { success: false, error: error.message || "Failed to update unit" };
  }
}

export async function deleteUnitOfMeasure(id: string) {
  try {
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id },
      include: { _count: { select: { materials: true } } },
    });

    if (!unit) {
      return { success: false, error: "Unit of measure not found." };
    }

    if (unit._count.materials > 0) {
      return {
        success: false,
        error: `Cannot delete unit "${unit.abbreviation}". It is currently assigned to ${unit._count.materials} material(s).`,
      };
    }

    await prisma.unitOfMeasure.delete({ where: { id } });
    revalidatePath("/units");
    revalidatePath("/materials");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete unit" };
  }
}
