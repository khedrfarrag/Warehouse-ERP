# Tasks: Enterprise UI Layout, Complete CRUD, and Bilingual Arabic/English

**Input**: Design documents from `specs/003-ui-sidebar-crud-i18n/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Tests**: OPTIONAL - not requested. Manual end-to-end and type validation specified.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared utilities, fonts, and print stylesheet rules

- [X] T001 Configure Arabic Google Cairo font fallback and RTL utilities in `src/app/globals.css`
- [X] T002 [P] Implement client-side CSV export utility with UTF-8 BOM encoding in `src/lib/export-csv.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core localization dictionary and context infrastructure that MUST be complete before user stories

**CRITICAL**: Foundational localization engine for language and RTL/LTR synchronization across all UI components.

- [X] T003 [P] Create typed English localization dictionary in `src/lib/i18n/en.ts`
- [X] T004 [P] Create typed Arabic localization dictionary with exact domain terminology in `src/lib/i18n/ar.ts`
- [X] T005 Create `I18nContext`, provider, and `useI18n()` hook with document `dir` switching and `localStorage` persistence in `src/components/providers/i18n-provider.tsx` and export from `src/lib/i18n/index.ts`
- [X] T006 Update `src/app/layout.tsx` to wrap children with `I18nProvider` and prepare layout container

**Checkpoint**: Foundation ready - language provider and base layout ready for user story implementations.

---

## Phase 3: User Story 1 - Enterprise Sidebar Navigation & Animated Layout (Priority: P1)

**Goal**: Deliver a desktop collapsible sidebar (256px expanded / 72px icon rail) with tooltips, active route highlights, micro-animations, and a mobile drawer.

**Independent Test**: Load the app; click the collapse toggle to collapse to icon-only mode with tooltips. Resize viewport to mobile (< 1024px) and verify hamburger menu triggers the slide-over drawer with backdrop blur.

- [X] T007 [P] [US1] Create Collapsible Sidebar component with icon-rail mode (72px), expanded mode (256px), tooltips, and active route indicators in `src/components/layout/sidebar.tsx`
- [X] T008 [P] [US1] Create Mobile Drawer Navigation component with backdrop blur and hamburger toggle in `src/components/layout/mobile-nav.tsx`
- [X] T009 [US1] Create Top Header component with language selector, theme toggle, and mobile menu button in `src/components/layout/header.tsx`
- [X] T010 [US1] Integrate `Sidebar` and `Header` into `src/app/layout.tsx` replacing legacy top navbar and verify fluid transitions

**Checkpoint**: User Story 1 functional - sidebar collapses, transitions smoothly, and supports mobile drawer.

---

## Phase 4: User Story 2 - Bilingual Arabic & English Localization with Native RTL/LTR Support (Priority: P1)

**Goal**: Instant language switching between English and Arabic with automatic `dir="rtl"` / `dir="ltr"` mirroring, Arabic font rendering, and technical identifier preservation.

**Independent Test**: Switch language between English and Arabic. Verify `dir="rtl"` sets on `<html>`, all navigation items translate ("Material In" -> "استلام وتوريد المواد"), and SKU codes maintain LTR formatting.

- [X] T011 [P] [US2] Create Language Switcher dropdown/toggle component in `src/components/layout/language-toggle.tsx`
- [X] T012 [US2] Update Dashboard (`src/app/page.tsx`) to use `useI18n()` for bilingual metric labels and headings
- [X] T013 [US2] Add numeric and code RTL safety styles (`dir="ltr"`, `tabular-nums`) to stock badges and codes across components

**Checkpoint**: User Story 2 functional - Arabic and English toggle instantaneously with perfect RTL mirroring.

---

## Phase 5: User Story 3 - Full CRUD & Lifecycle Management for Materials (Priority: P1)

**Goal**: Complete lifecycle for catalog items: edit specifications, safety stock, location, and photos, plus safe deletion with transaction history guards.

**Independent Test**: Open `/materials`, click Edit on a material, update fields and photo, save and verify updates. Attempt to delete a material with linked ledger transactions (verify blocked).

- [X] T014 [P] [US3] Implement `updateMaterial` server action with Zod validation in `src/server/actions/materials.ts`
- [X] T015 [P] [US3] Implement safe `deleteMaterial` server action with referential checks against vouchers and ledger entries in `src/server/actions/materials.ts`
- [X] T016 [P] [US3] Create `MaterialEditModal` with pre-filled form fields, category/unit pickers, and photo upload in `src/components/modals/material-edit-modal.tsx`
- [X] T017 [US3] Update Material Catalog page (`src/app/materials/page.tsx`) to add Edit and Delete action buttons, connect modals, and wire reactive toast feedback

**Checkpoint**: User Story 3 functional - full CRUD for materials with safe deletion.

---

## Phase 6: User Story 4 - Detailed Voucher Inspection, Print View & Cancellation Rollback (Priority: P1)

**Goal**: Detailed inspection of Material In & Out vouchers, printable A4 gate passes with signature blocks, and atomic cancellation with stock rollback.

**Independent Test**: Open any voucher row to inspect details. Click "Print Voucher" to preview the gate pass layout. Test cancelling a voucher to verify currentStock adjusts and an `ADJUSTMENT` ledger record is logged.

- [X] T018 [P] [US4] Implement `cancelMaterialInVoucher` server action with atomic stock rollback and compensating `ADJUSTMENT` ledger record in `src/server/actions/material-in.ts`
- [X] T019 [P] [US4] Implement `cancelMaterialOutVoucher` server action with atomic stock restoration and compensating `ADJUSTMENT` ledger record in `src/server/actions/material-out.ts`
- [X] T020 [P] [US4] Create `VoucherDetailModal` displaying complete voucher metadata, items table, and voucher cancellation action in `src/components/modals/voucher-detail-modal.tsx`
- [X] T021 [P] [US4] Create `PrintVoucherModal` with print-optimized Sinoma letterhead, line items, and 3-tier signature blocks in `src/components/modals/print-voucher-modal.tsx`
- [X] T022 [US4] Integrate View Details, Print, and Cancel actions into Material In page (`src/app/material-in/page.tsx`)
- [X] T023 [US4] Integrate View Details, Print, and Cancel actions into Material Out page (`src/app/material-out/page.tsx`)

**Checkpoint**: User Story 4 functional - voucher inspection, printable gate passes, and cancellation rollbacks fully operational.

---

## Phase 7: User Story 5 - Full CRUD for Categories & Units of Measure (Priority: P2)

**Goal**: Full Edit and Delete operations for Categories and Units of Measure with referential integrity guards.

**Independent Test**: Edit a category or unit name/code; verify changes reflect in linked materials. Attempt to delete a category or unit currently assigned to materials; verify deletion is blocked with an informative message.

- [X] T024 [P] [US5] Implement `updateCategory` and safe `deleteCategory` server actions with material dependency checks in `src/server/actions/categories.ts`
- [X] T025 [P] [US5] Implement `updateUnitOfMeasure` and safe `deleteUnitOfMeasure` server actions with material dependency checks in `src/server/actions/units.ts`
- [X] T026 [P] [US5] Create `CategoryEditModal` in `src/components/modals/category-edit-modal.tsx`
- [X] T027 [P] [US5] Create `UomEditModal` in `src/components/modals/uom-edit-modal.tsx`
- [X] T028 [US5] Update Categories page (`src/app/categories/page.tsx`) with Edit and Safe Delete action triggers
- [X] T029 [US5] Update Units of Measure page (`src/app/units/page.tsx`) with Edit and Safe Delete action triggers

**Checkpoint**: User Story 5 functional - full CRUD for categories and units with referential guards.

---

## Phase 8: User Story 6 - Data Export to CSV / Excel for Catalog & Ledger (Priority: P3)

**Goal**: One-click UTF-8 CSV exports for Catalog and Inventory Ledger.

**Independent Test**: Click "Export CSV" on `/materials` and `/ledger`; verify downloaded files open cleanly in Excel with Arabic text intact.

- [X] T030 [P] [US6] Add "Export to CSV" button and handler in Material Catalog page (`src/app/materials/page.tsx`)
- [X] T031 [P] [US6] Add "Export to CSV" button and handler in Inventory Ledger page (`src/app/ledger/page.tsx`)

**Checkpoint**: User Story 6 functional - CSV exports ready for both modules.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: System-wide verification, terminology linting, and quality checks

- [X] T032 [P] Terminology and Linter Check: audit all files for 0 occurrences of "Goods In" / "Goods Out"
- [X] T033 Execute full TypeScript compile check `npx tsc --noEmit` and resolve any typing issues
- [X] T034 Run through validation scenarios in `quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; BLOCKS all user stories (all components consume i18n).
- **Phase 3 (Sidebar Layout - US1)**: Consumes foundational i18n.
- **Phase 4 (Bilingual i18n - US2)**: Extends layout and dashboard.
- **Phase 5 (Material CRUD - US3)**: Independent after Phase 2.
- **Phase 6 (Voucher Inspection & Rollback - US4)**: Independent after Phase 2.
- **Phase 7 (Category & Unit CRUD - US5)**: Independent after Phase 2.
- **Phase 8 (CSV Export - US6)**: Depends on CSV utility from Phase 1.
- **Phase 9 (Polish)**: Final verification.

---

## Implementation Strategy

### MVP First (User Stories 1 & 2)
1. Complete Setup + Foundational (i18n & layout foundation).
2. Complete User Story 1 (Animated Collapsible Sidebar & Header).
3. Complete User Story 2 (Bilingual English/Arabic & RTL).
4. Verify navigation & localization end-to-end.

### Incremental Delivery (User Stories 3 to 6)
5. Implement Material CRUD (US3).
6. Implement Voucher Details, Printing & Cancellation Rollbacks (US4).
7. Implement Category & Unit CRUD (US5).
8. Implement CSV Exports (US6).
9. Run TypeScript verification & domain terminology audit.
