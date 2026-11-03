# Contract: Units of Measure (UOM) API & Server Actions

**Feature**: [spec.md](../spec.md) | **Protocol**: Next.js Server Actions & REST API

## 1. List Units of Measure
* **Request**: `GET /api/units`
* **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "3f9a9a30-6dbb-435f-bfb3-b45a6c382103",
      "name": "Kilogram",
      "abbreviation": "KG",
      "code": "2",
      "description": "Standard metric weight"
    },
    {
      "id": "4f9a9a30-6dbb-435f-bfb3-b45a6c382104",
      "name": "50kg Bag",
      "abbreviation": "BAG",
      "code": "1",
      "description": "Cement and dry powder bags"
    }
  ]
}
```

---

## 2. Create Unit of Measure
* **Request**: `POST /api/units` / Server Action `createUnitOfMeasure`
* **Validation (Zod)**:
```typescript
z.object({
  name: z.string().min(2).max(100),
  abbreviation: z.string().min(1).max(15).toUpperCase(),
  code: z.string().regex(/^[0-9]{1,3}$/, "Code must be numeric (1-999)"),
  description: z.string().max(250).optional()
});
```
* **Response `201 Created`**: Returns created `UnitOfMeasure` object.

