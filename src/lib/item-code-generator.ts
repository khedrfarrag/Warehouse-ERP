export interface SmartCodeParams {
  countryCode?: string; // Default: "EGY"
  categoryCode: string; // e.g. "1"
  attributeCode?: string; // e.g. "5"
  unitCode: string; // e.g. "2"
  sequence?: number; // e.g. 1 -> "00001"
}

export function buildSmartCodePrefix(
  countryCode = "EGY",
  categoryCode: string,
  attributeCode = "0",
  unitCode: string
): string {
  const country = (countryCode || "EGY").trim().toUpperCase().slice(0, 3);
  const cat = (categoryCode || "1").trim();
  const attr = (attributeCode || "0").trim();
  const unit = (unitCode || "1").trim();

  return `${country}-${cat}${attr}${unit}`;
}

export function formatSmartItemCode(prefix: string, sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(5, "0");
  return `${prefix}${padded}`;
}

