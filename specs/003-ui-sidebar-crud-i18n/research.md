# Phase 0 Research: Enterprise UI Layout, Complete CRUD, and Bilingual Arabic/English

## 1. Responsive Sidebar & Micro-Animation Architecture

- **Decision**: Implement a desktop collapsible sidebar with an expanded state (256px) and collapsed icon-rail state (72px), paired with a mobile slide-over drawer triggered by a sticky top header hamburger icon. Micro-interactions and route animations are orchestrated using `motion` (Framer Motion).
- **Rationale**:
  - Construction ERP tables (material catalog, voucher items, inventory ledgers) require wide horizontal viewports to prevent cramped columns.
  - An icon-rail sidebar maintains instantaneous navigation access while recovering ~184px of desktop width.
  - Persisting the user's collapse preference in `localStorage` (`sinoma_sidebar_collapsed`) provides continuity across sessions.
- **Alternatives Considered**:
  - *Static top navigation*: Rejected because as the ERP scales (adding Categories, Units, Ledger, Reports, Vouchers), top navigation horizontally overflows on 13-inch laptop screens.
  - *Pure CSS hidden drawer*: Rejected because desktop power users lose visual orientation without an icon rail.

---

## 2. Bilingual Arabic (العربية) & English (EN) Localization with RTL

- **Decision**: Implement an in-memory client `I18nProvider` powered by strongly-typed dictionaries (`src/lib/i18n/en.ts` and `src/lib/i18n/ar.ts`) with a React hook `useI18n()`.
- **RTL & Layout Mirroring**:
  - Language toggle immediately switches `document.documentElement.dir` between `"rtl"` and `"ltr"`, and `document.documentElement.lang` between `"ar"` and `"en"`.
  - Persisted in `localStorage` (`sinoma_lang`).
  - Arabic typography supported by importing Google Cairo / Tajawal font fallbacks in `globals.css`.
  - Technical alphanumeric identifiers (SKU `EGY-15200001`, voucher references `IN-20261029-001`, phone numbers, dates, and metric numbers) are explicitly tagged with `dir="ltr"` and `tabular-nums font-mono` to prevent reverse hyphenation in RTL mode.
- **Domain Terminology Compliance (Constitution Principle IV)**:
  - English: "Material In" & "Material Out".
  - Arabic: "استلام وتوريد المواد (Material In)" و "صرف وتوزيع المواد (Material Out)".
  - Strict linting: Zero occurrences of legacy "Goods In" / "Goods Out".
- **Alternatives Considered**:
  - *Next.js URL-based routing (`/[locale]/...`)*: Rejected because migrating existing route structure (`/materials`, `/material-in`, etc.) introduces unnecessary routing complexity and migration overhead for a single-tenant internal ERP system.

---

## 3. Comprehensive CRUD & Referential Integrity

- **Decision**: Build full Server Action suites with Zod validation for editing and safe deletion across all database models.
- **Referential Guards**:
  - **Materials**: Deleting an item checks if `materialInItems.length > 0`, `materialOutItems.length > 0`, or `ledgerEntries.length > 0`. If linked, the action rejects with a user-friendly message (`Cannot delete material with existing warehouse transaction history`).
  - **Categories**: Deleting a category checks if `materials.length > 0`. If linked, rejects indicating how many materials are still assigned.
  - **Units of Measure**: Deleting a unit checks if `materials.length > 0`. If linked, rejects indicating assigned materials.
  - **Vouchers (Material In & Out)**: Instead of destructive hard-deletion which destroys audit trails, vouchers feature an atomic `cancel` action:
    - Sets voucher `status = "CANCELLED"`.
    - In Material In cancellation: decreases `Material.currentStock` by the received quantity (guarded against negative inventory: `currentStock - qty >= 0`), and logs an `ADJUSTMENT` ledger entry.
    - In Material Out cancellation: returns the dispatched quantity to `Material.currentStock`, and logs an `ADJUSTMENT` ledger entry.
    - All updates run inside a Prisma interactive transaction (`prisma.$transaction`).
- **Alternatives Considered**:
  - *Hard deleting vouchers*: Strictly rejected because Constitution Principle V requires immutable audit trails for all inventory movements.

---

## 4. Printable Gate Passes & Vouchers

- **Decision**: Create a dedicated print layout modal triggered by `window.print()` with custom CSS `@media print` rules.
- **Layout Specification**:
  - Official Sinoma Contracting letterhead with company logo and warehouse location.
  - Complete voucher header (Voucher No, Date, Project/Supplier, Requisition/PO, Recipient/Storekeeper).
  - Clean bordered table of materials, specifications, quantities, and units.
  - Official 3-tier signature blocks:
    1. Warehouse Storekeeper (أمين المستودع)
    2. Site Engineer / Receiving Authority (المهندس المشرف / المستلم)
    3. Site Security Gatekeeper (أمن البوابة)
  - Hide all navigation, buttons, and sidebars during print preview.

---

## 5. CSV Export Engine

- **Decision**: Implement a client-side utility `exportToCsv(filename, headers, rows)` that encodes data with a UTF-8 Byte Order Mark (`\uFEFF`) as a `Blob` and triggers a download.
- **Rationale**: The UTF-8 BOM is essential for Microsoft Excel on Windows to properly display Arabic characters without mojibake/corrupted glyphs.
- **Coverage**: Provided for Material Catalog (`materials.csv`) and Inventory Ledger (`inventory_ledger.csv`).

