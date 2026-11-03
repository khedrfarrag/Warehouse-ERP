# Contract: Server Actions API for CRUD & Cancellations

## 1. Material Actions (`src/server/actions/materials.ts`)

### `updateMaterial(id: string, input: UpdateMaterialInput)`
- **Input**:
  ```ts
  interface UpdateMaterialInput {
    name?: string;
    categoryId?: string;
    unitId?: string;
    location?: string;
    minStock?: number;
    imageUrl?: string | null;
    description?: string | null;
  }
  ```
- **Response**: `{ success: true; data: Material } | { success: false; error: string }`

### `deleteMaterial(id: string)`
- **Validation**:
  - Checks `materialInItems`, `materialOutItems`, `ledgerEntries`.
  - Rejects if any linked records exist.
- **Response**: `{ success: true } | { success: false; error: string }`

---

## 2. Category Actions (`src/server/actions/categories.ts`)

### `updateCategory(id: string, input: UpdateCategoryInput)`
- **Input**:
  ```ts
  interface UpdateCategoryInput {
    name: string;
    code: string;
    description?: string | null;
  }
  ```
- **Response**: `{ success: true; data: Category } | { success: false; error: string }`

### `deleteCategory(id: string)`
- **Validation**: Checks `materials.length`. Rejects if linked.
- **Response**: `{ success: true } | { success: false; error: string }`

---

## 3. Unit of Measure Actions (`src/server/actions/units.ts`)

### `updateUnitOfMeasure(id: string, input: UpdateUomInput)`
- **Input**:
  ```ts
  interface UpdateUomInput {
    name: string;
    abbreviation: string;
    code: string;
    description?: string | null;
  }
  ```
- **Response**: `{ success: true; data: UnitOfMeasure } | { success: false; error: string }`

### `deleteUnitOfMeasure(id: string)`
- **Validation**: Checks `materials.length`. Rejects if linked.
- **Response**: `{ success: true } | { success: false; error: string }`

---

## 4. Voucher Actions (`src/server/actions/material-in.ts` & `material-out.ts`)

### `cancelMaterialInVoucher(voucherId: string, reason?: string)`
- **Pre-conditions**:
  - Voucher exists and `status === "COMPLETED"`.
  - For each item, `Material.currentStock - item.quantity >= 0`. (Fails if material was already consumed).
- **Execution in `$transaction`**:
  - Update `MaterialInVoucher.status = "CANCELLED"`.
  - For each item, decrement `Material.currentStock` by `item.quantity`.
  - Insert `InventoryLedger` entry: `transactionType = ADJUSTMENT`, `quantityDelta = -item.quantity`, `notes = "Cancelled voucher: [reason]"`.
- **Response**: `{ success: true; voucherNo: string } | { success: false; error: string }`

### `cancelMaterialOutVoucher(voucherId: string, reason?: string)`
- **Pre-conditions**:
  - Voucher exists and `status === "COMPLETED"`.
- **Execution in `$transaction`**:
  - Update `MaterialOutVoucher.status = "CANCELLED"`.
  - For each item, increment `Material.currentStock` by `item.quantity`.
  - Insert `InventoryLedger` entry: `transactionType = ADJUSTMENT`, `quantityDelta = +item.quantity`, `notes = "Cancelled voucher: [reason]"`.
- **Response**: `{ success: true; voucherNo: string } | { success: false; error: string }`

