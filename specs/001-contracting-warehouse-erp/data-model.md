# Data Model Specification: Contracting Warehouse ERP

**Feature**: [spec.md](spec.md) | **Branch**: `001-contracting-warehouse-erp` | **Date**: 2026-10-29

## Overview
This document specifies the PostgreSQL relational data model, entity relationships, integrity constraints, and state transitions for the Contracting Warehouse ERP.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    Material ||--o{ MaterialInItem : "referenced in receipts"
    Material ||--o{ MaterialOutItem : "referenced in issuances"
    Material ||--o{ InventoryLedger : "tracked in ledger"

    MaterialInVoucher ||--|{ MaterialInItem : "contains lines"
    MaterialOutVoucher ||--|{ MaterialOutItem : "contains lines"

    Material {
        uuid id PK
        string itemCode UK "Unique SKU/Code (indexed)"
        string name "Material Name"
        string category "Category (Civil, Electrical, etc.)"
        string unit "Unit of Measure (PCS, KG, METER, etc.)"
        float minStock "Safety stock alert threshold"
        float currentStock "Authoritative on-hand balance (>= 0)"
        string location "Warehouse bin / rack location"
        string description "Optional description"
        datetime createdAt
        datetime updatedAt
    }

    MaterialInVoucher {
        uuid id PK
        string voucherNo UK "Unique Voucher Number (e.g. MI-202610-001)"
        datetime date "Date of Receipt"
        string supplierName "Vendor / Supplier Name"
        string poNumber "Purchase Order Reference"
        string deliveryNote "Delivery Note Reference"
        string receivedBy "Warehouse Receiving Officer"
        string notes "Remarks"
        string status "COMPLETED | CANCELLED"
        datetime createdAt
    }

    MaterialInItem {
        uuid id PK
        uuid voucherId FK
        uuid materialId FK
        float quantity "Received Quantity (> 0)"
        float unitPrice "Reference unit price"
        string notes "Item remarks"
    }

    MaterialOutVoucher {
        uuid id PK
        string voucherNo UK "Unique Voucher Number (e.g. MO-202610-001)"
        datetime date "Date of Issuance"
        string projectName "Destination Project / Site"
        string requisitionNo "Material Requisition Note #"
        string recipient "Engineer / Contractor Recipient"
        string issuedBy "Warehouse Issuing Officer"
        string notes "Purpose or remarks"
        string status "COMPLETED | CANCELLED"
        datetime createdAt
    }

    MaterialOutItem {
        uuid id PK
        uuid voucherId FK
        uuid materialId FK
        float quantity "Issued Quantity (> 0)"
        string notes "Item remarks"
    }

    InventoryLedger {
        uuid id PK
        datetime timestamp "Transaction Timestamp (indexed)"
        uuid materialId FK "Material Reference (indexed)"
        string transactionType "MATERIAL_IN | MATERIAL_OUT | ADJUSTMENT"
        string voucherReference "Linked Voucher # (MI-... / MO-...)"
        float quantityDelta "Change amount (+ for IN, - for OUT)"
        float balanceAfter "Resulting on-hand stock"
        string operator "Executing user"
        string notes "Audit notes"
    }
```

---

## Entity Details & Validation Rules

### 1. `Material`
* **Constraints**:
  * `itemCode`: Required, Unique, Uppercase alphanumeric (`^[A-Z0-9_-]+$`).
  * `name`: Required, min 2 characters, max 150 characters.
  * `category`: Required (e.g., `Civil`, `Piping`, `Electrical`, `Mechanical`, `Safety`, `Tools`).
  * `unit`: Required (e.g., `PCS`, `KG`, `METER`, `BAG`, `BOX`, `DRUM`, `LITER`).
  * `minStock`: Required, `>= 0`, default `0`.
  * `currentStock`: Required, check constraint `currentStock >= 0`.
* **State & Derived Logic**:
  * `isLowStock`: Virtual boolean derived when `currentStock <= minStock`.

### 2. `MaterialInVoucher` & `MaterialInItem`
* **Constraints**:
  * `voucherNo`: Generated automatically or unique user input (`MI-YYYYMM-XXXX`).
  * `date`: Required date (cannot be in the far future).
  * `supplierName`: Required, non-empty.
  * `poNumber` / `deliveryNote`: At least one reference document required.
  * `items`: Must contain at least 1 line item.
  * `quantity`: Required, strictly `> 0`.

### 3. `MaterialOutVoucher` & `MaterialOutItem`
* **Constraints**:
  * `voucherNo`: Generated automatically or unique user input (`MO-YYYYMM-XXXX`).
  * `date`: Required date.
  * `projectName`: Required, non-empty.
  * `recipient`: Required, non-empty.
  * `items`: Must contain at least 1 line item.
  * `quantity`: Required, strictly `> 0`, and `<= currentStock` of the target material.

### 4. `InventoryLedger` (Immutable Audit Log)
* **Constraints**:
  * Read-only table: Records can only be inserted via atomic database transactions during voucher processing.
  * `quantityDelta`:
    * If `transactionType == 'MATERIAL_IN'`, `quantityDelta > 0`.
    * If `transactionType == 'MATERIAL_OUT'`, `quantityDelta < 0`.
  * `balanceAfter`: Reflects the exact `Material.currentStock` immediately following the transaction.

---

## Transactional State Transitions

### Material In Intake Flow
1. User submits Material In form via React Hook Form + Zod.
2. Server opens PostgreSQL transaction (`prisma.$transaction`):
   * Insert `MaterialInVoucher` and nested `MaterialInItem` records.
   * For each line item:
     * Increment `Material.currentStock` by `item.quantity`.
     * Insert `InventoryLedger` with delta `+item.quantity` and resulting balance.
3. Transaction commits; triggers toast notification and path revalidation.

### Material Out Issuance Flow
1. User submits Material Out form.
2. Server opens PostgreSQL transaction (`prisma.$transaction`):
   * Verify all requested materials have `currentStock >= requestedQuantity`. If any fails, rollback and throw an `InsufficientStockError`.
   * Insert `MaterialOutVoucher` and nested `MaterialOutItem` records.
   * For each line item:
     * Decrement `Material.currentStock` conditionally: `WHERE id = $id AND currentStock >= $qty`.
     * Insert `InventoryLedger` with delta `-item.quantity` and resulting balance.
3. Transaction commits; triggers toast notification and path revalidation.

