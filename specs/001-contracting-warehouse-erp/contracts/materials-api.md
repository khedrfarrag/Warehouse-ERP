# Contract: Materials Catalog API & Server Actions

**Feature**: [spec.md](../spec.md) | **Protocol**: Next.js Server Actions & REST API

## 1. List Materials (with Filtering & Search)

### Request: `GET /api/materials`
* **Query Parameters**:
  * `query` (optional string): Search term for `itemCode`, `name`, or `category`.
  * `category` (optional string): Filter by category.
  * `lowStock` (optional boolean): Filter materials where `currentStock <= minStock`.
  * `page` (number, default: 1): Pagination page number.
  * `pageSize` (number, default: 20): Page size.

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "c3b9b4f2-9590-4e31-893f-c1f516622384",
      "itemCode": "STEEL-REBAR-16MM",
      "name": "Deformed Steel Rebar 16mm Grade 60",
      "category": "Civil",
      "unit": "KG",
      "minStock": 5000.0,
      "currentStock": 12500.0,
      "location": "Yard 2 - Bay C",
      "isLowStock": false,
      "createdAt": "2026-10-29T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

---

## 2. Create Material

### Server Action / Request: `POST /api/materials`
* **Schema Validation (Zod)**:
```typescript
z.object({
  itemCode: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/),
  name: z.string().min(2).max(150),
  category: z.string().min(2).max(50),
  unit: z.enum(["PCS", "KG", "METER", "BAG", "BOX", "DRUM", "LITER", "SET", "ROLL"]),
  minStock: z.number().min(0).default(0),
  location: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});
```

### Response `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "c3b9b4f2-9590-4e31-893f-c1f516622384",
    "itemCode": "STEEL-REBAR-16MM",
    "name": "Deformed Steel Rebar 16mm Grade 60",
    "category": "Civil",
    "unit": "KG",
    "minStock": 5000.0,
    "currentStock": 0.0,
    "location": "Yard 2 - Bay C"
  }
}
```

### Error Responses
* `400 Bad Request`: Validation failure (e.g. invalid unit or missing required field).
* `409 Conflict`: Item code already exists.

