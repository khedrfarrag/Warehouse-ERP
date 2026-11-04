export interface SmartCodeParams {
  companyCode?: string; // Default: "CDI"
  countryCode?: string; // Default: "EG"
  categoryCode: string; // 1 to 6 (Main Code)
  subCategoryCode?: string; // 1 to 9 (Sub Code)
  unitCode: string; // 1 to 9 (Unit Code)
  sequence?: number; // 6-digit sequence e.g. 1 -> "000001", 32 -> "000032"
}

/**
 * Builds the official Sinoma smart code prefix: CDI-EG-{MainCode}{SubCode}{UnitCode}
 * Example: CDI-EG-612
 */
export function buildSmartCodePrefix(
  countryCode = "EG",
  categoryCode: string,
  subCategoryCode = "1",
  unitCode: string,
  companyCode = "CDI"
): string {
  const comp = (companyCode || "CDI").trim().toUpperCase();
  const ctry = (countryCode || "EG").trim().toUpperCase();
  const cat = (categoryCode || "1").trim().slice(0, 1);
  const sub = (subCategoryCode || "1").trim().slice(0, 1);
  const unit = (unitCode || "1").trim().slice(0, 1);

  return `${comp}-${ctry}-${cat}${sub}${unit}`;
}

/**
 * Appends 6-digit sequential zero-padded serial number to prefix
 * Example: CDI-EG-612 + 32 -> CDI-EG-612000032 (9 numbers in total)
 */
export function formatSmartItemCode(prefix: string, sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(6, "0");
  return `${prefix}${padded}`;
}


