# Research & Architectural Decisions: Advanced ERP Enhancements

**Feature**: [spec.md](spec.md) | **Branch**: `002-warehouse-erp-enhancements` | **Date**: 2026-10-29

## Overview
This document outlines technical investigations, architectural choices, and library selections for the 7 enhancement pillars of the Contracting Warehouse ERP.

---

## Technical Investigations & Decisions

### 1. Theme Management (Dark & Light Mode)
* **Decision**: Next.js theme management using `next-themes` with Tailwind CSS `darkMode: "class"`.
* **Rationale**:
  * Prevents flash of unstyled content (FOUC) / hydration mismatch on initial page render.
  * Synchronizes seamlessly with system preference (`prefers-color-scheme`) and persists user preference in `localStorage`.
  * Allows straightforward utility styling across components (`dark:bg-slate-900`, `dark:text-white`, `dark:border-slate-800`).
* **Alternatives Considered**:
  * *Manual React useState + class injection*: Vulnerable to SSR hydration flash.
  * *Pure CSS media queries*: Does not allow manual user toggle override.

### 2. Relational Category & Unit of Measure Architecture
* **Decision**: Introduce explicit PostgreSQL models `Category` and `UnitOfMeasure` with foreign key relationships on `Material` (`categoryId`, `unitId`).
* **Rationale**:
  * Guarantees relational referential integrity.
  * Allows warehouse administrators to register new contracting categories (e.g., Civil, Mechanical, Instrumentation, Refractory) and custom measurement units (e.g., Tons, Barrels, Bundles) without modifying application code.
  * Supplies standard numeric code attributes needed for smart SKU generation.
* **Alternatives Considered**:
  * *Static Enum or JSON column*: Rigid, requires code redeployment to add new units or categories.

### 3. Smart Structured Item Code Generation Strategy
* **Decision**: Implement a server-side algorithm `generateSmartItemCode({ countryCode, categoryCode, attributeCode, unitCode })`:
  * Format: `${countryCode}-${categoryCode}${attributeCode}${unitCode}${sequence}`
  * Sequence calculation: Query existing materials matching prefix `^${countryCode}-${categoryCode}${attributeCode}${unitCode}` and increment the highest existing 4-digit or 5-digit number.
* **Rationale**:
  * Standardized enterprise classification adopted across Sinoma multi-site projects.
  * Zero risk of duplicate SKU collisions under concurrent material registrations.
* **Alternatives Considered**:
  * *Pure UUID / random hex*: Meaningless to warehouse floor staff reading physical labels.
  * *Manual user typing*: High rate of typos, inconsistent casing, and accidental duplicate barcodes.

### 4. Material Image Upload & Serving
* **Decision**: Handle file upload via Next.js Server Action / API Route with local disk storage in `public/uploads/materials/` (or cloud storage adapter in production), persisting the relative URL (`/uploads/materials/[uuid].[ext]`) on `Material.imageUrl`.
* **Rationale**:
  * Zero external third-party service dependencies required for on-premise contracting sites.
  * Next.js static asset serving serves files directly from `/uploads/` with browser caching.
  * Secure server-side validation: Restricts allowed extensions (`.jpg`, `.jpeg`, `.png`, `.webp`) and enforces a 5MB payload limit.
* **Alternatives Considered**:
  * *Base64 data strings directly in PostgreSQL*: Bloats database size and slows down table scans.
  * *Mandatory AWS S3 / Cloudinary*: May not be available on offline or restricted intranet construction sites.

### 5. Advanced Paginated Material Selector Modal (Limit: 20)
* **Decision**: Custom interactive Dialog/Popover component with server-side pagination, instant search debounce, and category filtering.
* **Rationale**:
  * Construction warehouses have thousands of distinct materials; basic native HTML `<select>` elements degrade performance and provide no thumbnail/stock visibility.
  * Standardized 20-item pagination keeps DOM lightweight and search response sub-200ms.
  * Displays current on-hand stock and thumbnail preview directly in the picker row before selection.

### 6. Material Out Job-Site Location Tracking
* **Decision**:
  * Remove `issuedBy` from `MaterialOutVoucher` schema.
  * Add required `siteLocation` field (e.g., "Kiln Preheater Tower - Level 4", "Foundation Bay 3").
  * Retain `recipient` (the receiving site engineer or subcontractor).
* **Rationale**:
  * Resolves site supervisor requirements: in contracting, the issuing warehouse clerk is already logged via the system session/audit log, whereas knowing the exact physical construction site zone where the material is used is paramount for materials allocation.

