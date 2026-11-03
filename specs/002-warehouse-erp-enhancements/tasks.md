# Tasks: Contracting Warehouse ERP Advanced Enhancements

**Input**: Design documents from `/specs/002-warehouse-erp-enhancements/`
**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/)
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`
- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2], [US3], [US4], [US5], [US6])
- All descriptions include explicit file paths and constraint rules

---

## Phase 1: Setup (Shared Infrastructure & Theming)

**Purpose**: Theme dependencies, file upload storage structure, and configuration

- [X] T001 Install `next-themes` dependency in package.json
- [X] T002 [P] Configure Tailwind `darkMode: 'class'` in tailwind.config.ts
- [X] T003 [P] Create uploads storage directory for material photos in public/uploads/materials/

---

## Phase 2: Foundational (Database Schema Migration & Core Providers)

**Purpose**: Database schema expansion for Categories, Units of Measure, Material images, and site work locations that MUST be complete before ANY user story can proceed.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Update PostgreSQL schema with Category, UnitOfMeasure, Material foreign keys (categoryId, unitId, imageUrl), and MaterialOutVoucher.siteLocation in prisma/schema.prisma
- [X] T005 Push database schema updates and regenerate Prisma Client using npx prisma db push
- [X] T006 [P] Update database seed script with initial contracting Categories and Units of Measure in prisma/seed.ts
- [X] T007 [P] Implement NextThemes ThemeProvider wrapper component in src/components/providers/theme-provider.tsx
- [X] T008 Integrate ThemeProvider into Root Layout in src/app/layout.tsx
- [X] T009 [P] Implement ThemeToggle sun/moon icon button component in src/components/layout/theme-toggle.tsx
- [X] T010 Add ThemeToggle and Category/UOM navigation links to top bar in src/components/layout/navbar.tsx

**Checkpoint**: Foundation ready - relational schema and theme providers active.

---

## Phase 3: User Story 1 - Relational Categories & Units of Measure (UOM) Management (Priority: P1) 🎯 MVP

**Goal**: Enable administrators to create and manage Categories and Units of Measure dynamically with numeric codes for inventory classification.

**Independent Test**: Create a Category (e.g., "Civil Infrastructure", code "1") and a Unit (e.g., "Metric Ton", code "3", abbr "TON"). Verify they appear in selection lists and database tables.

- [X] T011 [P] [US1] Create Zod validation schemas for Category (name 2-100 chars, code numeric 1-999) and UnitOfMeasure (name 2-100 chars, abbr 1-15 uppercase, code numeric 1-999) in src/lib/schemas/category.ts and src/lib/schemas/uom.ts
- [X] T012 [P] [US1] Implement Server Actions for Category CRUD in src/server/actions/categories.ts
- [X] T013 [P] [US1] Implement Server Actions for UnitOfMeasure CRUD in src/server/actions/units.ts
- [X] T014 [P] [US1] Implement REST API route for Categories in src/app/api/categories/route.ts
- [X] T015 [P] [US1] Implement REST API route for Units of Measure in src/app/api/units/route.ts
- [X] T016 [US1] Implement Category management modal and list page in src/components/forms/category-form.tsx and src/app/categories/page.tsx
- [X] T017 [US1] Implement Unit of Measure management modal and list page in src/components/forms/uom-form.tsx and src/app/units/page.tsx

**Checkpoint**: User Story 1 is functional. Categories and Units of Measure are dynamically managed.

---

## Phase 4: User Story 2 - Automated Smart Structured Item Code Generation (Priority: P1)

**Goal**: Automatically compute structured SKU item codes (e.g. `EGY-15200001`) based on country, category, attribute, and unit codes.

**Independent Test**: In material creation, select Country "EGY", Category Code "1", Attribute "5", and Unit Code "2". Confirm the generated code `EGY-15200001` populates automatically.

- [X] T018 [P] [US2] Implement smart SKU generator algorithm with collision detection in src/lib/item-code-generator.ts
- [X] T019 [P] [US2] Implement Server Action for smart code computation in src/server/actions/materials.ts
- [X] T020 [US2] Integrate automated smart item code generator with country selector, category, attribute, and unit pickers in src/components/forms/material-form.tsx

**Checkpoint**: User Story 2 is functional. Smart SKUs generated with zero manual typing errors.

---

## Phase 5: User Story 3 - Material Images & Visual Catalog (Priority: P1)

**Goal**: Enable photo uploads for construction materials with thumbnail displays in the catalog and full preview modals.

**Independent Test**: Upload an image file for a material, verify it saves to `public/uploads/materials/`, displays a thumbnail in `/materials`, and opens a zoom preview.

- [X] T021 [P] [US3] Implement multipart file upload route handler in src/app/api/upload/route.ts with 5MB limit and JPEG/PNG/WebP validation
- [X] T022 [US3] Add image drag-and-drop file upload input with live preview into src/components/forms/material-form.tsx
- [X] T023 [US3] Update Material Catalog table to display image thumbnails and full-size preview modal in src/app/materials/page.tsx

**Checkpoint**: User Story 3 is complete. Visual identification enabled across the catalog.

---

## Phase 6: User Story 4 - Advanced Paginated Material Selector (20 Limit) (Priority: P1)

**Goal**: Replace basic dropdowns in Material In and Material Out with an advanced modal selector featuring search, category filters, stock balance indicators, and 20 items per page pagination.

**Independent Test**: Open the material picker in Material In or Out. Verify exactly 20 items show per page with pagination controls, and searching filters items instantaneously.

- [X] T024 [P] [US4] Implement paginated material query endpoint with 20 items limit per page in src/app/api/materials/route.ts
- [X] T025 [US4] Implement reusable MaterialSelectorModal component with search, category filter, stock badges, and 20-item pagination in src/components/materials/material-selector-modal.tsx
- [X] T026 [US4] Integrate MaterialSelectorModal into Material In intake voucher line items in src/components/forms/material-in-form.tsx
- [X] T027 [US4] Integrate MaterialSelectorModal into Material Out issuance voucher line items in src/components/forms/material-out-form.tsx

**Checkpoint**: User Story 4 is complete. Large catalogs navigable smoothly during voucher entry.

---

## Phase 7: User Story 5 - Material Out Specific Work Site Location Tracking (Priority: P2)

**Goal**: Remove `issuedBy` and record the specific job-site construction work area (e.g., "Kiln Preheater Tower - Level 4") in Material Out vouchers.

**Independent Test**: Create a Material Out voucher. Confirm `issuedBy` is gone, `siteLocation` is mandatory, and is saved in the voucher and ledger audit notes.

- [X] T028 [P] [US5] Update Material Out Zod validation schema removing `issuedBy` and adding mandatory `siteLocation` (2-150 chars) in src/lib/schemas/material-out.ts
- [X] T029 [US5] Update Material Out Server Action in src/server/actions/material-out.ts to persist `siteLocation` in voucher and audit ledger notes
- [X] T030 [US5] Update Material Out issuance form replacing `issuedBy` with `siteLocation` input in src/components/forms/material-out-form.tsx
- [X] T031 [US5] Update Material Out voucher history list and table to display site work area in src/app/material-out/page.tsx

**Checkpoint**: User Story 5 is complete. Job-site location tracking fully aligned with field engineering needs.

---

## Phase 8: User Story 6 - Dark & Light Theme Styling (Priority: P3)

**Goal**: Apply polished dark mode styling across all existing and new pages.

**Independent Test**: Toggle dark mode in navbar; verify background, cards, tables, badges, and modals have high contrast with zero glare.

- [X] T032 [P] [US6] Add Tailwind dark mode styles (dark:bg-slate-900, dark:border-slate-800, dark:text-slate-100) in src/app/globals.css
- [X] T033 [US6] Update UI components (Card, Input, Button, Badge, Table) to support seamless dark theme variants in src/components/ui/

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: System consistency checks, terminology enforcement, and validation against acceptance criteria.

- [X] T034 [P] Run terminology audit to verify 0 occurrences of deprecated "Goods In" or "Goods Out" in src/
- [X] T035 Execute TypeScript strict typecheck using npx tsc --noEmit
- [X] T036 Execute full end-to-end verification scenario walkthrough documented in specs/002-warehouse-erp-enhancements/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies
1. **Setup (Phase 1)**: Must run first; installs `next-themes` and prepares upload directories.
2. **Foundational (Phase 2)**: Depends on Phase 1; updates database schema in Prisma and mounts ThemeProvider.
3. **User Story 1 (Phase 3)**: Depends on Phase 2; provides Category and UOM tables.
4. **User Story 2 (Phase 4)**: Depends on US1 (uses Category and UOM codes for smart SKU generation).
5. **User Story 3 (Phase 5)**: Depends on Phase 1 (upload directory) & Phase 2 (imageUrl field).
6. **User Story 4 (Phase 6)**: Depends on US1 (category filters) & US3 (thumbnails in picker).
7. **User Story 5 (Phase 7)**: Depends on Phase 2 (`siteLocation` field).
8. **User Story 6 (Phase 8)**: Depends on Phase 2 (ThemeProvider).
9. **Polish (Phase 9)**: Runs after all user stories are complete.
