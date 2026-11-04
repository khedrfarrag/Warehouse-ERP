/**
 * Official Sinoma Material Coding System Specification
 * Reference: Chengdu Design & Research Institute of Building Materials Industry Co., Ltd. (CDI)
 *
 * Full Code Format: CDI-EG-{MainCode}{SubCode}{UnitCode}{SerialNumber}
 * Example: CDI-EG-612000032
 * - Company: CDI
 * - Country: EG
 * - Main Code (1 digit): Materials Category (1-6)
 * - Sub Code (1 digit): Subcategory (1-9)
 * - Unit Code (1 digit): Unit of Measure (1-9)
 * - Serial Number (6 digits): Sequential number depending on Main Code & Sub Code (000001 - 999999)
 */

export interface SubCategoryItem {
  code: string; // "1" to "9"
  name: string; // English
  nameAr: string; // Arabic
}

export interface MainCategoryItem {
  code: string; // "1" to "6"
  name: string; // English
  nameAr: string; // Arabic
  subCategories: SubCategoryItem[];
}

export interface UnitOfMeasureDefinition {
  code: string; // "1" to "9"
  abbreviation: string; // e.g. "pcs", "m", "m²", etc.
  name: string; // English
  nameAr: string; // Arabic
}

export const SINOMA_MAIN_CATEGORIES: MainCategoryItem[] = [
  {
    code: "1",
    name: "Tools",
    nameAr: "أدوات ومعدات صغيرة (Tools)",
    subCategories: [
      { code: "1", name: "cutting & abrasive and Drilling tools", nameAr: "أدوات القطع والتجليخ والثقب" },
      { code: "2", name: "measuring tools", nameAr: "أدوات القياس" },
      { code: "3", name: "electric tools", nameAr: "أدوات كهربائية" },
      { code: "4", name: "plumbing tools", nameAr: "أدوات السباكة" },
      { code: "5", name: "AC tools", nameAr: "أدوات التكييف والتبريد" },
      { code: "6", name: "lifting tools", nameAr: "أدوات ومعدات الرفع" },
      { code: "7", name: "packing tools", nameAr: "أدوات التغليف والتحزيم" },
      { code: "8", name: "building tools", nameAr: "أدوات البناء والتشييد" },
      { code: "9", name: "mechanical tools", nameAr: "أدوات ميكانيكية وورش" },
    ],
  },
  {
    code: "2",
    name: "Consumable",
    nameAr: "مستهلكات (Consumable)",
    subCategories: [
      { code: "1", name: "office consumables", nameAr: "مستهلكات مكتبية" },
      { code: "2", name: "Lubricants & greases & fuels", nameAr: "زيوت وشحومات ووقود" },
      { code: "3", name: "civil Consumable", nameAr: "مستهلكات مدنية" },
      { code: "4", name: "welding materials", nameAr: "مواد ولوازم اللحام" },
      { code: "5", name: "PPE materials", nameAr: "مهمات السلامة المهنية الوقائية" },
      { code: "6", name: "cutting & abrasive and Drilling materials", nameAr: "مستهلكات قطع وصنفرة وثقب" },
      { code: "7", name: "gas cylinders", nameAr: "أسطوانات غاز" },
      { code: "8", name: "mechanical spare parts", nameAr: "قطع غيار ميكانيكية استهلاكية" },
      { code: "9", name: "others", nameAr: "مستهلكات أخرى متنوعة" },
    ],
  },
  {
    code: "3",
    name: "Asset",
    nameAr: "أصول ومعدات ثابتة (Asset)",
    subCategories: [
      { code: "1", name: "Revolving Material", nameAr: "مواد دورية تشغيلية متكررة" },
      { code: "2", name: "Heavy Equipment & Machinery", nameAr: "معدات ثقيلة وآليات" },
      { code: "3", name: "vehicles", nameAr: "مركبات وسيارات" },
      { code: "4", name: "furniture", nameAr: "أثاث ومفروشات" },
      { code: "5", name: "IT equipments & HVAC", nameAr: "أجهزة حاسوب وتقنية وتكييف" },
      { code: "6", name: "Measuring Instrument", nameAr: "أجهزة قياس وفحص معتمدة" },
      { code: "7", name: "Non- Construction", nameAr: "أصول غير إنشائية" },
      { code: "8", name: "welding-cutting-Bending equipments", nameAr: "معدات لحام وقطع وثني" },
      { code: "9", name: "Living & storage Units", nameAr: "وحدات سكنية وكرافانات وتخزين" },
    ],
  },
  {
    code: "4",
    name: "Plumbing",
    nameAr: "سباكة ومواسير (Plumbing)",
    subCategories: [
      { code: "1", name: "pipes", nameAr: "مواسير وأنابيب" },
      { code: "2", name: "fittings", nameAr: "قطع توصيل ومحلقات" },
      { code: "3", name: "valves", nameAr: "محابس وصمامات" },
      { code: "4", name: "pumps&heaters and tanks", nameAr: "مضخات وسخانات وخزانات" },
      { code: "5", name: "sealing and fixture materials", nameAr: "مواد عزل وتثبيت وربط" },
      { code: "6", name: "sanitary ware", nameAr: "أدوات صحية" },
      { code: "7", name: "Fire Fighting", nameAr: "مهمات ومعدات إطفاء ومكافحة حريق" },
      { code: "8", name: "other plumping materials", nameAr: "مواد سباكة أخرى" },
      { code: "9", name: "Enclosures", nameAr: "غرف وصناديق تفتيش وتغطية" },
    ],
  },
  {
    code: "5",
    name: "Main Materials",
    nameAr: "مواد رئيسية وإنشائية (Main Materials)",
    subCategories: [
      { code: "1", name: "Cement, Lime & Derivatives", nameAr: "أسمنت وجير ومشتقاتهم" },
      { code: "2", name: "Sand, Gravel & Aggregates", nameAr: "رمل وحصى وركام" },
      { code: "3", name: "Steel & Iron Products", nameAr: "حديد تسليح ومنتجات الصلب" },
      { code: "4", name: "Bricks, Blocks & Tiles", nameAr: "طوب وبلوكات وبلاط" },
      { code: "5", name: "Paints, Coatings & Sealants", nameAr: "دهانات وبويات ومواد عزل سطحية" },
      { code: "6", name: "Insulation & Waterproofing Materials", nameAr: "مواد عزل مائي وحراري" },
      { code: "7", name: "Architectural & Finishing Materials", nameAr: "مواد تشطيبات ومعمارية" },
      { code: "8", name: "Other Construction Materials", nameAr: "مواد بناء وإنشاءات أخرى" },
      { code: "9", name: "Adhesives & Bonding Agents", nameAr: "مواد لاصقة وإضافات خرسانة" },
    ],
  },
  {
    code: "6",
    name: "Electrical",
    nameAr: "كهرباء وتمديدات (Electrical)",
    subCategories: [
      { code: "1", name: "Cables & Wiring", nameAr: "كابلات وأسلاك" },
      { code: "2", name: "Circuit Protection Devices", nameAr: "قواطع وأجهزة حماية الدوائر" },
      { code: "3", name: "Switches, Sockets & Outlets", nameAr: "مفاتيح ومقابس وأفياش" },
      { code: "4", name: "Lighting & Fixtures", nameAr: "كشافات وإنارة وملحقاتها" },
      { code: "5", name: "Electrical Panels & Enclosures", nameAr: "لوحات توزيع وصناديق كهربائية" },
      { code: "6", name: "Power Supply & Storage Units", nameAr: "وحدات تغذية وبطاريات ومولدات" },
      { code: "7", name: "Transformers & Voltage Regulators", nameAr: "محولات ومنظمات جهد" },
      { code: "8", name: "Conduits, Fittings & Trunking", nameAr: "مواسير وخراطيم وحوامل كابلات" },
      { code: "9", name: "Testing & Insulation Equipment", nameAr: "أجهزة اختبار ومعدات عزل كهربائي" },
    ],
  },
];

export const SINOMA_UNITS_OF_MEASURE: UnitOfMeasureDefinition[] = [
  { code: "1", abbreviation: "pcs", name: "Piece", nameAr: "قطعة (Piece)" },
  { code: "2", abbreviation: "m", name: "Meter", nameAr: "متر طولي (Meter)" },
  { code: "3", abbreviation: "m²", name: "Square Meter", nameAr: "متر مربع (m²)" },
  { code: "4", abbreviation: "m³", name: "Cubic Meter", nameAr: "متر مكعب (m³)" },
  { code: "5", abbreviation: "kg", name: "Kilogram", nameAr: "كيلوغرام (kg)" },
  { code: "6", abbreviation: "ton", name: "Metric Ton", nameAr: "طن متري (ton)" },
  { code: "7", abbreviation: "roll", name: "Roll", nameAr: "لفة / رول (roll)" },
  { code: "8", abbreviation: "set", name: "Set", nameAr: "طقم / مجموعة (set)" },
  { code: "9", abbreviation: "L", name: "Liter", nameAr: "لتر (L)" },
];

/**
 * Builds the standard Sinoma item code
 * Format: CDI-EG-{MainCode}{SubCode}{UnitCode}{6-digit sequential number}
 */
export function buildSinomaItemCode(params: {
  company?: string; // Default: CDI
  country?: string; // Default: EG
  mainCode: string; // 1 to 6
  subCode: string; // 1 to 9
  unitCode: string; // 1 to 9
  serialNumber: number; // e.g. 1 -> 000001, 32 -> 000032
}): string {
  const comp = (params.company || "CDI").trim().toUpperCase();
  const ctry = (params.country || "EG").trim().toUpperCase();
  const main = params.mainCode.trim().slice(0, 1);
  const sub = params.subCode.trim().slice(0, 1);
  const unit = params.unitCode.trim().slice(0, 1);
  const seq = String(params.serialNumber).padStart(6, "0");

  return `${comp}-${ctry}-${main}${sub}${unit}${seq}`;
}

/**
 * Parses a Sinoma item code into its component breakdown
 */
export function parseSinomaItemCode(code: string) {
  const match = code.match(/^([A-Z]+)-([A-Z]+)-(\d)(\d)(\d)(\d{6})$/);
  if (!match) return null;

  const [, company, country, mainCode, subCode, unitCode, serialStr] = match;
  const mainCat = SINOMA_MAIN_CATEGORIES.find((c) => c.code === mainCode);
  const subCat = mainCat?.subCategories.find((s) => s.code === subCode);
  const unit = SINOMA_UNITS_OF_MEASURE.find((u) => u.code === unitCode);

  return {
    company,
    country,
    mainCode,
    subCode,
    unitCode,
    serial: parseInt(serialStr, 10),
    mainCategory: mainCat,
    subCategory: subCat,
    unit,
  };
}
