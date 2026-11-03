# Quickstart Validation Guide: Feature 004

## Scenario 1: Stock Threshold & Safety Stock Filtering
1. Open `http://localhost:3000/materials`.
2. Locate the stock status dropdown. Select **"Below Safety Stock" (أقل من حد الأمان)**.
   - Verify that all displayed materials have `currentStock <= minStock`.
3. Locate the quantity threshold input (`≤ Qty`). Type `10` and submit search.
   - Verify that all returned materials have `currentStock <= 10`.
4. Switch filter back to **"All Stock Levels"** to verify normal list restoration.

---

## Scenario 2: Universal Image Format Upload (AVIF / JFIF / WebP)
1. In the Material Catalog, click **"Add Material" (إضافة مادة)** or **"Edit" (تعديل)** on an existing material.
2. Select an image file with `.avif`, `.jfif`, `.webp`, `.png`, or `.jpg` format (e.g. the Stanley club hammer image).
3. Observe that the file is accepted without "Invalid file format" error.
4. Verify that the image preview appears immediately in the modal thumbnail.
5. Click **"Save" (حفظ)** and verify that the photo displays in the material row thumbnail.

---

## Scenario 3: Selective Multi-Material Selection & Formatted Excel Report
1. On the Material Catalog table, check the checkboxes next to 2 or 3 low-stock items.
2. Observe the floating action bar at the bottom: "3 items selected" (تم تحديد 3 مواد).
3. Click **"Export Selected to Excel" (تصدير المواد المحددة إلى Excel)**.
4. Open the downloaded `.csv` file in Microsoft Excel:
   - Verify Sinoma letterhead header rows exist.
   - Verify accurate columns: SKU, Name, Category, Location, Current Stock, Min Safety Stock, **Required Reorder Deficit**, Unit.
   - Verify deficit is correctly calculated: `minStock - currentStock`.
   - Verify Arabic and English texts display clearly without mojibake.
5. Click **"Clear Selection" (إلغاء التحديد)** and verify checkboxes uncheck.

---

## Scenario 4: Interactive Pagination Controls
1. On `/materials`, change page size selector from `20` to `10`.
   - Verify table re-renders displaying 10 rows.
2. Click **"Next" (التالي)** or page number **"2"**.
   - Verify table transitions to Page 2 smoothly.
3. Select an item on Page 2, navigate back to Page 1.
   - Verify selection counter still indicates the item selected from Page 2 is retained.

