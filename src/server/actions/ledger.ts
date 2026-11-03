"use server";

import { prisma } from "@/lib/db";

export async function getInventoryLedger(filters?: {
  materialId?: string;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    if (filters?.materialId && filters.materialId !== "ALL") {
      where.materialId = filters.materialId;
    }

    if (filters?.transactionType && filters.transactionType !== "ALL") {
      where.transactionType = filters.transactionType;
    }

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { voucherReference: { contains: q, mode: "insensitive" } },
        { operator: { contains: q, mode: "insensitive" } },
        { notes: { contains: q, mode: "insensitive" } },
        {
          material: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { itemCode: { contains: q, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const entries = await prisma.inventoryLedger.findMany({
      where,
      include: {
        material: true,
      },
      orderBy: { timestamp: "desc" },
    });

    return { success: true, data: entries };
  } catch (error: any) {
    console.error("Error fetching inventory ledger:", error);
    return { success: false, error: error.message };
  }
}
