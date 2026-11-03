# Contract: Inventory Ledger (Audit Trail) API

**Feature**: [spec.md](../spec.md) | **Protocol**: Read-Only Query API & Server Component Fetcher

## 1. Query Inventory Ledger

### Request: `GET /api/ledger`
* **Query Parameters**:
  * `materialId` (optional UUID): Filter movements for a single item.
  * `transactionType` (optional enum: `MATERIAL_IN`, `MATERIAL_OUT`, `ADJUSTMENT`).
  * `startDate` (optional ISO date string).
  * `endDate` (optional ISO date string).
  * `page` (number, default: 1).
  * `pageSize` (number, default: 50).

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "18c1b6fe-ea99-4629-9e86-4f4044b7d19e",
      "timestamp": "2026-10-29T11:00:00.000Z",
      "materialId": "c3b9b4f2-9590-4e31-893f-c1f516622384",
      "itemCode": "STEEL-REBAR-16MM",
      "materialName": "Deformed Steel Rebar 16mm",
      "transactionType": "MATERIAL_OUT",
      "voucherReference": "MO-202610-0001",
      "quantityDelta": -1000.0,
      "balanceAfter": 11500.0,
      "operator": "Ahmed Warehouse Officer",
      "notes": "Issued to Sinoma Clinker Line Project"
    },
    {
      "id": "893c5bc4-7dc4-4d23-958a-3e4ef2286a11",
      "timestamp": "2026-10-29T08:30:00.000Z",
      "materialId": "c3b9b4f2-9590-4e31-893f-c1f516622384",
      "itemCode": "STEEL-REBAR-16MM",
      "materialName": "Deformed Steel Rebar 16mm",
      "transactionType": "MATERIAL_IN",
      "voucherReference": "MI-202610-0001",
      "quantityDelta": 2500.0,
      "balanceAfter": 12500.0,
      "operator": "Ahmed Warehouse Officer",
      "notes": "Received from Sinoma Building Materials Ltd."
    }
  ],
  "pagination": {
    "total": 2,
    "page": 1,
    "pageSize": 50,
    "totalPages": 1
  }
}
```

