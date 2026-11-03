import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories, units of measure, and materials...");

  // 1. Seed Categories
  const categoriesData = [
    { name: "Civil Works", code: "1", description: "Concrete, rebar, cement, and structural materials" },
    { name: "Electrical & Instrumentation", code: "2", description: "Power cables, transformers, switchgear, and sensors" },
    { name: "Mechanical & Static Equipment", code: "3", description: "Heavy machinery, gears, bearings, and structural steel" },
    { name: "Piping & Valves", code: "4", description: "Pressure pipes, valves, flanges, and gaskets" },
    { name: "Safety & PPE", code: "5", description: "Helmets, boots, vests, and fire safety systems" },
    { name: "Tools & Consumables", code: "6", description: "Welding rods, grinding discs, lubricants, and fasteners" },
  ];

  const categoriesMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categoriesMap.set(cat.name, created.id);
  }

  // 2. Seed Units of Measure
  const unitsData = [
    { name: "50kg Bag", abbreviation: "BAG", code: "1", description: "Cement and dry powder sacks" },
    { name: "Kilogram", abbreviation: "KG", code: "2", description: "Weight of steel, metals, and bulk powders" },
    { name: "Meter", abbreviation: "MTR", code: "3", description: "Linear length of cables and pipes" },
    { name: "Piece", abbreviation: "PCS", code: "4", description: "Individual manufactured components and tools" },
    { name: "Metric Ton", abbreviation: "TON", code: "5", description: "Bulk material weighing 1000 kg" },
    { name: "Set", abbreviation: "SET", code: "6", description: "Matched assembly sets" },
    { name: "Drum", abbreviation: "DRUM", code: "7", description: "Chemical and oil barrels" },
    { name: "Liter", abbreviation: "LTR", code: "8", description: "Liquid consumables" },
  ];

  const unitsMap = new Map<string, string>();
  for (const u of unitsData) {
    const created = await prisma.unitOfMeasure.upsert({
      where: { code: u.code },
      update: { name: u.name, abbreviation: u.abbreviation, description: u.description },
      create: u,
    });
    unitsMap.set(u.abbreviation, created.id);
  }

  // 3. Seed Sample Materials with Relational Keys
  const sampleMaterials = [
    {
      itemCode: "EGY-15100001",
      name: "Ordinary Portland Cement (50kg Bags)",
      categoryName: "Civil Works",
      unitAbbr: "BAG",
      minStock: 200,
      currentStock: 1500,
      location: "Warehouse A - Bay 1",
      description: "High performance construction cement for foundations",
    },
    {
      itemCode: "EGY-15200002",
      name: "Deformed High-Tensile Steel Rebar 16mm",
      categoryName: "Civil Works",
      unitAbbr: "KG",
      minStock: 3000,
      currentStock: 12500,
      location: "Open Yard 2 - Section C",
      description: "Reinforcement rebar ASTM A615 Grade 60",
    },
    {
      itemCode: "EGY-45300003",
      name: "HDPE Pressure Pipe 110mm SDR11 PN16",
      categoryName: "Piping & Valves",
      unitAbbr: "MTR",
      minStock: 100,
      currentStock: 450,
      location: "Racks Bay 4",
      description: "Underground water transmission piping",
    },
    {
      itemCode: "EGY-25300004",
      name: "Armoured Copper Power Cable 4x16mm² XLPE",
      categoryName: "Electrical & Instrumentation",
      unitAbbr: "MTR",
      minStock: 250,
      currentStock: 120, // Low stock on purpose
      location: "Cable Drum Yard",
      description: "Low voltage power distribution cable",
    },
    {
      itemCode: "EGY-55400005",
      name: "Industrial Safety Hard Hat (White) ANSI Z89",
      categoryName: "Safety & PPE",
      unitAbbr: "PCS",
      minStock: 50,
      currentStock: 210,
      location: "Safety Stores Bin 12",
      description: "Head protection gear for site engineers",
    },
    {
      itemCode: "EGY-45400006",
      name: "Cast Iron Flanged Gate Valve 3-inch Class 150",
      categoryName: "Piping & Valves",
      unitAbbr: "PCS",
      minStock: 15,
      currentStock: 8, // Low stock on purpose
      location: "Tool Crib Shelf 3",
      description: "Isolation valves for plant water cooling circuit",
    },
  ];

  for (const mat of sampleMaterials) {
    const categoryId = categoriesMap.get(mat.categoryName);
    const unitId = unitsMap.get(mat.unitAbbr);

    await prisma.material.upsert({
      where: { itemCode: mat.itemCode },
      update: {
        categoryId,
        unitId,
        category: mat.categoryName,
        unit: mat.unitAbbr,
      },
      create: {
        itemCode: mat.itemCode,
        name: mat.name,
        category: mat.categoryName,
        unit: mat.unitAbbr,
        categoryId,
        unitId,
        minStock: mat.minStock,
        currentStock: mat.currentStock,
        location: mat.location,
        description: mat.description,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
