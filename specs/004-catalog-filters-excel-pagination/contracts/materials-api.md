# Contract: Materials Server Actions & Upload API

## 1. Materials Server Action: `getMaterials`

```ts
export async function getMaterials(params?: {
  query?: string;
  categoryId?: string;
  stockStatus?: "ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK";
  maxStock?: number;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: any[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}>
```

### Filtering Logic
- `stockStatus === "LOW_STOCK"`: `where.currentStock = { lte: prisma.material.fields.minStock }`
- `stockStatus === "OUT_OF_STOCK"`: `where.currentStock = { lte: 0 }`
- `stockStatus === "IN_STOCK"`: `where.currentStock = { gt: prisma.material.fields.minStock }`
- `maxStock !== undefined && !isNaN(maxStock)`:
  - If `stockStatus` already set, combines conditions using `AND`:
    `{ currentStock: { lte: maxStock } }`
  - Otherwise: `where.currentStock = { lte: maxStock }`

---

## 2. Upload API Route: `POST /api/upload`

### Allowed Formats
- MIME types: `["image/jpeg", "image/png", "image/webp", "image/avif", "image/jfif", "image/pjpeg", "image/bmp", "image/svg+xml"]`
- Allowed extensions: `[".jpg", ".jpeg", ".png", ".webp", ".avif", ".jfif", ".bmp", ".svg"]` (case-insensitive)

### Return Payload
```json
{
  "success": true,
  "url": "/uploads/materials/[unique-filename]",
  "imageUrl": "/uploads/materials/[unique-filename]",
  "fileName": "[unique-filename]"
}
```

---

## 3. Reorder CSV Export Contract: `exportReorderReportToCsv`

```ts
export function exportReorderReportToCsv(
  filename: string,
  items: {
    itemCode: string;
    name: string;
    category: string;
    location: string;
    currentStock: number;
    minStock: number;
    unit: string;
  }[],
  meta?: {
    title?: string;
    warehouseName?: string;
    generatedBy?: string;
  }
): void
```

