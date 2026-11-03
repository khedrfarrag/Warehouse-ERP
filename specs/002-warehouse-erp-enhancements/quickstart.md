# Quickstart & Verification Guide: Advanced ERP Enhancements

**Feature**: [spec.md](spec.md) | **Branch**: `002-warehouse-erp-enhancements` | **Date**: 2026-10-29

## Verification Scenarios

### Scenario 1: Dark Mode / Light Mode Theme Toggle
1. Open the application at `http://localhost:3000`.
2. Locate the Theme Toggle icon (Sun/Moon) in the top-right navbar.
3. Click the icon to switch from Light Mode to Dark Mode.
4. **Expected Result**: Background transitions to dark slate, text colors invert smoothly, cards and tables adopt high-contrast borders. Refreshing the browser preserves the dark mode preference.

---

### Scenario 2: Manage Categories & Units of Measure (CRUD)
1. Navigate to Settings / Master Data or click **Manage Categories**.
2. Create a Category:
   * **Name**: `Civil Infrastructure`
   * **Code**: `1`
3. Create a Unit of Measure:
   * **Name**: `Metric Ton`
   * **Abbreviation**: `TON`
   * **Code**: `3`
4. **Expected Result**: Both records are saved in PostgreSQL and immediately appear in selection menus.

---

### Scenario 3: Register Material with Smart Item Code & Image
1. Navigate to `/materials` and click **Add Material**.
2. Select Warehouse Country: `EGY`.
3. Select Category: `Civil Infrastructure` (Code 1).
4. Enter Attribute Code: `5` (e.g. High-Tensile).
5. Select Unit: `Kilogram` (Code 2).
6. **Expected Result**: The Item Code field automatically populates with `EGY-15200001`.
7. Upload a sample JPEG/PNG photo of steel rebar.
8. Save the material.
9. **Expected Result**: The material appears in the catalog with its image thumbnail and smart SKU.

---

### Scenario 4: Inbound & Outbound Advanced Material Selector (20 Items Limit)
1. Navigate to `/material-in/new` or `/material-out/new`.
2. In the Line Items table, click **Select Material** button.
3. **Expected Result**: A clean popover/modal opens displaying materials paginated at exactly 20 items per page with page numbers.
4. Type "Steel" into the search bar.
5. **Expected Result**: Matches filter in real time with stock counts. Selecting an item closes the modal and populates the line item row.

---

### Scenario 5: Material Out Job-Site Location Field
1. Navigate to `/material-out/new`.
2. Inspect the form fields.
3. **Expected Result**:
   * Confirm the old `issuedBy` field has been removed.
   * Confirm the new required field **Site Usage Area / Work Location** is present (e.g., "Kiln Preheater Tower - Level 4").
4. Submit the voucher and verify the site location is recorded in the voucher history and ledger audit notes.

