# Quickstart Validation Guide: Feature 003

## Prerequisites
- PostgreSQL running locally with database `sinoma_warehouse_erp`.
- Node.js dependencies installed.

## 1. Verify Layout & Sidebar Navigation
- Open `http://localhost:3000`.
- Verify the desktop Sidebar displays all modules with icons: Dashboard, Material Catalog, Categories, Units, Material In, Material Out, Ledger.
- Click the collapse toggle on the sidebar: verify smooth width transition from 256px to 72px icon rail. Tooltips should display module names on hover.
- Resize viewport to mobile (< 1024px): verify hamburger button appears in the top bar. Click hamburger; verify mobile drawer slides in with backdrop blur.

## 2. Verify Bilingual i18n & RTL/LTR
- In the top header or sidebar, click the Language switch button (العربية / English).
- Verify document direction updates instantly to `dir="rtl"` in Arabic mode.
- Verify text translates to Arabic:
  - "Material In" -> "استلام وتوريد المواد"
  - "Material Out" -> "صرف وتوزيع المواد"
- Verify SKU codes (`EGY-15200001`) and numbers maintain LTR ordering without reversing.
- Refresh the page: verify Arabic selection is remembered.

## 3. Verify Complete CRUD Operations
- **Categories**: Go to `/categories`. Add a category, edit its name/code, verify it updates. Try deleting an empty category (should succeed). Try deleting a category with materials (should block with warning).
- **Units**: Go to `/units`. Add a unit, edit its name/code/abbreviation. Try deleting an empty unit (should succeed). Try deleting an in-use unit (should block with warning).
- **Materials**: Go to `/materials`. Click Edit on any material. Modify name, location, safety stock, or photo. Save and verify table reflects updates. Try deleting an unused material (succeeds) vs used material (safely rejected).

## 4. Verify Voucher Inspection, Printing, and Cancellation
- Go to `/material-in` or `/material-out`.
- Click on any voucher row to open the Detailed Voucher View Modal.
- Click "Print Voucher / Gate Pass". Verify print dialog triggers and layout renders Sinoma header and 3 signature blocks cleanly.
- Test cancelling a voucher: click "Cancel Voucher". Verify status changes to `CANCELLED`, current stock rolls back in the database, and a new `ADJUSTMENT` record appears in `/ledger`.

## 5. Verify CSV Export
- Click "Export CSV" on `/materials` and `/ledger`.
- Verify `.csv` downloads and opens properly with UTF-8 encoding in Microsoft Excel.

