import { prisma } from "@/lib/db";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const revalidate = 0; // dynamic dashboard

export default async function DashboardPage() {
  let materialsCount = 0;
  let categoriesCount = 0;
  let materialInCount = 0;
  let materialOutCount = 0;
  let lowStockMaterials: any[] = [];
  let recentLedger: any[] = [];

  try {
    const [matCount, catCount, matIn, matOut, lowStock, ledger] = await Promise.all([
      prisma.material.count(),
      prisma.category.count(),
      prisma.materialInVoucher.count(),
      prisma.materialOutVoucher.count(),
      prisma.material.findMany({
        where: {
          currentStock: { lte: prisma.material.fields.minStock },
        },
        take: 10,
        orderBy: { currentStock: "asc" },
      }),
      prisma.inventoryLedger.findMany({
        take: 5,
        orderBy: { timestamp: "desc" },
        include: { material: true },
      }),
    ]);

    materialsCount = matCount;
    categoriesCount = catCount;
    materialInCount = matIn;
    materialOutCount = matOut;
    lowStockMaterials = lowStock;
    recentLedger = ledger;
  } catch (error) {
    console.error("Dashboard database query error:", error);
  }

  return (
    <DashboardView
      materialsCount={materialsCount}
      categoriesCount={categoriesCount}
      materialInCount={materialInCount}
      materialOutCount={materialOutCount}
      lowStockMaterials={lowStockMaterials}
      recentLedger={recentLedger}
    />
  );
}
