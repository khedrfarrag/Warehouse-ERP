import ExcelJS from "exceljs";
import { ReorderItemInput } from "./export-csv";

export interface ProfessionalExcelReportOptions {
  isArabic?: boolean;
  reportTitle?: string;
  categoryFilter?: string;
  stockStatusFilter?: string;
  thresholdFilter?: string | number;
  searchQuery?: string;
}

/**
 * Generates an executive, professionally styled Microsoft Excel (.xlsx) report
 * featuring Sinoma corporate letterhead, auto-fitted column widths, status color-coding,
 * shortage deficit highlights, thin cell borders, and accounting summary rows.
 */
export async function exportProfessionalExcelReport(
  filename: string,
  items: ReorderItemInput[],
  options?: ProfessionalExcelReportOptions
) {
  const isAr = options?.isArabic ?? false;
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sinoma CDI Contracting - ERP";
  workbook.lastModifiedBy = "Sinoma Warehouse Controller";
  workbook.created = now;
  workbook.modified = now;

  const sheetName = isAr ? "تقرير نواقص المخزون" : "Reorder Shortage Report";
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [
      {
        showGridLines: true,
        ...(isAr ? { rightToLeft: true } : {}),
      } as any,
    ],
    pageSetup: { orientation: "landscape", fitToPage: true },
  });

  // Define Columns & Widths
  worksheet.columns = [
    { key: "no", width: 8 },
    { key: "itemCode", width: 18 },
    { key: "name", width: 32 },
    { key: "category", width: 18 },
    { key: "location", width: 18 },
    { key: "currentStock", width: 16 },
    { key: "minStock", width: 16 },
    { key: "deficit", width: 22 },
    { key: "unit", width: 12 },
    { key: "status", width: 20 },
    { key: "notes", width: 26 },
  ];

  const totalCols = 11;

  // 1. Corporate Header Banner (Row 1)
  const titleRow1 = worksheet.addRow([
    isAr
      ? "شركة سينوما للمقاولات العامة - قطاع اللوجستيات وإدارة المستودعات"
      : "SINOMA CDI CONTRACTING - WAREHOUSE & LOGISTICS DIVISION",
  ]);
  worksheet.mergeCells(1, 1, 1, totalCols);
  titleRow1.height = 34;
  titleRow1.getCell(1).font = {
    name: "Calibri",
    size: 14,
    bold: true,
    color: { argb: "FFFFFFFF" },
  };
  titleRow1.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172A" }, // Slate-900 / Sinoma Deep Navy
  };
  titleRow1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  // 2. Report Title (Row 2)
  const reportTitleText =
    options?.reportTitle ||
    (isAr
      ? "تقرير طلب توريد ونواقص المواد والمخزون الميداني"
      : "INVENTORY REORDER & MATERIAL SHORTAGE PROCUREMENT REPORT");

  const titleRow2 = worksheet.addRow([reportTitleText]);
  worksheet.mergeCells(2, 1, 2, totalCols);
  titleRow2.height = 26;
  titleRow2.getCell(1).font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: "FF1E293B" },
  };
  titleRow2.getCell(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" }, // Slate-100
  };
  titleRow2.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  // 3. Metadata and Filter Context (Row 3)
  const filterSummaryParts: string[] = [];
  if (options?.categoryFilter && options.categoryFilter !== "ALL") {
    filterSummaryParts.push(
      `${isAr ? "التصنيف" : "Category"}: ${options.categoryFilter}`
    );
  }
  if (options?.stockStatusFilter && options.stockStatusFilter !== "ALL") {
    filterSummaryParts.push(
      `${isAr ? "حالة الرصيد" : "Stock Status"}: ${options.stockStatusFilter}`
    );
  }
  if (options?.thresholdFilter !== undefined && options.thresholdFilter !== "") {
    filterSummaryParts.push(
      `${isAr ? "الحد الأقصى" : "Max Qty"} ≤ ${options.thresholdFilter}`
    );
  }
  if (options?.searchQuery) {
    filterSummaryParts.push(
      `${isAr ? "بحث" : "Query"}: "${options.searchQuery}"`
    );
  }

  const metaString = [
    isAr ? `تاريخ الإصدار: ${dateStr} ${timeStr}` : `Generated: ${dateStr} ${timeStr}`,
    isAr ? `إجمالي البنود: ${items.length}` : `Total Items: ${items.length}`,
    filterSummaryParts.length > 0
      ? `${isAr ? "الفلاتر النشطة" : "Active Filters"}: [${filterSummaryParts.join(" | ")}]`
      : isAr ? "الفلاتر: جميع الكتالوج" : "Filters: All Catalog",
  ].join("  •  ");

  const titleRow3 = worksheet.addRow([metaString]);
  worksheet.mergeCells(3, 1, 3, totalCols);
  titleRow3.height = 20;
  titleRow3.getCell(1).font = {
    name: "Calibri",
    size: 10,
    italic: true,
    color: { argb: "FF64748B" },
  };
  titleRow3.getCell(1).alignment = { horizontal: isAr ? "right" : "left", vertical: "middle" };

  // Empty separator row (Row 4)
  worksheet.addRow([]);
  worksheet.getRow(4).height = 10;

  // 4. Table Column Headers (Row 5)
  const headers = isAr
    ? [
        "م",
        "كود الصنف (SKU)",
        "اسم المادة",
        "التصنيف",
        "مكان التخزين",
        "الرصيد المتاح",
        "حد الأمان الأدنى",
        "العجز المطلوب توريده",
        "الوحدة",
        "حالة المخزون",
        "الملاحظات والمواصفات",
      ]
    : [
        "No.",
        "Item Code (SKU)",
        "Material Name",
        "Category",
        "Storage Location",
        "Current Stock",
        "Safety Minimum",
        "Reorder Deficit",
        "Unit",
        "Stock Status",
        "Notes / Specifications",
      ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0284C7" }, // Sky-600 (Sinoma ERP Brand Color)
    };
    cell.alignment = {
      horizontal: "center",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF0369A1" } },
      left: { style: "thin", color: { argb: "FF0369A1" } },
      bottom: { style: "medium", color: { argb: "FF0F172A" } },
      right: { style: "thin", color: { argb: "FF0369A1" } },
    };
  });

  // 5. Data Rows
  let totalCurrent = 0;
  let totalMin = 0;
  let totalDeficit = 0;

  items.forEach((item, index) => {
    const deficit = Math.max(0, item.minStock - item.currentStock);
    totalCurrent += item.currentStock;
    totalMin += item.minStock;
    totalDeficit += deficit;

    let statusText = isAr ? "متوفر" : "IN STOCK";
    let statusBg = "FFDCFCE7"; // Light Emerald
    let statusFg = "FF166534"; // Dark Emerald

    if (item.currentStock <= 0) {
      statusText = isAr ? "نفد من المخزن (حرج)" : "OUT OF STOCK (CRITICAL)";
      statusBg = "FFFEE2E2"; // Light Rose
      statusFg = "FF991B1B"; // Dark Rose
    } else if (item.currentStock <= item.minStock) {
      statusText = isAr ? "تحت حد الأمان (منخفض)" : "BELOW SAFETY (LOW)";
      statusBg = "FFFEF3C7"; // Light Amber
      statusFg = "FF92400E"; // Dark Amber
    }

    const row = worksheet.addRow([
      index + 1,
      item.itemCode,
      item.name,
      item.category || (isAr ? "عام" : "General"),
      item.location,
      item.currentStock,
      item.minStock,
      deficit,
      item.unit || "PCS",
      statusText,
      item.description || "",
    ]);

    row.height = 22;

    const isEven = index % 2 === 0;
    const rowBg = isEven ? "FFFFFFFF" : "FFF8FAFC"; // Subtle zebra striping

    row.eachCell((cell, colNumber) => {
      // Default cell styling
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF1E293B" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: rowBg },
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      // Alignment rules by column type
      if (colNumber === 1 || colNumber === 9) {
        // No. and Unit
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNumber === 2) {
        // SKU: Monospace font feel & Bold
        cell.font = { name: "Consolas", size: 10, bold: true, color: { argb: "FF0369A1" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNumber >= 6 && colNumber <= 8) {
        // Numbers: Stock, Min, Deficit
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        cell.alignment = {
          horizontal: isAr ? "right" : "left",
          vertical: "middle",
        };
      }

      // Highlight Reorder Deficit Column (Col 8)
      if (colNumber === 8 && deficit > 0) {
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF991B1B" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFEE2E2" }, // Alert Rose background
        };
      }

      // Highlight Stock Status Column (Col 10)
      if (colNumber === 10) {
        cell.font = { name: "Calibri", size: 9.5, bold: true, color: { argb: statusFg } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusBg },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });
  });

  // Empty separator before total
  worksheet.addRow([]);
  worksheet.getRow(worksheet.rowCount).height = 8;

  // 6. Summary / Total Row
  const summaryRow = worksheet.addRow([
    isAr ? "الإجمالي الكلي" : "TOTAL SUMMARY",
    "",
    `${items.length} ${isAr ? "أصناف" : "Items"}`,
    "",
    "",
    totalCurrent,
    totalMin,
    totalDeficit,
    "",
    isAr ? `إجمالي العجز: ${totalDeficit}` : `Total Deficit: ${totalDeficit}`,
    "",
  ]);

  summaryRow.height = 26;

  summaryRow.eachCell((cell, colNumber) => {
    cell.font = {
      name: "Calibri",
      size: 11,
      bold: true,
      color: { argb: "FF0F172A" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" }, // Slate-200
    };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "medium", color: { argb: "FF64748B" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "double", color: { argb: "FF0F172A" } }, // Classic accounting double-line
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };

    if (colNumber === 8 && totalDeficit > 0) {
      cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF991B1B" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFECDD3" }, // Rose-200
      };
    }
  });

  await downloadWorkbook(workbook, filename);
}

/**
 * Downloads a generated Excel workbook in the browser
 */
async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const finalFilename = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", finalFilename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface MaterialCatalogItemInput {
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
 * Exports the complete Material Catalog to a formatted Microsoft Excel (.xlsx) workbook
 */
export async function exportMaterialsCatalogExcel(
  filename: string,
  items: MaterialCatalogItemInput[],
  options?: { isArabic?: boolean; title?: string }
) {
  const isAr = options?.isArabic ?? false;
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sinoma CDI Contracting - ERP";
  workbook.created = now;

  const sheetName = isAr ? "دليل المواد والمخزون" : "Material Catalog";
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true, ...(isAr ? { rightToLeft: true } : {}) } as any],
    pageSetup: { orientation: "landscape", fitToPage: true },
  });

  worksheet.columns = [
    { key: "no", width: 8 },
    { key: "itemCode", width: 20 },
    { key: "name", width: 34 },
    { key: "category", width: 20 },
    { key: "location", width: 20 },
    { key: "currentStock", width: 16 },
    { key: "minStock", width: 16 },
    { key: "unit", width: 12 },
    { key: "status", width: 20 },
    { key: "notes", width: 30 },
  ];

  const totalCols = 10;

  // Banner
  const r1 = worksheet.addRow([
    isAr
      ? "شركة سينوما للمقاولات العامة - سجل ودليل المواد والمخزون"
      : "SINOMA CDI CONTRACTING - MATERIAL INVENTORY CATALOG",
  ]);
  worksheet.mergeCells(1, 1, 1, totalCols);
  r1.height = 32;
  r1.getCell(1).font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  r1.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
  r1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  // Subtitle
  const r2 = worksheet.addRow([
    options?.title ||
      (isAr
        ? `تاريخ الاستخراج: ${dateStr} ${timeStr} | إجمالي المواد: ${items.length}`
        : `Exported: ${dateStr} ${timeStr} | Total Registered Materials: ${items.length}`),
  ]);
  worksheet.mergeCells(2, 1, 2, totalCols);
  r2.height = 24;
  r2.getCell(1).font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF475569" } };
  r2.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  r2.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]); // Blank row

  // Headers
  const headers = isAr
    ? [
        "م",
        "كود الصنف (SKU)",
        "اسم المادة",
        "التصنيف",
        "مكان التخزين",
        "الرصيد المتاح",
        "حد الأمان الأدنى",
        "الوحدة",
        "حالة المخزون",
        "المواصفات والملاحظات",
      ]
    : [
        "No.",
        "Item Code (SKU)",
        "Material Name",
        "Category",
        "Storage Location",
        "Current Stock",
        "Safety Minimum",
        "Unit",
        "Stock Status",
        "Specifications / Notes",
      ];

  const headerRow = worksheet.addRow(headers);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "medium", color: { argb: "FF172554" } },
      left: { style: "thin", color: { argb: "FF3B82F6" } },
      bottom: { style: "medium", color: { argb: "FF172554" } },
      right: { style: "thin", color: { argb: "FF3B82F6" } },
    };
  });

  // Data rows
  let totalStock = 0;
  items.forEach((item, index) => {
    totalStock += item.currentStock;
    let statusText = isAr ? "متوفر" : "IN STOCK";
    let statusColor = "FF15803D"; // Green
    let statusBg = "FFDCFCE7";

    if (item.currentStock <= 0) {
      statusText = isAr ? "نفد من المستودع" : "OUT OF STOCK";
      statusColor = "FFB91C1C";
      statusBg = "FFFEE2E2";
    } else if (item.currentStock <= item.minStock) {
      statusText = isAr ? "تحت حد الأمان" : "LOW SAFETY STOCK";
      statusColor = "FFB45309";
      statusBg = "FFFEF3C7";
    }

    const row = worksheet.addRow([
      index + 1,
      item.itemCode,
      item.name,
      item.category || (isAr ? "عام" : "General"),
      item.location,
      item.currentStock,
      item.minStock,
      item.unit || "PCS",
      statusText,
      item.description || "",
    ]);

    row.height = 22;
    const isEven = index % 2 === 0;
    const rowBg = isEven ? "FFFFFFFF" : "FFF8FAFC";

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      if (colNumber === 1 || colNumber === 8) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNumber === 2) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.font = { name: "Consolas", size: 10, bold: true, color: { argb: "FF0F172A" } };
      } else if (colNumber === 6 || colNumber === 7) {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } };
      } else if (colNumber === 9) {
        cell.font = { name: "Calibri", size: 9, bold: true, color: { argb: statusColor } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: statusBg } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      }
    });
  });

  // Footer Row
  worksheet.addRow([]);
  const summaryRow = worksheet.addRow([
    isAr ? "الإجمالي الكلي" : "TOTAL",
    "",
    `${items.length} ${isAr ? "أصناف مسجلة" : "Materials"}`,
    "",
    "",
    totalStock,
    "",
    "",
    "",
    "",
  ]);
  summaryRow.height = 26;
  summaryRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FF0F172A" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "medium", color: { argb: "FF64748B" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "double", color: { argb: "FF0F172A" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } },
    };
  });

  await downloadWorkbook(workbook, filename);
}

export interface LedgerExcelItemInput {
  timestamp: string | Date;
  transactionType: string;
  voucherReference: string;
  materialCode: string;
  materialName: string;
  quantityDelta: number;
  balanceAfter: number;
  operator: string;
  notes?: string | null;
}

/**
 * Exports Inventory Movement Ledger to a formatted Microsoft Excel (.xlsx) workbook
 */
export async function exportLedgerExcelReport(
  filename: string,
  entries: LedgerExcelItemInput[],
  options?: { isArabic?: boolean }
) {
  const isAr = options?.isArabic ?? false;
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0];

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sinoma CDI Contracting - ERP";
  workbook.created = now;

  const sheetName = isAr ? "سجل حركات المخزون" : "Movement Ledger";
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true, ...(isAr ? { rightToLeft: true } : {}) } as any],
    pageSetup: { orientation: "landscape", fitToPage: true },
  });

  worksheet.columns = [
    { key: "no", width: 8 },
    { key: "timestamp", width: 22 },
    { key: "type", width: 18 },
    { key: "voucher", width: 20 },
    { key: "sku", width: 18 },
    { key: "material", width: 30 },
    { key: "delta", width: 16 },
    { key: "balance", width: 16 },
    { key: "operator", width: 22 },
    { key: "notes", width: 28 },
  ];

  const totalCols = 10;

  // Banner
  const r1 = worksheet.addRow([
    isAr
      ? "شركة سينوما للمقاولات العامة - سجل حركات المواد وحساب المخزون (Ledger)"
      : "SINOMA CDI CONTRACTING - INVENTORY MOVEMENT AUDIT LEDGER",
  ]);
  worksheet.mergeCells(1, 1, 1, totalCols);
  r1.height = 32;
  r1.getCell(1).font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
  r1.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
  r1.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  // Subtitle
  const r2 = worksheet.addRow([
    isAr
      ? `تاريخ الاستخراج: ${dateStr} ${timeStr} | إجمالي الحركات: ${entries.length}`
      : `Generated: ${dateStr} ${timeStr} | Total Movements: ${entries.length}`,
  ]);
  worksheet.mergeCells(2, 1, 2, totalCols);
  r2.height = 24;
  r2.getCell(1).font = { name: "Calibri", size: 10, italic: true, color: { argb: "FF475569" } };
  r2.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
  r2.getCell(1).alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]);

  // Headers
  const headers = isAr
    ? [
        "م",
        "التاريخ والوقت",
        "نوع الحركة",
        "رقم السند المرجعي",
        "كود الصنف",
        "اسم المادة",
        "التغير بالكمية",
        "الرصيد بعد الحركة",
        "المسؤول / أمين المخزن",
        "ملاحظات",
      ]
    : [
        "No.",
        "Timestamp",
        "Movement Type",
        "Voucher Reference",
        "Item Code (SKU)",
        "Material Name",
        "Quantity Delta",
        "Balance After",
        "Operator / Storekeeper",
        "Notes",
      ];

  const hRow = worksheet.addRow(headers);
  hRow.height = 28;
  hRow.eachCell((cell) => {
    cell.font = { name: "Calibri", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0369A1" } }; // Sky-700
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = {
      top: { style: "medium", color: { argb: "FF075985" } },
      left: { style: "thin", color: { argb: "FF38BDF8" } },
      bottom: { style: "medium", color: { argb: "FF075985" } },
      right: { style: "thin", color: { argb: "FF38BDF8" } },
    };
  });

  // Data rows
  entries.forEach((entry, idx) => {
    const isPositive = entry.quantityDelta > 0;
    const deltaFormatted = isPositive ? `+${entry.quantityDelta}` : `${entry.quantityDelta}`;
    const dateFormatted =
      entry.timestamp instanceof Date
        ? entry.timestamp.toLocaleString()
        : new Date(entry.timestamp).toLocaleString();

    const row = worksheet.addRow([
      idx + 1,
      dateFormatted,
      entry.transactionType,
      entry.voucherReference,
      entry.materialCode,
      entry.materialName,
      deltaFormatted,
      entry.balanceAfter,
      entry.operator,
      entry.notes || "",
    ]);

    row.height = 22;
    const isEven = idx % 2 === 0;
    const rowBg = isEven ? "FFFFFFFF" : "FFF8FAFC";

    row.eachCell((cell, colNumber) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF1E293B" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: rowBg } };
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };

      if (colNumber === 1 || colNumber === 2 || colNumber === 5) {
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (colNumber === 7) {
        // Delta
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.font = {
          name: "Calibri",
          size: 10,
          bold: true,
          color: { argb: isPositive ? "FF15803D" : "FFB91C1C" },
        };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: isPositive ? "FFDCFCE7" : "FFFEE2E2" },
        };
      } else if (colNumber === 8) {
        cell.alignment = { horizontal: "right", vertical: "middle" };
        cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FF0F172A" } };
      }
    });
  });

  await downloadWorkbook(workbook, filename);
}
