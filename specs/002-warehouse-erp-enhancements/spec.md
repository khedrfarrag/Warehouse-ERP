# Feature Specification: Contracting Warehouse ERP Advanced Enhancements

**Feature Branch**: `002-warehouse-erp-enhancements`

**Created**: 2026-10-29

**Status**: Draft

**Input**: User description: "Add dark/light mode; add relational Category/Catalog CRUD; add relational Unit of Measure (UOM) CRUD; generate automatic structured smart Item Codes (e.g., EGY-15200001 based on warehouse country, category code, attribute code, and unit code); implement advanced searchable/filterable paginated Material Selector with 20 items limit in Material In and Material Out; replace issuedBy in Material Out with site work/usage sub-location; add image upload and display for materials."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Relational Categories & Units of Measure (UOM) Management (Priority: P1)

Warehouse administrators and site managers need dedicated relational management for material Categories and Units of Measure instead of fixed hardcoded lists, allowing dynamic creation, editing, and assignment of enterprise categories and measurement units.

**Why this priority**: Categories and Units of Measure provide the foundational relational taxonomy and the numeric encoding required by the smart Item Code generator.

**Independent Test**: Create a Category (e.g., "Civil Works", Code: "1") and a Unit (e.g., "Kilogram", Code: "2", Abbreviation: "KG"). Verify they appear in the material registration form dropdowns and can be edited.

**Acceptance Scenarios**:

1. **Given** a warehouse admin is configuring the catalog, **When** they add a new Category with name "Civil Works" and numeric code "1", **Then** the category is saved and immediately available for selection when registering new materials.
2. **Given** a warehouse admin needs a specialized unit of measure, **When** they create a new UOM with name "Metric Ton", abbreviation "TON", and numeric code "7", **Then** the unit is saved and selectable across materials and vouchers.
3. **Given** a category or unit is actively assigned to existing materials, **When** an admin attempts to delete it, **Then** the system prevents deletion and warns that active materials depend on this record.

---

### User Story 2 - Automated Smart Structured Item Code Generation (Priority: P1)

Warehouse officers registering materials need the system to automatically generate a standardized, meaningful Item Code (SKU) based on warehouse country, category code, attribute code, unit code, and a sequential/unique identifier (e.g. `EGY-15200001`), eliminating manual typing errors and standardizing naming across sites.

**Why this priority**: Enforces enterprise-grade inventory classification across multi-country contracting operations (such as Sinoma Egypt / MENA projects).

**Independent Test**: In the material creation modal, select country "EGY", Category "1", Attribute "5", and Unit "2". Verify the system auto-generates the code `EGY-15200001` with an option to refresh/customize before saving.

**Acceptance Scenarios**:

1. **Given** a user is creating a new material, **When** they select warehouse country "EGY", Category Code "1", Type Code "5", and Unit Code "2", **Then** the item code field automatically populates with `EGY-15200001` (or next available sequence).
2. **Given** the generated code already exists, **When** the code generator runs, **Then** it automatically increments the sequence number to prevent collisions.
3. **Given** a user with custom SKU requirements, **When** they modify or manually edit the generated code, **Then** the system validates uniqueness and formatting.

---

### User Story 3 - Material Images & Visual Catalog (Priority: P1)

Warehouse workers and site engineers need visual identification of construction materials (such as specific valve types, cable gauges, safety gear, or rebar profiles) via uploaded photos displayed in the catalog and details modals.

**Why this priority**: Construction job sites employ multi-lingual workforces where visual photos prevent wrong material dispatches and ensure correct item identification.

**Independent Test**: Upload an image file for a material (e.g., safety helmet photo). Verify the image thumbnail displays in the catalog table and enlarges in a preview dialogue.

**Acceptance Scenarios**:

1. **Given** a user is creating or editing a material, **When** they upload a photo (JPEG, PNG, WebP), **Then** the image is previewed, uploaded, and linked to the material record.
2. **Given** materials with uploaded photos, **When** a user browses the Material Catalog, **Then** thumbnails are visible alongside item codes and names, and clicking opens a high-resolution preview.
3. **Given** an invalid file (non-image format or exceeding size limit), **When** uploaded, **Then** the system rejects the file with descriptive validation feedback.

---

### User Story 4 - Advanced Paginated Material Selector for Vouchers (Limit: 20) (Priority: P1)

When preparing Material In receipts or Material Out dispatches, warehouse clerks need an advanced modal/popover material picker that supports live search, category filtering, real-time available stock display, and clean pagination limited to 20 items per page, replacing bulky native dropdowns.

**Why this priority**: Large contracting warehouses stock thousands of items; basic dropdowns are unusable for large datasets, while a paginated, searchable selector provides fast, accurate item picking.

**Independent Test**: Open the Material In or Material Out voucher form and click "Select Material". Verify an interactive table modal opens showing up to 20 items per page with search, category filtering, and pagination controls.

**Acceptance Scenarios**:

1. **Given** a user is adding a line item in Material In or Material Out, **When** they click "Select Material", **Then** an interactive picker appears showing 20 materials per page with pagination controls.
2. **Given** the picker is open, **When** the user types a search term (e.g., "Steel") or selects a category filter, **Then** matching materials update instantly with their current on-hand stock and unit.
3. **Given** a user selects a material from the picker, **When** chosen, **Then** the line item is populated with the selected material details and the modal closes automatically.

---

### User Story 5 - Material Out Specific Work Site / Usage Sub-Location Tracking (Priority: P2)

Site controllers and warehouse officers need Material Out vouchers to capture the exact sub-location or construction area within the job site (e.g., "Kiln Tower - Level 4", "Preheater Foundation", "Raw Mill Building") where the material will be consumed, replacing the generic `issuedBy` employee field.

**Why this priority**: Mega-projects span square kilometers with dozens of simultaneous construction zones; knowing the exact site sub-location is critical for cost allocation and field inspections.

**Independent Test**: Create a Material Out voucher. Confirm the `issuedBy` field is absent, and the "Site Usage Location / Area" field is required and stored with the voucher.

**Acceptance Scenarios**:

1. **Given** a user opens the Material Out form, **When** inspecting voucher fields, **Then** the form requires "Project / Site Name" and "Site Usage Area / Work Location" (e.g., "Kiln Tower Level 4"), with `issuedBy` removed.
2. **Given** a completed Material Out voucher, **When** viewed in the dispatches history or ledger, **Then** the specific site usage area is prominently displayed in the transaction record.

---

### User Story 6 - Dark & Light Theme Switcher (Priority: P3)

Users operating laptops or rugged tablets in bright outdoor sunlight or during night shifts need to toggle between light and dark visual themes.

**Why this priority**: Enhances accessibility, reduces screen glare during night operations, and improves battery longevity on mobile tablets.

**Independent Test**: Click the theme toggle icon in the navigation bar. Verify the entire application switches between Light and Dark modes seamlessly and persists the user preference.

**Acceptance Scenarios**:

1. **Given** the app is in light mode, **When** the user clicks the theme toggle, **Then** the UI smoothly switches to dark theme with appropriate slate/neutral dark tones.
2. **Given** a user selected dark theme, **When** they refresh the browser or navigate between pages, **Then** the dark theme selection is preserved.

---

### Edge Cases

- **Smart Code Collision**: If a generated item code is already used, the generator must automatically compute the next incremented sequential suffix without failing.
- **Image Upload Failures / Missing Images**: If an image upload fails or an item has no image, the UI must fall back gracefully to a clean SVG placeholder.
- **Material Selector with Zero Results**: When filtering materials with no matches, the selector shows a helpful empty state with a direct shortcut to register a new material.
- **Active Category/Unit Deletion Guard**: Preventing deletion of Categories or Units of Measure that have linked materials in the database to preserve referential integrity.
- **Large Page Navigation**: The paginated selector must maintain fast response times (<200ms) when navigating pages 1 to N.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide full CRUD management for Categories (`Category`), including Name, Category Numeric Code (1-99), and Description.
- **FR-002**: The system MUST provide full CRUD management for Units of Measure (`UnitOfMeasure`), including Name, Abbreviation (e.g., KG, MTR, BAG), Unit Numeric Code (1-99), and Description.
- **FR-003**: The system MUST link `Material` entities to relational `Category` and `UnitOfMeasure` records via foreign key relationships.
- **FR-004**: The system MUST automatically generate smart Item Codes formatted as `[CountryCode]-[CategoryCode][AttributeCode][UnitCode][SequenceNumber]` (e.g., `EGY-15200001`), dynamically updating when selecting category and unit parameters.
- **FR-005**: The system MUST allow users to upload, preview, and store an image for each material item (supporting PNG, JPEG, WebP up to 5MB).
- **FR-006**: The system MUST provide an advanced Material Selector modal/popover component in both Material In and Material Out voucher workflows, featuring real-time search, category filters, and server/client pagination fixed at 20 items per page.
- **FR-007**: The system MUST remove `issuedBy` from the Material Out voucher schema and UI, replacing it with a mandatory `siteLocation` field (representing the specific site zone/building/work area where the material will be deployed).
- **FR-008**: The system MUST provide a Dark Mode / Light Mode theme toggle in the navigation header, applying consistent theme styles across all screens and persisting the preference in local storage.
- **FR-009**: The system MUST continue strictly enforcing the domain terminology **Material In** and **Material Out** across all updated screens and selectors.

### Key Entities *(include if feature involves data)*

- **Category**: Represents a classification tier for contracting materials. Attributes: ID, Name, Code (numeric string, e.g. "1"), Description, CreatedAt.
- **UnitOfMeasure**: Represents a standard measurement unit. Attributes: ID, Name, Abbreviation (e.g. "KG", "BAG"), UnitCode (numeric string, e.g. "2"), Description, CreatedAt.
- **Material (Enhanced)**: Attributes: ID, ItemCode (smart generated), Name, CategoryId (FK -> Category), UnitId (FK -> UnitOfMeasure), ImageUrl (optional photo URL/path), MinStock, CurrentStock, Location, Description.
- **MaterialOutVoucher (Enhanced)**: Attributes: ID, VoucherNo, Date, ProjectName, SiteLocation (specific construction zone/building), RequisitionNo, Recipient, Notes, Status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Warehouse clerks can generate a valid, formatted smart Item Code in 0 manual typing steps upon selecting category and unit.
- **SC-002**: Material selector modal loads 20 items and responds to search queries in under 300ms.
- **SC-003**: 100% of Material Out dispatches record the specific site work location for audit and field traceability.
- **SC-004**: Users can toggle between Dark and Light mode in under 100ms without layout shifting or page reload.
- **SC-005**: 100% of material image uploads are verified for file type and dimension suitability before storage.

## Assumptions

- Warehouse country defaults to "EGY" (Egypt) for Sinoma regional operations, with configurable options for other project countries (e.g. "KSA", "UAE", "CHN").
- Material images are stored locally in the public uploads directory or cloud storage bucket with optimized asset URLs.
- The theme preference is stored in the browser's `localStorage` or cookie for instant application on initial page load.

