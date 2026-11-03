# Data Model Specification: Advanced ERP Enhancements

**Feature**: [spec.md](spec.md) | **Branch**: `002-warehouse-erp-enhancements` | **Date**: 2026-10-29

## Overview
This document specifies the enhanced PostgreSQL schema incorporating relational `Category` and `UnitOfMeasure` entities, image storage references on `Material`, and refined construction site location fields on `MaterialOutVoucher`.

---

## Entity Relationship Diagram

```mermaid
erDiagram
    Category ||--o{ Material : "classifies"
    UnitOfMeasure ||--o{ Material : "measures"

    Material ||--o{ MaterialInItem : "inbound lines"
    Material ||--o{ MaterialOutItem : "outbound lines"
    Material ||--o{ InventoryLedger : "ledger history"

    MaterialInVoucher ||--|{ MaterialInItem : "contains"
    MaterialOutVoucher ||--|{ MaterialOutItem : "contains"

    Category {
        uuid id PK
        string name UK "Category Name (e.g. Civil, Electrical)"
        string code UK "Numeric Code (e.g. '1', '2')"
        string description
        datetime createdAt
        datetime updatedAt
    }

    UnitOfMeasure {
        uuid id PK
        string name UK "Unit Name (e.g. Kilogram, Bag)"
        string abbreviation UK "Short code (e.g. KG, BAG, MTR)"
        string code UK "Numeric Code (e.g. '1', '2')"
        string description
        datetime createdAt
        datetime updatedAt
    }

    Material {
        uuid id PK
        string itemCode UK "Smart Structured SKU (e.g. EGY-15200001)"
        string name "Material Name"
        uuid categoryId FK "References Category"
        uuid unitId FK "References UnitOfMeasure"
        string imageUrl "Uploaded photo path (/uploads/materials/...)"
        float minStock "Safety stock alert threshold"
        float currentStock "On-hand balance (>= 0)"
        string location "Storage bin / rack"
        string description "Specifications"
        datetime createdAt
        datetime updatedAt
    }

    MaterialOutVoucher {
        uuid id PK
        string voucherNo UK "Unique Voucher Number (e.g. MO-202610-001)"
        datetime date "Date of Issuance"
        string projectName "Project / Site Name"
        string siteLocation "Specific Construction Area / Work Zone"
        string requisitionNo "Material Requisition Note #"
        string recipient "Site Engineer / Subcontractor"
        string notes "Remarks"
        string status "COMPLETED | CANCELLED"
        datetime createdAt
    }
```

---

## Field Specifications & Validation Rules

### 1. `Category`
* `name`: Required, 2-100 characters, Unique.
* `code`: Required, numeric string `1-99`, Unique (used as category digit in smart SKU).
* `description`: Optional text.
* **Deletion Rule**: RESTRICT deletion if referenced by existing `Material` records.

### 2. `UnitOfMeasure`
* `name`: Required, 2-100 characters, Unique.
* `abbreviation`: Required, 1-15 uppercase characters (e.g., `KG`, `BAG`, `MTR`, `PCS`), Unique.
* `code`: Required, numeric string `1-99`, Unique (used as unit digit in smart SKU).
* `description`: Optional text.
* **Deletion Rule**: RESTRICT deletion if referenced by existing `Material` records.

### 3. `Material` (Updated)
* `itemCode`: Required, Unique, formatted as `^[A-Z]{3}-[0-9]{3,4}[0-9]{4,6}$` (e.g., `EGY-15200001`).
* `categoryId`: Required UUID foreign key to `Category`.
* `unitId`: Required UUID foreign key to `UnitOfMeasure`.
* `imageUrl`: Optional string path (e.g., `/uploads/materials/mat-xyz.webp`).
* `currentStock`: Float `>= 0`.
* `minStock`: Float `>= 0`.

### 4. `MaterialOutVoucher` (Updated)
* `issuedBy`: Removed.
* `siteLocation`: Required string, 2-150 characters, capturing the specific job site construction zone (e.g., "Kiln Preheater Tower - Level 4", "Foundation Pouring Bay 2").
* `recipient`: Required string, 2-100 characters.

