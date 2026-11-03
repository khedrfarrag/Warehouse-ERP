# Tasks: Stock Threshold Filtering, Universal Image Upload, Selective Excel Reports, and Interactive Pagination

**Input**: Design documents from `specs/004-catalog-filters-excel-pagination/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`
**Tests**: OPTIONAL - not requested. Manual end-to-end and type validation specified.
**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared utilities, CSV reorder generator, and i18n dictionaries

- [x] T001 [P] Enhance CSV export utility in `src/lib/export-csv.ts` with `exportReorderReportToCsv` supporting Sinoma official letterhead, auto-calculated deficit (`minStock - currentStock`), and UTF-8 BOM encoding
- [x] T002 [P] Update English dictionary in `src/lib/i18n/en.ts` and Arabic dictionary in `src/lib/i18n/ar.ts` with keys for stock filters, threshold inputs, row selection counter, and reorder reports

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend query and parameter extensions in `getMaterials`

**CRITICAL**: Database-level stock status and threshold filtering MUST be available before UI filter components are wired.

- [x] T003 Enhance `getMaterials` server action in `src/server/actions/materials.ts` with `stockStatus` ("ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK") and `maxStock` using native Prisma field-to-field references and pagination

**Checkpoint**: Foundation ready - backend can filter materials by safety limits and custom quantities.

---

## Phase 3: User Story 1 - Intelligent Stock Threshold & Safety Stock Filtering (Priority: P1)

**Goal**: Enable warehouse managers to isolate shortage items below safety stock or below an explicit quantity threshold ($CurrentStock \le X$).

**Independent Test**: On `/materials`, select "Below Safety Stock"; verify only materials where current stock $\le$ min stock are displayed. Type `15` into the threshold filter; verify only materials with current stock $\le 15$ are returned.

- [x] T004 [US1] Add Stock Status selector dropdown and numeric Max Current Stock threshold input to filter bar in `src/app/materials/page.tsx`
- [x] T005 [US1] Wire stock status and quantity threshold filters into search submission and data loading state in `src/app/materials/page.tsx`

**Checkpoint**: User Story 1 functional - users can filter materials by stock health and arbitrary quantity thresholds.

---

## Phase 4: User Story 2 - Universal Image Format Upload Support (Priority: P1)

**Goal**: Accept all standard modern web image formats (AVIF, JFIF, WebP, PNG, JPEG, SVG, BMP) without rejection and fix the URL binding in material creation/edit forms.

**Independent Test**: Upload an AVIF or JFIF tool photo (such as the Stanley hammer image) in Add Material or Edit Material modal; verify the file uploads successfully, renders the preview, and persists the image upon saving.

- [x] T006 [P] [US2] Update upload route handler in `src/app/api/upload/route.ts` to accept AVIF, JFIF, WebP, SVG, BMP, PNG, JPEG with extension fallback, returning `{ success: true, url, imageUrl, fileName }`
- [x] T007 [P] [US2] Update file input `accept="image/*"` and payload consumption (`data.url || data.imageUrl`) in `src/components/forms/material-form.tsx`
- [x] T008 [P] [US2] Update file input `accept="image/*"` and payload consumption (`data.url || data.imageUrl`) in `src/components/modals/material-edit-modal.tsx`

**Checkpoint**: User Story 2 functional - all modern image formats upload and preview seamlessly.

---

## Phase 5: User Story 3 - Selective Multi-Material Selection & Formatted Excel/CSV Reorder Report (Priority: P1)

**Goal**: Allow selecting specific materials via checkboxes to generate a customized, professionally formatted Excel/CSV shortage and reorder requisition report.

**Independent Test**: Filter low-stock items. Select three items via row checkboxes. Click "Export Selected to Excel". Open the generated `.csv` in Microsoft Excel; verify the report contains Sinoma letterhead, accurate columns, correct shortage deficit calculations, and pristine Arabic typography.

- [x] T009 [US3] Implement row-level checkboxes, select-all header toggle, and persistent selection state in `src/app/materials/page.tsx`
- [x] T010 [US3] Create floating Selection Action Bar showing selected item count, "Export Selected to Excel", "Export All Filtered", and "Clear Selection" in `src/app/materials/page.tsx`
- [x] T011 [US3] Integrate `exportReorderReportToCsv` into selection export buttons with auto-calculated deficit and localized status in `src/app/materials/page.tsx`

**Checkpoint**: User Story 3 functional - users can pick specific materials and export a formatted procurement reorder report.

---

## Phase 6: User Story 4 - Interactive Full Pagination for Material Catalog (Priority: P2)

**Goal**: Provide complete pagination controls (Previous/Next, page numbers, page size selector 10/20/50/100) while preserving selected items across page changes.

**Independent Test**: Change page size to 10; navigate to Page 2; select an item; navigate back to Page 1; verify the selected item from Page 2 remains preserved in the selection counter and export list.

- [x] T012 [P] [US4] Create reusable pagination component with page navigation, page size selector (10, 20, 50, 100), and record count indicator in `src/components/ui/pagination.tsx`
- [x] T013 [US4] Integrate pagination component into `src/app/materials/page.tsx` ensuring selection state persists across page transitions

**Checkpoint**: User Story 4 functional - full interactive pagination with multi-page selection retention.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: System-wide verification, terminology linting, and quality checks

- [x] T014 [P] Terminology and Linter Check: audit all files to ensure 0 occurrences of deprecated "Goods In" / "Goods Out"
- [x] T015 Run full TypeScript compile check `npx tsc --noEmit` and resolve any typing issues
- [x] T016 Run through validation scenarios in `quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: Can start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1; BLOCKS Phase 3 (US1).
- **Phase 3 (Stock Filtering - US1)**: Consumes backend filters from Phase 2.
- **Phase 4 (Universal Image Upload - US2)**: Independent; can run in parallel with US1.
- **Phase 5 (Selective Excel Export - US3)**: Depends on Phase 1 CSV utility; integrates into catalog table.
- **Phase 6 (Pagination - US4)**: Integrates into catalog table alongside selection state.
- **Phase 7 (Polish)**: Final verification and validation.

---

## Implementation Strategy

### MVP First (User Stories 1, 2 & 3)
1. Complete Setup + Foundational (enhanced CSV utility, i18n dictionaries, backend stock queries).
2. Implement Stock Threshold Filtering (US1).
3. Fix Image Upload Pipeline for AVIF/JFIF/WebP (US2).
4. Implement Checkbox Selection & Formatted Excel Reorder Export (US3).
5. Implement Full Interactive Pagination (US4).
6. Verify against TypeScript and Quickstart test scenarios.
