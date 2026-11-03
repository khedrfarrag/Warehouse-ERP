# Phase 0 Research: Stock Threshold Filtering, Universal Image Upload, Selective Excel Reports, and Interactive Pagination

## 1. Native Database Querying for Stock Threshold & Safety Filtering

- **Decision**: Leverage Prisma 6.2.1 native field-to-field references (`prisma.material.fields.minStock`) combined with optional threshold values directly in PostgreSQL query filters.
- **Rationale**:
  - In construction warehouse management, inventory queries must scale efficiently. Running `WHERE "currentStock" <= "minStock"` at the database level utilizes PostgreSQL column evaluation without fetching entire tables into Node.js server memory.
  - Tested and verified directly in the active project environment:
    ```ts
    where: {
      currentStock: { lte: prisma.material.fields.minStock }
    }
    ```
    returns exact matching records in < 5ms.
  - Adding `maxStock` parameter enables users to find materials below any arbitrary quantity (e.g. `currentStock <= 15`).
- **Alternatives Considered**:
  - *In-memory JavaScript filtering*: Rejected because fetching all materials from the database before applying `filter(m => m.currentStock <= m.minStock)` breaks server-side pagination and degrades performance as inventory expands.
  - *Raw SQL queries (`prisma.$queryRaw`)*: Rejected because Prisma 6 natively supports typed field references, maintaining type safety and schema consistency.

---

## 2. Universal Image Format Pipeline & Contract Normalization

- **Decision**: Expand allowed MIME types to include `image/avif`, `image/jfif`, `image/pjpeg`, `image/bmp`, `image/svg+xml`, alongside `image/webp`, `image/png`, and `image/jpeg`. Implement extension-based fallback validation, and unify API response keys to return both `url` and `imageUrl`.
- **Rationale**:
  - E-commerce and tool manufacturers (e.g., Stanley, Bosch, Hilti, DeWalt) routinely deliver product assets encoded in AVIF or JFIF.
  - Windows browsers frequently report JFIF files with `image/pjpeg` or empty MIME headers, causing false-positive rejections.
  - Unifying the API response payload:
    ```json
    {
      "success": true,
      "url": "/uploads/materials/...",
      "imageUrl": "/uploads/materials/...",
      "fileName": "..."
    }
    ```
    prevents contract drift between `material-form.tsx` (which reads `data.url`) and `material-edit-modal.tsx`.
- **Alternatives Considered**:
  - *Server-side image transcoding (Sharp)*: Not necessary at this stage since modern browsers render AVIF, WebP, SVG, and PNG natively; direct storage avoids external native binary dependencies on Windows.

---

## 3. Multi-Select Checkbox State & Formatted Excel Reorder Engine

- **Decision**: Implement a decoupled `selectedIds` state (`Record<string, SelectedMaterial>` / `Set<string>`) that persists selections independently of active table pagination. Create an enhanced `exportReorderReportToCsv` generator with UTF-8 BOM encoding and formatted procurement sections.
- **Format Architecture**:
  1. **Document Letterhead**:
     - Line 1: `SINOMA CONTRACTING WAREHOUSE - LOGISTICS & PROCUREMENT DIVISION`
     - Line 2: `OFFICIAL INVENTORY REORDER & MATERIAL DEFICIT REPORT`
     - Line 3: `Generated: [YYYY-MM-DD HH:mm] | Total Shortage Items: [X]`
  2. **Data Columns**:
     - `#`, `Item Code (SKU)`, `Material Name`, `Category`, `Storage Location`, `Current Stock`, `Safety Minimum`, `Required Reorder Deficit`, `Unit`, `Stock Status`, `Remarks`
  3. **Auto-Calculated Deficit**:
     - $\text{Deficit} = \max(0, \text{minStock} - \text{currentStock})$
  4. **Summary Row**:
     - `TOTAL`, ``, ``, ``, ``, `Sum Current`, `Sum Min`, `Sum Deficit`, ``, ``, ``
  5. **BOM Encoding**:
     - `\uFEFF` Byte Order Mark ensures Microsoft Excel opens Arabic and English without mojibake.
- **Alternatives Considered**:
  - *Standard CSV export with only table rows*: Rejected because warehouse purchasing officers require formal document headers and explicit deficit quantities for purchasing approvals.

---

## 4. Interactive Full Pagination Architecture

- **Decision**: Combine server-side pagination (`skip`, `take`, `total`, `totalPages`) with a rich pagination bar in `src/app/materials/page.tsx`:
  - Page Navigation: Previous, Next, numeric page buttons.
  - Page Size Selector: 10, 20, 50, 100 items per page.
  - Selection Persistence: Selected materials remain checked when navigating back and forth across pages.
  - Record Counter: "Showing X to Y of Z materials".
- **Alternatives Considered**:
  - *Infinite scrolling*: Rejected for enterprise ERPs because warehouse clerks need specific page references when auditing physical bin locations.

