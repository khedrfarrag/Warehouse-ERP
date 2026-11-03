# Feature Specification: Enterprise UI Layout, Complete CRUD, and Bilingual Arabic/English

**Feature Branch**: `003-ui-sidebar-crud-i18n`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Upgrade design with a collapsible Sidebar layout, fluid animations, full Arabic and English bilingual localization with RTL support, and complete CRUD operations (Add, View Details, Edit, Delete) for all modules (Materials, Categories, Units, Vouchers) along with enhanced UX like printable vouchers and export."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enterprise Sidebar Navigation & Animated Layout (Priority: P1)

Warehouse managers, clerks, and field engineers need a modern, space-efficient Sidebar layout that organizes all warehouse modules cleanly, collapses to an icon rail for maximum data table workspace, and transitions smoothly between sections.

**Why this priority**: Enterprise ERPs require desktop-first sidebar ergonomics to navigate between catalog, receipts, dispatches, master data, and analytics without cluttering table viewports.

**Independent Test**: Load the app; verify the sidebar displays all primary modules with icons and badges. Toggle the collapse button and verify the sidebar smoothly shrinks to icon-only mode with tooltips, and on mobile devices opens as a slide-over drawer.

**Acceptance Scenarios**:

1. **Given** a user is navigating the ERP, **When** they view the sidebar, **Then** all modules (Dashboard, Catalog, Categories, Units, Material In, Material Out, Ledger) are organized with clear visual hierarchy and active route highlights.
2. **Given** a user wants more screen width for data tables, **When** they click the sidebar collapse toggle, **Then** the sidebar animates to a compact icon rail and remembers the collapsed state.
3. **Given** a user is on a mobile tablet/phone, **When** they click the menu hamburger button, **Then** the sidebar slides in smoothly over the content with a backdrop blur.

---

### User Story 2 - Bilingual Arabic & English Localization with Native RTL/LTR Support (Priority: P1)

Because Sinoma manages international contracting sites in Egypt, Saudi Arabia, and the MENA region with bilingual Arabic and English speaking staff, users must be able to switch between Arabic (العربية) and English instantaneously with full Right-to-Left (`dir="rtl"`) text and layout mirroring.

**Why this priority**: Essential operational requirement for construction site supervisors and local contractors in Egypt/MENA to work in their native language with accurate terminology.

**Independent Test**: Click the language switcher in the header. Verify the interface flips from English (LTR) to Arabic (RTL), all menus, buttons, forms, and tables display correct Arabic terminology, and reloading persists the chosen language.

**Acceptance Scenarios**:

1. **Given** the app is in English, **When** the user clicks "العربية", **Then** the entire document sets `dir="rtl"`, aligning sidebars and text to the right, and translates all labels (e.g. "Material In" -> "استلام وتوريد المواد", "Material Out" -> "صرف وتوزيع المواد").
2. **Given** the user switches language, **When** they open forms or modals, **Then** form labels, placeholder hints, error messages, and toast notifications render in the selected language.
3. **Given** a language selection is made, **When** the browser is refreshed or reopened, **Then** the language choice is persisted.

---

### User Story 3 - Full CRUD & Lifecycle Management for Materials (Priority: P1)

Warehouse clerks need complete lifecycle management for items in the catalog: adding new materials, viewing comprehensive item details, editing existing material specifications/locations/thresholds/photos, and deleting unused items safely.

**Why this priority**: Master data evolves continuously; users must be able to correct item names, update warehouse locations, replace photos, adjust safety stock, and remove erroneous entries.

**Independent Test**: Create an item, edit its name, storage location, and safety stock. Verify updates reflect immediately in the catalog. Attempt to delete an item with transaction history (verify deletion is blocked), then delete an unused item (verify successful removal).

**Acceptance Scenarios**:

1. **Given** an existing material, **When** the user clicks "Edit", **Then** a modal opens populated with current values, allowing modifications to name, category, unit, location, minStock, photo, and description.
2. **Given** updated values submitted, **When** saved, **Then** the catalog refreshes immediately and displays a success toast.
3. **Given** a material with active ledger or voucher transactions, **When** a user attempts to delete it, **Then** the system denies deletion and informs the user of linked history.
4. **Given** a material with zero transaction history, **When** deleted, **Then** the item is removed from the database and catalog.

---

### User Story 4 - Detailed Voucher Inspection, Print View & Cancellation Rollback (Priority: P1)

Users need to inspect complete voucher details (all line items, delivery notes, site work location, supplier), generate clean printable receipts/gate passes for physical signing, and cancel mistaken vouchers with automatic inventory rollback.

**Why this priority**: Official contracting handovers require paper gate passes signed by site engineers, and accidental voucher entries must be reversible without corrupting the inventory ledger.

**Independent Test**: Open any Material In or Material Out voucher row. Verify a detailed view modal shows the full document. Click "Print Voucher" to preview an A4 printable slip with signature lines. Test cancelling a voucher to verify on-hand stock and ledger delta are automatically reversed.

**Acceptance Scenarios**:

1. **Given** a voucher in the history list, **When** clicked, **Then** a detail view opens showing full voucher metadata, line items breakdown, quantities, and notes.
2. **Given** a voucher detail view, **When** the user clicks "Print Voucher / Gate Pass", **Then** a print-optimized window opens containing company header, voucher reference, line items, and signature boxes.
3. **Given** a Material Out voucher issued by mistake, **When** cancelled, **Then** the system restores the decremented quantities back to available stock and logs an offsetting `ADJUSTMENT` ledger entry.

---

### User Story 5 - Full CRUD for Categories & Units of Measure (Priority: P2)

Administrators need to edit existing Category and Unit of Measure details (names, codes, abbreviations, descriptions) and delete obsolete records with safety dependency guards.

**Why this priority**: Prevents orphaned or typoed categories/units and allows refining codes as warehouse taxonomies scale.

**Independent Test**: Edit a category name and description; verify materials reflect the updated category name. Verify deletion guards prevent removing units in use.

**Acceptance Scenarios**:

1. **Given** an existing category or unit, **When** clicked to edit, **Then** an edit modal allows updating its name, code, abbreviation, and description.
2. **Given** a category or unit linked to existing materials, **When** an admin clicks delete, **Then** the system blocks deletion and displays the number of linked items.

---

### User Story 6 - Data Export to CSV / Excel for Catalog & Ledger (Priority: P3)

Auditors and inventory controllers need to export the Material Catalog and the Inventory Ledger to CSV format for offline reconciliation, cycle counts, and finance reporting.

**Why this priority**: Construction contracting audits demand spreadsheet exports for monthly site reconciliation.

**Independent Test**: Click "Export to CSV" on the Catalog page or Ledger page. Verify a valid `.csv` file downloads with formatted columns matching the table.

**Acceptance Scenarios**:

1. **Given** a user is on the Material Catalog or Inventory Ledger, **When** they click "Export CSV", **Then** the browser downloads a UTF-8 CSV file containing all filtered records.

---

### Edge Cases

- **Bilingual Font Rendering**: Arabic text must render with proper typography (e.g., Cairo/Tajawal or system Arabic fonts) without awkward Latin kerning.
- **RTL Table Alignment**: Numerics, SKU codes, and voucher IDs must maintain LTR directionality (`dir="ltr"`) even in RTL mode so codes like `EGY-15200001` don't display inverted.
- **Rollback Invariance on Cancellation**: Cancelling a Material In voucher must verify that reducing current stock by the received quantity will not cause negative inventory if portions were already issued.
- **Mobile Drawer Dismissal**: Clicking outside the mobile sidebar drawer or navigating to a route must automatically close the drawer.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement a collapsible responsive Sidebar navigation layout with desktop collapse mode and mobile drawer.
- **FR-002**: The system MUST support instant bilingual switching between Arabic (`ar`) and English (`en`) with automatic `dir="rtl"` and `dir="ltr"` document updates.
- **FR-003**: The system MUST maintain strict adherence to domain terminology in both languages:
  - English: "Material In" & "Material Out".
  - Arabic: "استلام المواد (Material In)" و "صرف المواد (Material Out)".
- **FR-004**: The system MUST provide full CRUD for Materials: Create, Read (searchable/paginated), Update (edit specifications/photos/locations), and Delete (with transaction history guard).
- **FR-005**: The system MUST provide full CRUD for Categories and Units of Measure: Create, Read, Update, and Delete (with referential integrity guard).
- **FR-006**: The system MUST provide a Detailed Voucher View Modal for both Material In and Material Out showing all voucher metadata and line items.
- **FR-007**: The system MUST provide a Print View / Gate Pass for vouchers formatted for standard A4 printing with signature blocks.
- **FR-008**: The system MUST support Voucher Cancellation with automatic atomic inventory balance reversal and an immutable compensating ledger entry.
- **FR-009**: The system MUST provide a CSV export feature for both the Material Catalog and the Inventory Ledger.
- **FR-010**: The system MUST persist language (`lang`), theme (`theme`), and sidebar collapsed state (`sidebar:collapsed`) in browser local storage.

### Key Entities *(include if feature involves data)*

- **Material**: Updated actions for update (`updateMaterial`) and safe delete (`deleteMaterial`).
- **Category**: Updated actions for update (`updateCategory`) and delete (`deleteCategory`).
- **UnitOfMeasure**: Updated actions for update (`updateUnitOfMeasure`) and delete (`deleteUnitOfMeasure`).
- **MaterialInVoucher & MaterialOutVoucher**: Status states (`COMPLETED`, `CANCELLED`), cancellation action (`cancelMaterialInVoucher`, `cancelMaterialOutVoucher`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Language switch between Arabic and English renders in under 50ms without full page reload.
- **SC-002**: 100% of user interface elements, notifications, and form errors display in the active language.
- **SC-003**: In RTL mode, SKU codes, quantities, and dates remain properly formatted without visual inversion.
- **SC-004**: Users can view, edit, or delete any entity in under 3 clicks from its parent list view.
- **SC-005**: 100% of cancelled vouchers reverse inventory changes atomically with 0 discrepancy in on-hand balance.
- **SC-006**: Printable vouchers fit cleanly onto a single A4 page with 0 cutoff text or table overflow.

## Assumptions

- Users switch language via a persistent toggle located in the application header or sidebar.
- Material SKU codes and technical identifiers remain Latin alphanumeric across both English and Arabic modes for international standardization.
- Printing leverages standard browser `window.print()` with CSS `@media print` print styles for maximum cross-device compatibility.

