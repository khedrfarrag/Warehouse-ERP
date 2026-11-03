# Quickstart & Verification Guide: Contracting Warehouse ERP

**Feature**: [spec.md](spec.md) | **Branch**: `001-contracting-warehouse-erp` | **Date**: 2026-10-29

## Prerequisites
* Node.js 20+ installed
* PostgreSQL instance running (local or cloud container)
* Environment variable set: `DATABASE_URL="postgresql://user:password@localhost:5432/warehouse_erp?schema=public"`

---

## Setup & Initialization Commands

```bash
# 1. Install project dependencies
npm install

# 2. Run database migrations and generate Prisma client
npx prisma migrate dev --name init_contracting_erp
npx prisma db seed # (optional test materials seed)

# 3. Start Next.js development server
npm run dev
```

Open browser to `http://localhost:3000`.

---

## End-to-End Verification Scenarios

### Scenario 1: Register New Material in Catalog
1. Navigate to the Material Catalog screen (`/materials`).
2. Click **Add New Material**.
3. Fill the form with:
   * **Item Code**: `CEM-OPC-50KG`
   * **Name**: `Ordinary Portland Cement 50kg Bags`
   * **Category**: `Civil`
   * **Unit**: `BAG`
   * **Min Safety Stock**: `100`
   * **Storage Location**: `Warehouse A - Bay 1`
4. Submit form.
5. **Expected Outcome**:
   * Motion animation closes modal smoothly.
   * Sonner toast displays: *"Material registered successfully"*.
   * Item appears with `currentStock: 0` and low-stock badge active (since `0 <= 100`).

---

### Scenario 2: Receive Stock via Material In
1. Navigate to **Material In** (`/material-in`).
2. Click **New Material In Voucher**.
3. Fill voucher header:
   * **Supplier**: `Sinoma Cement Corp.`
   * **Delivery Note**: `DN-2026-001`
   * **Received By**: `Warehouse Clerk`
4. Add Line Item:
   * Select `CEM-OPC-50KG`
   * **Quantity**: `500`
5. Submit voucher.
6. **Expected Outcome**:
   * Sonner toast confirms: *"Material In voucher recorded successfully"*.
   * Navigating to `/materials` shows `currentStock: 500`. Low-stock warning is cleared.
   * Navigating to `/ledger` displays an immutable `MATERIAL_IN` row with `quantityDelta: +500`, `balanceAfter: 500`.

---

### Scenario 3: Issue Stock via Material Out & Test Invariant Protection
1. Navigate to **Material Out** (`/material-out`).
2. Click **New Material Out Voucher**.
3. Fill voucher details:
   * **Project**: `Phase 2 Foundation Pouring`
   * **Requisition #**: `REQ-901`
   * **Recipient**: `Eng. Tarek`
4. Test Insufficient Stock Guard:
   * Select `CEM-OPC-50KG`
   * Input **Quantity**: `600` (exceeds current stock 500)
   * Submit form.
   * **Expected Outcome**: Submission is blocked. Error toast appears: *"Cannot issue 600 BAGs. Only 500 BAGs available on hand."*
5. Correct Quantity:
   * Change **Quantity** to `200`.
   * Submit form.
6. **Expected Outcome**:
   * Sonner toast confirms issuance.
   * `/materials` displays `currentStock: 300`.
   * `/ledger` shows an immutable `MATERIAL_OUT` entry with `quantityDelta: -200`, `balanceAfter: 300`.

---

### Scenario 4: Domain Terminology & UI Navigation Validation
1. Verify the top navigation bar.
2. **Verification Check**:
   * Confirm labels are strictly: **Materials**, **Material In**, **Material Out**, **Ledger**.
   * Confirm zero references exist to legacy labels `Goods In` or `Goods Out`.

