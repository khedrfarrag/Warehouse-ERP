# Contract: Advanced Paginated Material Selector API

**Feature**: [spec.md](../spec.md) | **Protocol**: Server Component Fetcher / REST API

## Material Selector Query (Paginated at 20 items)
* **Endpoint**: `GET /api/materials/picker`
* **Query Parameters**:
  * `query` (optional string): Case-insensitive match on itemCode, name, or location.
  * `categoryId` (optional string): Filter by Category ID.
  * `page` (number, default: 1): Current page.
  * `limit` (fixed: 20): Items per page.

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "c3b9b4f2-9590-4e31-893f-c1f516622384",
      "itemCode": "EGY-15200001",
      "name": "Deformed Steel Rebar 16mm",
      "category": { "id": "...", "name": "Civil Works", "code": "1" },
      "unit": { "id": "...", "name": "Kilogram", "abbreviation": "KG" },
      "imageUrl": "/uploads/materials/rebar-16.webp",
      "currentStock": 12500.0,
      "location": "Yard 2 - Bay C"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "hasMore": true
  }
}
```

