# Contract: Categories API & Server Actions

**Feature**: [spec.md](../spec.md) | **Protocol**: Next.js Server Actions & REST API

## 1. List Categories
* **Request**: `GET /api/categories`
* **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "id": "1e9a9a30-6dbb-435f-bfb3-b45a6c382101",
      "name": "Civil Works",
      "code": "1",
      "description": "Concrete, rebar, cement, and structural materials",
      "_count": { "materials": 14 }
    },
    {
      "id": "2e9a9a30-6dbb-435f-bfb3-b45a6c382102",
      "name": "Piping & Valves",
      "code": "4",
      "description": "Pipes, flanges, fittings, and industrial valves",
      "_count": { "materials": 8 }
    }
  ]
}
```

---

## 2. Create Category
* **Request**: `POST /api/categories` / Server Action `createCategory`
* **Validation (Zod)**:
```typescript
z.object({
  name: z.string().min(2).max(100),
  code: z.string().regex(/^[0-9]{1,3}$/, "Code must be numeric (1-999)"),
  description: z.string().max(250).optional()
});
```
* **Response `201 Created`**: Returns created `Category` object.

