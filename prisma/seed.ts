import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Sinoma official Categories and Units of Measure...");

  // 1. Seed Official 6 Sinoma Categories
  const categoriesData = [
    { name: "Tools", code: "1", description: "Cutting, measuring, electric, plumbing, AC, lifting, packing, building, mechanical tools" },
    { name: "Consumable", code: "2", description: "Office consumables, lubricants, civil, welding, PPE, cutting materials, gas cylinders, spare parts" },
    { name: "Asset", code: "3", description: "Heavy equipment, vehicles, furniture, IT/HVAC, measuring instruments, non-construction, living/storage units" },
    { name: "Plumbing", code: "4", description: "Pipes, fittings, valves, pumps, heaters, tanks, sealing materials, sanitary ware, fire fighting, enclosures" },
    { name: "Main Materials", code: "5", description: "Cement, lime, sand, gravel, steel, iron, bricks, blocks, tiles, paints, insulation, adhesives" },
    { name: "Electrical", code: "6", description: "Cables, wiring, circuit protection, switches, sockets, lighting, electrical panels, power supplies, transformers, conduits" },
  ];

  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
  }
  console.log(`✓ Seeded ${categoriesData.length} Sinoma Main Categories.`);

  // 2. Seed Official 9 Sinoma Units of Measure
  const unitsData = [
    { name: "Piece", abbreviation: "PCS", code: "1", description: "Individual unit count (pcs)" },
    { name: "Meter", abbreviation: "M", code: "2", description: "Linear length in meters (m)" },
    { name: "Square Meter", abbreviation: "M²", code: "3", description: "Surface area (m²)" },
    { name: "Cubic Meter", abbreviation: "M³", code: "4", description: "Volume (m³)" },
    { name: "Kilogram", abbreviation: "KG", code: "5", description: "Weight in kilograms (kg)" },
    { name: "Metric Ton", abbreviation: "TON", code: "6", description: "Bulk weight (ton)" },
    { name: "Roll", abbreviation: "ROLL", code: "7", description: "Rolled materials (roll)" },
    { name: "Set", abbreviation: "SET", code: "8", description: "Matched set / assembly (set)" },
    { name: "Liter", abbreviation: "L", code: "9", description: "Liquid volume in liters (L)" },
  ];

  for (const u of unitsData) {
    await prisma.unitOfMeasure.upsert({
      where: { code: u.code },
      update: { name: u.name, abbreviation: u.abbreviation, description: u.description },
      create: u,
    });
  }
  console.log(`✓ Seeded ${unitsData.length} Sinoma Units of Measure.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
