# Contract: Material Out (Issuances) API & Server Actions

**Feature**: [spec.md](../spec.md) | **Protocol**: Next.js Server Actions & REST API

## 1. List Material Out Vouchers

### Request: `GET /api/material-out`
* **Query Parameters**:
  * `startDate` (optional ISO date): Filter issuances after date.
  * `endDate` (optional ISO date): Filter issuances before date.
  * `project` (optional string): Filter by project name.
  * `query` (optional string): Search by voucher number or requisition number.

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "e21b714b-2d7c-471a-a1b9-39908cf8129a",
      "voucherNo": "MO-202610-0001",
      "date": "2026-10-29T11:00:00.000Z",
      "projectName": "Sinoma Clinker Line Project",
      "requisitionNo": "REQ-SITE-0442",
      "recipient": "Eng. Khaled (Civil Contractor)",
      "issuedBy": "Ahmed Warehouse Officer",
      "totalItemsCount": 1,
      "items": [
        {
          "materialId": "c3b9b4f2-9590-4e31-893f-c1f516622384",
          "itemCode": "STEEL-REBAR-16MM",
          "name": "Deformed Steel Rebar 16mm",
          "quantity": 1000.0,
          "unit": "KG"
        }
      ]
    }
  ]
}
```

---

## 2. Create Material Out Voucher

### Server Action / Request: `POST /api/material-out`
* **Schema Validation (Zod)**:
```typescript
z.object({
  voucherNo: z.string().optional(), // Auto-generated if omitted
  date: z.string().datetime(),
  projectName: z.string().min(2).max(150),
  requisitionNo: z.string().min(1).max(100),
  recipient: z.string().min(2).max(100),
  issuedBy: z.string().min(2).max(100),
  notes: z.string().max(500).optional(),
  items: z.array(
    z.object({
      materialId: z.string().uuid(),
      quantity: z.number().positive("Quantity must be greater than 0"),
      notes: z.string().max(250).optional()
    })
  ).min(1, "Voucher must contain at least one line item")
});
```

### Execution Guarantee & Concurrency Control:
Executes within a PostgreSQL ACID transaction:
1. Validates that `currentStock >= requestedQuantity` for every line item using row-level locking:
   `SELECT id, "currentStock" FROM "Material" WHERE id IN (...) FOR UPDATE;`
2. If any line item exceeds available stock, aborts transaction immediately and returns `422 Unprocessable Entity` with details:
   ```json
   {
     "success": false,
     "error": "INSUFFICIENT_STOCK",
     "message": "Cannot issue 1000 KG of Deformed Steel Rebar 16mm. Only 400 KG currently available on hand."
   }
   ```
3. Creates `MaterialOutVoucher` record.
4. Creates `MaterialOutItem` rows.
5. Decrements `Material.currentStock` by `quantity`.
6. Appends an entry to `InventoryLedger` with `transactionType: "MATERIAL_OUT"`, `quantityDelta: -quantity`, and the resulting `balanceAfter`.

### Response `201 Created`
```json
{
  "success": true,
  "message": "Material Out voucher recorded successfully. Inventory updated.",
  "data": {
    "voucherNo": "MO-202610-0001",
    "issuedItems": 1
  }
}
```

