# Feature Specification: Stock Threshold Filtering, Universal Image Upload, Selective Excel Reports, and Interactive Pagination

**Feature Branch**: `004-catalog-filters-excel-pagination`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "في الماتيريال كاتيجوري انا عاوز يبقي في فلتريشن لي current stock بحيث لما اجي اعمل فلتر بالعدد يجبلي كل الماتيريال الي اقل من الحد المطلوب في صوره انا ضفتها الصيغه بتاعتها متقبلتش وهي وفي الاخر لما مثلا الاستوك تكون وصلت للحد الادني اختار منهم الماتيريال معينه عاوز يبقي لي الاختيار عشان اعمل بيهم تقرير اكسيل ويكون متظبط وجاهز ومعروض صح علي الاكسيل وعاوز اعمل pagenation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Intelligent Stock Threshold & Safety Stock Filtering (Priority: P1)

Warehouse controllers and procurement engineers need to rapidly isolate materials that have reached or dropped below critical safety thresholds, or search for materials that fall below a specific quantity limit, so that shortage items can be replenished before site work stops.

**Why this priority**: Construction job sites depend on uninterrupted material availability; supervisors must immediately identify which items are below minimum safety stock without scrolling through hundreds of catalog items.

**Independent Test**: Navigate to the Material Catalog (`/materials`). Select the stock status filter "Below Safety Stock (Low Stock)". Verify only materials where current stock is less than or equal to minimum stock are returned. Enter an explicit quantity threshold (e.g. `≤ 15`) and verify the table displays only items with current stock $\le 15$.

**Acceptance Scenarios**:

1. **Given** the Material Catalog page, **When** the user selects the "Below Safety Stock" filter, **Then** the table displays only materials where current stock is less than or equal to their safety stock (`currentStock <= minStock`).
2. **Given** the user enters a numeric threshold value $X$, **When** filter is applied, **Then** the table displays only materials whose current stock is less than or equal to $X$.
3. **Given** the user combines category filter and stock threshold filter, **When** search executes, **Then** only materials matching both the category and the stock condition are shown.
4. **Given** the user clears the stock filter, **When** reset, **Then** all materials are displayed according to default sorting.

---

### User Story 2 - Universal Image Format Upload Support (Priority: P1)

Warehouse staff frequently download item reference photos from tool manufacturers and e-commerce websites (e.g. Stanley, Bosch, Hilti) that use modern web image formats such as AVIF, JFIF, or WebP. Users must be able to upload photos in any standard image format without rejection errors.

**Why this priority**: Eliminates user frustration when registering tools or materials whose photos are downloaded in newer formats like `.avif` or `.jfif`, ensuring 100% catalog visual completeness.

**Independent Test**: Open the Add Material modal or Edit Material modal. Upload an image in AVIF or JFIF format (e.g. tool product images). Verify the upload completes successfully, preview displays immediately, and saving persists the image URL properly.

**Acceptance Scenarios**:

1. **Given** an image file in `AVIF`, `JFIF`, `WebP`, `PNG`, `JPEG`, `BMP`, or `SVG` format, **When** selected in the file upload dialog, **Then** the system accepts the file without throwing an invalid format error.
2. **Given** a successful file upload, **When** the server responds, **Then** the image preview renders immediately in the modal and the image URL is bound to the form state.
3. **Given** a file with uppercase extension (e.g. `.PNG`, `.JPG`, `.AVIF`), **When** uploaded, **Then** the system normalizes the extension and stores the file safely.
4. **Given** a non-image file (e.g. `.pdf`, `.exe`), **When** selected, **Then** the system displays a clear error informing the user that only image files are accepted.

---

### User Story 3 - Selective Multi-Material Selection & Formatted Excel/CSV Reorder Report (Priority: P1)

When inventory reaches safety minimums, warehouse supervisors need to pick specific shortage items via checkboxes and generate a professionally formatted Excel/CSV requisition report to send directly to the procurement department and site management.

**Why this priority**: Procurement requires targeted purchasing lists with explicit deficit quantities rather than raw unorganized database dumps.

**Independent Test**: Filter for low-stock items. Select three specific items using the row checkboxes. Click "Export Selected to Excel". Open the generated file in Microsoft Excel; verify the report contains official Sinoma header metadata, accurate item details, auto-calculated reorder deficit quantities, and clean UTF-8 encoding in Arabic and English.

**Acceptance Scenarios**:

1. **Given** the material catalog table, **When** the user clicks the checkbox on any row, **Then** that material is added to the selection list and a floating action bar appears indicating the count of selected items.
2. **Given** multiple items in the current page, **When** the user clicks the header checkbox, **Then** all visible materials are toggled selected or deselected.
3. **Given** one or more items selected, **When** the user clicks "Export Selected to Excel", **Then** the system downloads a structured CSV file containing only the selected items.
4. **Given** the exported spreadsheet, **When** opened in Microsoft Excel, **Then** it features a clean report title, timestamp, exact SKU codes, material names, categories, locations, current stock, safety minimum, **required reorder quantity** ($\max(0, \text{minStock} - \text{currentStock})$), and summary statistics without encoding corruption.
5. **Given** zero items manually selected, **When** the user clicks "Export All Filtered", **Then** the full filtered dataset is exported.

---

### User Story 4 - Interactive Full Pagination for Material Catalog (Priority: P2)

As the warehouse catalog grows to hundreds or thousands of SKUs, users require full interactive pagination to navigate pages smoothly, change page sizes, and maintain selections across page changes.

**Why this priority**: Large tables without pagination degrade browser performance and cause overwhelming vertical scroll.

**Independent Test**: Load the Material Catalog. Verify the pagination controls display total records, current page, and total pages. Change page size from 20 to 50 items. Navigate to Page 2. Select an item on Page 2, navigate back to Page 1, and verify the selected item remains preserved in the export list.

**Acceptance Scenarios**:

1. **Given** the catalog table, **When** viewed, **Then** pagination controls display at the bottom showing current page, total pages, and total record count.
2. **Given** multiple pages of data, **When** the user clicks "Next", "Previous", or a specific page number, **Then** the table updates with that page's items smoothly.
3. **Given** the page size selector, **When** changed (10, 20, 50, 100), **Then** the page resets to Page 1 and displays the requested number of rows per page.
4. **Given** an item selected on Page 1, **When** the user navigates to Page 2, **Then** the selection count and selected items remain retained for export.

---

### Edge Cases

- **Negative or Non-Numeric Threshold Input**: If a user enters negative numbers or non-numeric characters in the threshold filter, the system sanitizes or resets the filter to positive integers.
- **Deficit Calculation on Healthy Stock**: If a selected material has `currentStock >= minStock`, the reorder deficit in the Excel report must display `0` (or `Nil`) rather than a negative number.
- **Missing File MIME Type**: If an operating system sends an image with an empty MIME type or generic `application/octet-stream`, the system inspects the file extension fallback before rejecting.
- **Selection Persistence on Filter Change**: If a user changes category or search query, selected items remain in memory unless explicitly cleared by the "Clear Selection" button.
- **Bilingual Excel Rendering**: Spreadsheet headers and numbers must display correctly in Microsoft Excel across both Windows and macOS without broken characters.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow filtering materials by safety stock status (`All`, `Low Safety Stock`, `Out of Stock`, `In Stock`).
- **FR-002**: The system MUST allow filtering materials by an explicit maximum current stock threshold value ($CurrentStock \le X$).
- **FR-003**: The file upload endpoint MUST accept image formats: `image/jpeg`, `image/png`, `image/webp`, `image/avif`, `image/jfif`, `image/pjpeg`, `image/bmp`, and `image/svg+xml`, with fallback extension validation.
- **FR-004**: The file upload response MUST return both `url` and `imageUrl` properties containing the relative public asset path.
- **FR-005**: The material catalog table MUST provide row-level checkboxes and a header select-all toggle.
- **FR-006**: The system MUST display a floating selection action bar when $\ge 1$ item is selected, showing selection count, "Export Selected to Excel", and "Clear Selection" actions.
- **FR-007**: The exported Excel/CSV report MUST include report header metadata (company name, title, generation timestamp, item count) and calculated shortage/reorder deficit ($\max(0, \text{minStock} - \text{currentStock})$).
- **FR-008**: The exported file MUST encode with UTF-8 BOM (`\uFEFF`) to ensure seamless native Arabic and English display in Microsoft Excel.
- **FR-009**: The material catalog MUST provide full interactive pagination controls (Previous, Next, page numbers, items per page selector: 10, 20, 50, 100).
- **FR-010**: The material selection state MUST persist across pagination transitions.

### Key Entities

- **Material**: Existing entity in PostgreSQL with fields `itemCode`, `name`, `categoryId`, `unitId`, `currentStock`, `minStock`, `location`, `imageUrl`.
- **MaterialFilterParams**: Filter contract supporting `query`, `categoryId`, `stockStatus`, `maxStock`, `page`, `limit`.
- **SelectedMaterialExport**: Data projection formatted for Excel export with computed `reorderQty` deficit and localized alert status.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can filter and isolate all low safety stock materials in under 2 clicks.
- **SC-002**: 100% of standard web product images (including AVIF, JFIF, WebP, PNG, JPEG) upload and preview without format errors.
- **SC-003**: Generated Excel reports open in Microsoft Excel with 0 corrupted Arabic characters and 100% accurate shortage calculation.
- **SC-004**: Users can select specific shortage items across multiple pages and download an Excel reorder report in under 5 seconds.
- **SC-005**: Catalog pagination renders under 150ms per page transition.

## Assumptions

- Users download product images from diverse manufacturer and vendor websites where `.avif` and `.jfif` are prevalent.
- Material reorder quantity is defined as the difference between minimum safety stock and current on-hand stock ($\text{minStock} - \text{currentStock}$).
- Microsoft Excel is the primary desktop spreadsheet viewer used by warehouse and procurement personnel.

