"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MaterialSchema, MaterialInput, UpdateMaterialSchema, UpdateMaterialInput } from "@/lib/schemas/material";
import { buildSmartCodePrefix, formatSmartItemCode } from "@/lib/item-code-generator";

export async function getMaterials(params?: {
  query?: string;
  categoryId?: string;
  stockStatus?: "ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK";
  maxStock?: number;
  page?: number;
  limit?: number;
}) {
  try {
    const conditions: any[] = [];
    const query = params?.query?.trim();

    if (query) {
      conditions.push({
        OR: [
          { itemCode: { contains: query, mode: "insensitive" } },
          { name: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
        ],
      });
    }

    if (params?.categoryId && params.categoryId !== "ALL") {
      conditions.push({
        OR: [
          { categoryId: params.categoryId },
          { category: params.categoryId },
        ],
      });
    }

    if (params?.stockStatus && params.stockStatus !== "ALL") {
      if (params.stockStatus === "LOW_STOCK") {
        conditions.push({
          currentStock: { lte: prisma.material.fields.minStock },
        });
      } else if (params.stockStatus === "OUT_OF_STOCK") {
        conditions.push({
          currentStock: { lte: 0 },
        });
      } else if (params.stockStatus === "IN_STOCK") {
        conditions.push({
          currentStock: { gt: prisma.material.fields.minStock },
        });
      }
    }

    if (
      typeof params?.maxStock === "number" &&
      !isNaN(params.maxStock) &&
      params.maxStock >= 0
    ) {
      conditions.push({
        currentStock: { lte: params.maxStock },
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const page = params?.page && params.page > 0 ? params.page : 1;
    const limit = params?.limit && params.limit > 0 ? params.limit : 100;
    const skip = (page - 1) * limit;

    const [materials, totalCount] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          categoryRel: true,
          unitRel: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.material.count({ where }),
    ]);

    // Normalize category and unit display
    const formatted = materials.map((m) => ({
      ...m,
      category: m.categoryRel?.name || m.category || "General",
      unit: m.unitRel?.abbreviation || m.unit || "PCS",
    }));

    return {
      success: true,
      data: formatted,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  } catch (error: any) {
    console.error("Error fetching materials:", error);
    return { success: false, error: error.message || "Failed to load materials" };
  }
}

export async function generateNextItemCode(params: {
  companyCode?: string;
  countryCode?: string;
  categoryCode: string;
  subCategoryCode?: string;
  unitCode: string;
}) {
  try {
    const company = (params.companyCode || "CDI").trim().toUpperCase();
    const country = (params.countryCode || "EG").trim().toUpperCase();
    const catCode = (params.categoryCode || "1").trim().slice(0, 1);
    const subCode = (params.subCategoryCode || "1").trim().slice(0, 1);
    const unitCode = (params.unitCode || "1").trim().slice(0, 1);

    const fullPrefix = `${company}-${country}-${catCode}${subCode}${unitCode}`;
    const categorySubGroup = `${company}-${country}-${catCode}${subCode}`;

    // According to Sinoma spec:
    // "The serial number is a sequential code that depends on both the Main Code and the Sub Code"
    const existingMatches = await prisma.material.findMany({
      where: {
        itemCode: { startsWith: categorySubGroup },
      },
      select: { itemCode: true },
    });

    let maxSeq = 0;
    for (const item of existingMatches) {
      const codeOnly = item.itemCode.trim();
      const match = codeOnly.match(/(\d{6})$/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > maxSeq) {
          maxSeq = parsed;
        }
      }
    }

    const nextSeq = maxSeq + 1;
    const smartCode = `${fullPrefix}${String(nextSeq).padStart(6, "0")}`;

    return {
      success: true,
      itemCode: smartCode,
      nextSequence: nextSeq,
      formattedSerial: String(nextSeq).padStart(6, "0"),
      prefix: fullPrefix,
    };
  } catch (error: any) {
    console.error("Error generating Sinoma smart item code:", error);
    return { success: false, error: error.message };
  }
}

export async function createMaterial(input: MaterialInput) {
  try {
    const validated = MaterialSchema.parse(input);

    const existing = await prisma.material.findUnique({
      where: { itemCode: validated.itemCode.toUpperCase() },
    });

    if (existing) {
      return {
        success: false,
        error: `Material with item code "${validated.itemCode}" already exists.`,
      };
    }

    // Resolve Category & Unit names for caching
    const [cat, uom] = await Promise.all([
      prisma.category.findUnique({ where: { id: validated.categoryId } }),
      prisma.unitOfMeasure.findUnique({ where: { id: validated.unitId } }),
    ]);

    const material = await prisma.material.create({
      data: {
        itemCode: validated.itemCode.toUpperCase(),
        name: validated.name,
        categoryId: validated.categoryId,
        unitId: validated.unitId,
        category: cat?.name || validated.category || "General",
        subCategory: validated.subCategory || null,
        subCategoryCode: validated.subCategoryCode || null,
        unit: uom?.abbreviation || validated.unit || "PCS",
        imageUrl: validated.imageUrl || null,
        minStock: validated.minStock,
        currentStock: 0.0,
        location: validated.location,
        description: validated.description || null,
      },
    });

    revalidatePath("/materials");
    revalidatePath("/material-in");
    revalidatePath("/material-out");
    revalidatePath("/");
    return { success: true, data: material };
  } catch (error: any) {
    console.error("Error creating material:", error);
    return { success: false, error: error.message || "Failed to create material" };
  }
}

export async function updateMaterial(id: string, input: UpdateMaterialInput) {
  try {
    const validated = UpdateMaterialSchema.parse(input);

    let categoryName: string | undefined;
    let unitAbbr: string | undefined;

    if (validated.categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: validated.categoryId } });
      if (cat) categoryName = cat.name;
    }

    if (validated.unitId) {
      const uom = await prisma.unitOfMeasure.findUnique({ where: { id: validated.unitId } });
      if (uom) unitAbbr = uom.abbreviation;
    }

    const updated = await prisma.material.update({
      where: { id },
      data: {
        name: validated.name,
        categoryId: validated.categoryId,
        unitId: validated.unitId,
        category: categoryName,
        subCategory: validated.subCategory,
        subCategoryCode: validated.subCategoryCode,
        unit: unitAbbr,
        location: validated.location,
        minStock: validated.minStock,
        imageUrl: validated.imageUrl,
        description: validated.description,
      },
    });

    revalidatePath("/materials");
    revalidatePath("/material-in");
    revalidatePath("/material-out");
    revalidatePath("/");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Error updating material:", error);
    return { success: false, error: error.message || "Failed to update material" };
  }
}

export async function deleteMaterial(id: string) {
  try {
    // Check referential integrity: verify material is not used in vouchers or ledger
    const [inItems, outItems, ledger] = await Promise.all([
      prisma.materialInItem.count({ where: { materialId: id } }),
      prisma.materialOutItem.count({ where: { materialId: id } }),
      prisma.inventoryLedger.count({ where: { materialId: id } }),
    ]);

    const totalTransactions = inItems + outItems + ledger;
    if (totalTransactions > 0) {
      return {
        success: false,
        error: `Cannot delete material with existing warehouse transaction history (${totalTransactions} transactions found).`,
      };
    }

    await prisma.material.delete({
      where: { id },
    });

    revalidatePath("/materials");
    revalidatePath("/material-in");
    revalidatePath("/material-out");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting material:", error);
    return { success: false, error: error.message || "Failed to delete material" };
  }
}
