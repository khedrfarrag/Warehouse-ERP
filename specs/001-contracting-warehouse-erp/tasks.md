# Tasks: Contracting Warehouse ERP

**Input**: Design documents from `/specs/001-contracting-warehouse-erp/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`
- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5])
- All descriptions include explicit file paths and constraint rules

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency management, and configuration

- [X] T001 Initialize Next.js 15 project with TypeScript in package.json
- [X] T002 [P] Install core runtime dependencies (next, react, react-dom, @prisma/client, react-hook-form, @hookform/resolvers, zod, sonner, motion, lucide-react, clsx, tailwind-merge) and dev dependencies (prisma, typescript, @types/node, @types/react, tailwindcss, postcss) in package.json
- [X] T003 [P] Configure Tailwind CSS and globals styling in src/app/globals.css and postcss.config.mjs
- [X] T004 [P] Create environment variables template with PostgreSQL database connection string in .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database schema, UI foundation, navigation layout, and design system components that MUST be complete before ANY user story can proceed.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Define complete PostgreSQL relational schema (Material, MaterialInVoucher, MaterialInItem, MaterialOutVoucher, MaterialOutItem, InventoryLedger) with indexes and foreign keys in prisma/schema.prisma
- [X] T006 Implement Prisma client singleton and connection lifecycle in src/lib/db.ts
- [X] T007 Create database seed script with sample civil, electrical, and mechanical contracting materials in prisma/seed.ts
- [X] T008 [P] Implement UI building block primitives (Button, Input, Table, Card, Badge, Dialog) in src/components/ui/
- [X] T009 [P] Implement Motion animated wrapper for fluid page transitions in src/components/motion/page-transition.tsx
- [X] T010 Implement top Navigation Bar strictly enforcing "Material In" and "Material Out" labels (never Goods In/Out) in src/components/layout/navbar.tsx
- [X] T011 Implement Root Layout embedding Navbar and Sonner Toaster component in src/app/layout.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin independently.

---

## Phase 3: User Story 1 - Material Catalog & Real-Time Stock Balance Overview (Priority: P1) 🎯 MVP

**Goal**: Enable warehouse clerks and supervisors to register materials, browse catalog items, view current on-hand stock, and filter by category or search terms.

**Independent Test**: Register a new material with code, name, category, unit, and safety threshold. Verify it appears in the catalog table with `currentStock: 0` and can be searched by code and category.

- [X] T012 [P] [US1] Create Material Zod validation schema in src/lib/schemas/material.ts with constraints: `itemCode` regex `^[A-Z0-9_-]+$`, `name` (2-150 chars), `category` (2-50 chars), `unit` enum `['PCS', 'KG', 'METER', 'BAG', 'BOX', 'DRUM', 'LITER', 'SET', 'ROLL']`, `minStock` (`>= 0`), and `location` (1-100 chars)
- [X] T013 [P] [US1] Implement Server Actions for creating, updating, and fetching materials in src/server/actions/materials.ts
- [X] T014 [P] [US1] Implement REST API endpoint for searching and filtering materials in src/app/api/materials/route.ts
- [X] T015 [US1] Implement Material registration modal form using React Hook Form, Zod resolver, and Sonner toast notifications in src/components/forms/material-form.tsx
- [X] T016 [US1] Implement Material Catalog view with real-time search, category filter, stock badges, and empty states in src/app/materials/page.tsx

**Checkpoint**: User Story 1 is functional and delivers the core Material Catalog MVP.

---

## Phase 4: User Story 2 - Receiving Materials via Material In (Priority: P1)

**Goal**: Enable warehouse staff to record inbound deliveries under the "Material In" intake workflow, increasing stock and generating audit ledger records.

**Independent Test**: Create a Material In voucher with a supplier name, delivery note, and 2 received items. Verify the voucher is stored, on-hand stock increments accurately, and an immutable ledger entry is created.

- [X] T017 [P] [US2] Create Material In Zod validation schema in src/lib/schemas/material-in.ts with constraints: `voucherNo` (optional string), `date` (datetime string), `supplierName` (2-150 chars), `poNumber` (max 100 chars), `deliveryNote` (max 100 chars), `receivedBy` (2-100 chars), and `items` (min 1 item with `materialId` UUID and `quantity > 0`)
- [X] T018 [P] [US2] Implement Material In Server Action in src/server/actions/material-in.ts using Prisma interactive transaction (`prisma.$transaction`) to create voucher, insert line items, increment `Material.currentStock`, and create `InventoryLedger` records with `transactionType: "MATERIAL_IN"`
- [X] T019 [P] [US2] Implement REST API endpoint for Material In vouchers in src/app/api/material-in/route.ts
- [X] T020 [US2] Implement dynamic multi-item Material In intake form with React Hook Form (`useFieldArray`), item picker, and Sonner toast in src/components/forms/material-in-form.tsx
- [X] T021 [US2] Implement Material In voucher history list and details view in src/app/material-in/page.tsx
- [X] T022 [US2] Implement new Material In intake voucher creation page in src/app/material-in/new/page.tsx

**Checkpoint**: User Story 2 is fully functional. Material intake increases on-hand stock with transaction safety.

---

## Phase 5: User Story 3 - Issuing Materials via Material Out (Priority: P1)

**Goal**: Enable warehouse staff to record dispatches under the "Material Out" workflow, validating stock availability, preventing negative balances, and decrementing on-hand inventory.

**Independent Test**: Attempt to issue more units than on-hand stock (verify transaction is rejected with an error toast). Then issue a valid quantity and verify on-hand stock decrements and a negative ledger delta is recorded.

- [X] T023 [P] [US3] Create Material Out Zod validation schema in src/lib/schemas/material-out.ts with constraints: `voucherNo` (optional string), `date` (datetime string), `projectName` (2-150 chars), `requisitionNo` (1-100 chars), `recipient` (2-100 chars), `issuedBy` (2-100 chars), and `items` (min 1 item with `materialId` UUID and `quantity > 0`)
- [X] T024 [P] [US3] Implement Material Out Server Action in src/server/actions/material-out.ts with row-level locking concurrency control (`SELECT ... FOR UPDATE`), stock availability check (`currentStock >= requestedQuantity`), atomic conditional decrement, and `InventoryLedger` recording (`transactionType: "MATERIAL_OUT"`)
- [X] T025 [P] [US3] Implement REST API endpoint for Material Out vouchers in src/app/api/material-out/route.ts
- [X] T026 [US3] Implement multi-item Material Out issuance form with dynamic rows (`useFieldArray`), live available stock indicators, validation blockers, and Sonner toast alerts in src/components/forms/material-out-form.tsx
- [X] T027 [US3] Implement Material Out voucher history list and details view in src/app/material-out/page.tsx
- [X] T028 [US3] Implement new Material Out issuance creation page in src/app/material-out/new/page.tsx

**Checkpoint**: User Story 3 is complete. Invariant rules prevent negative inventory and ensure concurrency safety.

---

## Phase 6: User Story 4 - Inventory Transaction Ledger & Audit Trail (Priority: P2)

**Goal**: Enable managers and auditors to inspect the immutable historical trail of all material movements with running balances and voucher references.

**Independent Test**: View `/ledger`, apply filters by date range and transaction type (`MATERIAL_IN` vs `MATERIAL_OUT`), and confirm running balance sequentially reconciles every transaction.

- [X] T029 [P] [US4] Implement Inventory Ledger query Server Actions with date range, transaction type, and material filters in src/server/actions/ledger.ts
- [X] T030 [P] [US4] Implement REST API endpoint for ledger queries with pagination in src/app/api/ledger/route.ts
- [X] T031 [US4] Implement Inventory Transaction Ledger table page with interactive search, date pickers, movement type filter badges, and running balance columns in src/app/ledger/page.tsx

**Checkpoint**: User Story 4 is complete. Complete auditability and financial reconciliation enabled.

---

## Phase 7: User Story 5 - Low Stock Notifications & Reorder Monitoring (Priority: P3)

**Goal**: Provide warehouse supervisors with automated low-stock warnings when inventory drops below safety thresholds.

**Independent Test**: Issue stock until an item falls below its `minStock`. Verify the item is flagged with a warning badge in the catalog and highlighted on the dashboard.

- [X] T032 [P] [US5] Implement low-stock calculation utility and visual indicator badge in src/components/ui/stock-badge.tsx
- [X] T033 [US5] Implement ERP Dashboard overview showing total active materials, total inbound vouchers, total outbound vouchers, and low-stock alert summary cards in src/app/page.tsx

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: System consistency checks, terminology enforcement, and validation against acceptance criteria.

- [X] T034 [P] Run terminology audit across all source files to verify 0 occurrences of deprecated "Goods In" or "Goods Out" (ensuring strict use of Material In and Material Out)
- [X] T035 Execute full end-to-end verification scenario walkthrough documented in specs/001-contracting-warehouse-erp/quickstart.md
- [X] T036 Update documentation and usage instructions in README.md

---

## Dependencies & Execution Order

### Phase Dependencies
1. **Setup (Phase 1)**: Must run first; initializes project files and packages.
2. **Foundational (Phase 2)**: Depends on Phase 1; establishes database schema, Prisma client, and layout. Blocks all subsequent user stories.
3. **User Story 1 (Phase 3)**: Depends on Phase 2; establishes Material Catalog (MVP).
4. **User Story 2 (Phase 4)**: Depends on Phase 2 and Material model from US1.
5. **User Story 3 (Phase 5)**: Depends on Phase 2 and Material model from US1.
6. **User Story 4 (Phase 6)**: Depends on Phase 2 and Ledger schema populated by US2 & US3.
7. **User Story 5 (Phase 7)**: Depends on US1, US2, US3.
8. **Polish (Phase 8)**: Depends on completion of all desired user stories.

### Parallel Execution Opportunities
- Tasks marked with `[P]` within each phase can be executed concurrently in separate files:
  - T002, T003, T004 in Phase 1.
  - T008, T009, T010 in Phase 2.
  - T012, T013, T014 in Phase 3.
  - T017, T018, T019 in Phase 4.
  - T023, T024, T025 in Phase 5.
  - T029, T030 in Phase 6.

---

## Implementation Strategy (MVP & Incremental Delivery)

1. **MVP Release (Phase 1 + Phase 2 + Phase 3)**:
   - Deliver project foundation and functional Material Catalog. Warehouse staff can register items and view stock balances.
2. **Inbound Tracking Release (Phase 4)**:
   - Add Material In intake vouchers. Warehouse can receive shipments and automatically accumulate inventory.
3. **Outbound & Invariance Release (Phase 5)**:
   - Add Material Out issuance vouchers. Safe dispatches with negative-balance protection.
4. **Audit & Reorder Release (Phase 6 + Phase 7 + Phase 8)**:
   - Full audit trail ledger, executive dashboard, and low-stock reorder warnings.
