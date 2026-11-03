# Phase 1 Data Model: Stock Threshold Filtering, Universal Image Upload, Selective Excel Reports, and Interactive Pagination

## 1. Parameters & Query Contracts

### Material Query Parameters (`GetMaterialsParams`)
```ts
export type StockStatusFilter = "ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK";

export interface GetMaterialsParams {
  query?: string;              // Search SKU, name, or storage location
  categoryId?: string;         // Filter by specific Category UUID or "ALL"
  stockStatus?: StockStatusFilter; // Filter by safety status
  maxStock?: number;           // Numeric threshold filter (currentStock <= maxStock)
  page?: number;               // 1-based page index (default: 1)
  limit?: number;              // Items per page (default: 20)
}
```

### Material Query Response (`GetMaterialsResponse`)
```ts
export interface GetMaterialsResponse {
  success: boolean;
  data?: MaterialRecord[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}
```

---

## 2. Reorder Report Projection Model (`ReorderReportItem`)

```ts
export interface ReorderReportItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  location: string;
  currentStock: number;
  minStock: number;
  reorderDeficit: number; // Math.max(0, minStock - currentStock)
  unit: string;
  status: "CRITICAL" | "LOW_STOCK" | "IN_STOCK";
}
```

---

## 3. Upload Contract

### Request: `multipart/form-data`
- `file`: Binary image file (MIME types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/jfif`, `image/pjpeg`, `image/bmp`, `image/svg+xml`, max 10MB)

### Response:
```json
{
  "success": true,
  "url": "/uploads/materials/mat-1730310000000-a1b2c3.avif",
  "imageUrl": "/uploads/materials/mat-1730310000000-a1b2c3.avif",
  "fileName": "mat-1730310000000-a1b2c3.avif"
}
```

