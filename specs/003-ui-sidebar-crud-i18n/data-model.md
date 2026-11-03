# Phase 1 Data Model: Enterprise UI Layout, Complete CRUD, and Bilingual Arabic/English

## 1. Entities & Relational Schema

### Category (`Category`)
- `id`: String (UUID, Primary Key)
- `name`: String (Unique)
- `code`: String (Unique, 1-3 digit string, e.g. "1")
- `description`: String (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relationships**:
  - `materials`: One-to-Many (`Material[]`)
- **Validation Rules**:
  - `name`: Min 2 chars, max 100 chars
  - `code`: String matching `/^\d{1,3}$/`
  - `description`: Optional string max 255 chars
- **Referential Guard**:
  - Prevent deletion if `materials.length > 0`

---

### Unit of Measure (`UnitOfMeasure`)
- `id`: String (UUID, Primary Key)
- `name`: String (Unique, e.g. "Kilogram")
- `abbreviation`: String (Unique, e.g. "KG")
- `code`: String (Unique, 1-3 digit string, e.g. "2")
- `description`: String (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relationships**:
  - `materials`: One-to-Many (`Material[]`)
- **Validation Rules**:
  - `name`: Min 2 chars, max 50 chars
  - `abbreviation`: Min 1 char, max 10 chars, uppercase
  - `code`: String matching `/^\d{1,3}$/`
- **Referential Guard**:
  - Prevent deletion if `materials.length > 0`

---

### Material (`Material`)
- `id`: String (UUID, Primary Key)
- `itemCode`: String (Unique, formatted `EGY-15200001`)
- `name`: String
- `categoryId`: String (Foreign Key -> `Category.id`, nullable)
- `unitId`: String (Foreign Key -> `UnitOfMeasure.id`, nullable)
- `category`: String (Cached category name)
- `unit`: String (Cached unit abbreviation)
- `imageUrl`: String (Path to uploaded image, e.g. `/uploads/materials/...`)
- `minStock`: Float (Default 0.0, non-negative)
- `currentStock`: Float (Default 0.0, non-negative)
- `location`: String (Storage location, e.g. "Warehouse Bay 3, Rack B")
- `description`: String (Optional)
- `createdAt`: DateTime
- `updatedAt`: DateTime
- **Relationships**:
  - `categoryRel`: Many-to-One (`Category`)
  - `unitRel`: Many-to-One (`UnitOfMeasure`)
  - `materialInItems`: One-to-Many (`MaterialInItem[]`)
  - `materialOutItems`: One-to-Many (`MaterialOutItem[]`)
  - `ledgerEntries`: One-to-Many (`InventoryLedger[]`)
- **Referential Guard**:
  - Prevent deletion if linked to any voucher items or ledger entries.

---

### Material In Voucher (`MaterialInVoucher`)
- `id`: String (UUID, Primary Key)
- `voucherNo`: String (Unique, formatted `IN-YYYYMMDD-XXX`)
- `date`: DateTime
- `supplierName`: String
- `poNumber`: String (Optional)
- `deliveryNote`: String (Optional)
- `receivedBy`: String
- `notes`: String (Optional)
- `status`: String (Enum: `COMPLETED` | `CANCELLED`, Default: `COMPLETED`)
- `createdAt`: DateTime
- **State Transition**:
  - `COMPLETED` -> `CANCELLED` (Triggers stock decrement and `ADJUSTMENT` ledger log)
  - `CANCELLED` -> Immutable (no further transitions permitted)

---

### Material Out Voucher (`MaterialOutVoucher`)
- `id`: String (UUID, Primary Key)
- `voucherNo`: String (Unique, formatted `OUT-YYYYMMDD-XXX`)
- `date`: DateTime
- `projectName`: String
- `siteLocation`: String (Specific job site work area)
- `requisitionNo`: String
- `recipient`: String
- `notes`: String (Optional)
- `status`: String (Enum: `COMPLETED` | `CANCELLED`, Default: `COMPLETED`)
- `createdAt`: DateTime
- **State Transition**:
  - `COMPLETED` -> `CANCELLED` (Triggers stock increment and `ADJUSTMENT` ledger log)
  - `CANCELLED` -> Immutable (no further transitions permitted)

---

### Inventory Ledger (`InventoryLedger`)
- `id`: String (UUID, Primary Key)
- `timestamp`: DateTime
- `materialId`: String (Foreign Key -> `Material.id`)
- `transactionType`: Enum (`MATERIAL_IN`, `MATERIAL_OUT`, `ADJUSTMENT`)
- `voucherReference`: String
- `quantityDelta`: Float
- `balanceAfter`: Float
- `operator`: String
- `notes`: String (Optional)
- **Invariant**:
  - Append-only immutable audit trail. Never updated or deleted.

