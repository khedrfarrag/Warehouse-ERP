# Contract: Material In (Receipts) API & Server Actions

**Feature**: [spec.md](../spec.md) | **Protocol**: Next.js Server Actions & REST API

## 1. List Material In Vouchers

### Request: `GET /api/material-in`
* **Query Parameters**:
  * `startDate` (optional ISO date): Filter receipts after date.
  * `endDate` (optional ISO date): Filter receipts before date.
  * `supplier` (optional string): Filter by supplier name.
  * `query` (optional string): Search by voucher number or PO number.

### Response `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "7a35e4e8-8b92-4876-8051-93e115fa7ef4",
      "voucherNo": "MI-202610-0001",
      "date": "2026-10-29T08:30:00.000Z",
      "supplierName": "Sinoma Building Materials Ltd.",
      "poNumber": "PO-99412",
      "deliveryNote": "DN-88120",
      "receivedBy": "Ahmed Warehouse Officer",
      "totalItemsCount": 2,
      "items": [
        {
          "materialId": "c3b9b4f2-9590-4e31-893f-c1f516622384",
          "itemCode": "STEEL-REBAR-16MM",
          "name": "Deformed Steel Rebar 16mm",
          "quantity": 2500.0,
          "unit": "KG",
          "unitPrice": 1.25
        }
      ]
    }
  ]
}
```

---

## 2. Create Material In Voucher

### Server Action / Request: `POST /api/material-in`
* **Schema Validation (Zod)**:
```typescript
z.object({
  voucherNo: z.string().optional(), // Auto-generated if omitted
  date: z.string().datetime(),
  supplierName: z.string().min(2).max(150),
  poNumber: z.string().max(100).optional(),
  deliveryNote: z.string().max(100).optional(),
  receivedBy: z.string().min(2).max(100),
  notes: z.string().max(500).optional(),
  items: z.array(
    z.object({
      materialId: z.string().uuid(),
      quantity: z.number().positive("Quantity must be greater than 0"),
      unitPrice: z.number().nonnegative().optional(),
      notes: z.string().max(250).optional()
    })
  ).min(1, "Voucher must contain at least one line item")
});
```

### Execution Guarantee:
Executes within a PostgreSQL ACID transaction:
1. Creates `MaterialInVoucher` record.
2. Creates `MaterialInItem` rows.
3. For each line item:
   - Increments `Material.currentStock` by `quantity`.
   - Appends an entry to `InventoryLedger` with `transactionType: "MATERIAL_IN"`, `quantityDelta: +quantity`, and the resulting `balanceAfter`.

### Response `201 Created`
```json
{
  "success": true,
  "message": "Material In voucher recorded successfully. Inventory updated.",
  "data": {
    "voucherNo": "MI-202610-0001",
    "receivedItems": 2
  }
}
```

