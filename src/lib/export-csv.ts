/**
 * Exports data to CSV file with UTF-8 BOM encoding to ensure
 * Arabic characters and special symbols open correctly in Microsoft Excel.
 */

function escapeCell(cell: string | number | null | undefined): string {
  if (cell === null || cell === undefined) return '""';
  const stringVal = String(cell);
  // Escape double quotes by doubling them
  return `"${stringVal.replace(/"/g, '""')}"`;
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
) {
  const headerLine = headers.map(escapeCell).join(",");
  const dataLines = rows.map((row) => row.map(escapeCell).join(","));
  const csvContent = [headerLine, ...dataLines].join("\r\n");

  downloadCsv(filename, csvContent);
}

export interface ReorderItemInput {
  itemCode: string;
  name: string;
  category?: string | null;
  location: string;
  currentStock: number;
  minStock: number;
  unit?: string | null;
  description?: string | null;
}

/**
 * Exports a formal, formatted Sinoma Inventory Reorder & Shortage Report
 * with company letterhead metadata, automated deficit calculations, and summary row.
 */
export function exportReorderReportToCsv(
  filename: string,
  items: ReorderItemInput[],
  options?: {
    isArabic?: boolean;
    reportTitle?: string;
    generatedBy?: string;
  }
) {
  const isAr = options?.isArabic ?? false;
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];

  const metaRows: string[][] = [
    [isAr ? "مستودع شركة سينوما للمقاولات العامة - إدارة اللوجستيات والمخازن" : "SINOMA CDI CONTRACTING - WAREHOUSE & LOGISTICS DIVISION"],
    [
      options?.reportTitle ||
        (isAr
          ? "تقرير طلب توريد ونواقص المواد والمخزون"
          : "INVENTORY REORDER & MATERIAL SHORTAGE PROCUREMENT REPORT")
    ],
    [
      isAr
        ? `تاريخ الاستخراج: ${dateStr} ${timeStr} | إجمالي البنود: ${items.length}`
        : `Generated: ${dateStr} ${timeStr} | Total Items: ${items.length}`
    ],
    [], // Blank separator row
  ];

  const headers = isAr
    ? [
        "م",
        "كود الصنف (SKU)",
        "اسم المادة",
        "التصنيف",
        "مكان التخزين",
        "الرصيد المتاح",
        "حد الأمان الأدنى",
        "كمية العجز المطلوب توريدها",
        "الوحدة",
        "حالة المخزون",
        "ملاحظات ومواصفات",
      ]
    : [
        "No.",
        "Item Code (SKU)",
        "Material Name",
        "Category",
        "Storage Location",
        "Current Stock",
        "Safety Minimum",
        "Required Reorder Deficit",
        "Unit",
        "Stock Status",
        "Notes / Specifications",
      ];

  let totalCurrent = 0;
  let totalMin = 0;
  let totalDeficit = 0;

  const dataRows: (string | number)[][] = items.map((item, idx) => {
    const deficit = Math.max(0, item.minStock - item.currentStock);
    totalCurrent += item.currentStock;
    totalMin += item.minStock;
    totalDeficit += deficit;

    let status = isAr ? "متوفر" : "IN STOCK";
    if (item.currentStock <= 0) {
      status = isAr ? "نفد بالكامل (CRITICAL)" : "OUT OF STOCK";
    } else if (item.currentStock <= item.minStock) {
      status = isAr ? "تحت حد الأمان (LOW)" : "LOW SAFETY STOCK";
    }

    return [
      idx + 1,
      item.itemCode,
      item.name,
      item.category || (isAr ? "عام" : "General"),
      item.location,
      item.currentStock,
      item.minStock,
      deficit,
      item.unit || "PCS",
      status,
      item.description || "",
    ];
  });

  // Summary footer row
  const summaryRow = [
    isAr ? "الإجمالي" : "TOTAL",
    "",
    `${items.length} ${isAr ? "أصناف" : "Items"}`,
    "",
    "",
    totalCurrent,
    totalMin,
    totalDeficit,
    "",
    "",
    isAr ? `إجمالي كميات العجز المطلوب توريدها: ${totalDeficit}` : `Total Reorder Required: ${totalDeficit}`,
  ];

  // Pad metaRows to match table column count so Excel displays clean grid alignment
  const paddedMetaRows = metaRows.map((r) => {
    const padded = [...r];
    while (padded.length < headers.length) {
      padded.push("");
    }
    return padded;
  });

  const paddedSummaryRow = [...summaryRow];
  while (paddedSummaryRow.length < headers.length) {
    paddedSummaryRow.push("");
  }

  const allLines = [
    ...paddedMetaRows.map((r) => r.map(escapeCell).join(",")),
    headers.map(escapeCell).join(","),
    ...dataRows.map((r) => r.map(escapeCell).join(",")),
    headers.map(() => escapeCell("")).join(","), // Blank row matching column count
    paddedSummaryRow.map(escapeCell).join(","),
  ];

  const csvContent = allLines.join("\r\n");
  downloadCsv(filename, csvContent);
}

function downloadCsv(filename: string, csvContent: string) {
  // \uFEFF is the UTF-8 Byte Order Mark (BOM)
  // "sep=,\r\n" forces Microsoft Excel on Windows to split on commas into separate columns,
  // bypassing any Windows regional list separator mismatch (e.g. Arabic/Egyptian semicolon defaults).
  const excelCsv = "\uFEFFsep=,\r\n" + csvContent;
  const blob = new Blob([excelCsv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
