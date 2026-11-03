# Implementation Plan: Contracting Warehouse ERP Advanced Enhancements

**Branch**: `002-warehouse-erp-enhancements` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-warehouse-erp-enhancements/spec.md`

## Summary

This enhancement release equips the Contracting Warehouse ERP with high-demand enterprise capabilities:
1. **Dark & Light Mode** theme switching using `next-themes` and Tailwind CSS.
2. **Relational Category & Unit of Measure CRUD** models in PostgreSQL with Prisma.
3. **Smart Structured Item Code Generator** producing normalized SKUs (e.g. `EGY-15200001`).
4. **Advanced Paginated Material Selector** modal (fixed limit: 20 items per page) with search and filters in Material In and Material Out vouchers.
5. **Material Out Location Refinement**: removing `issuedBy` and introducing dedicated construction site work area tracking (`siteLocation`).
6. **Material Image Upload & Preview** with local filesystem storage and thumbnail caching.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+

**Primary Dependencies**: Next.js 15, Prisma 6+, `next-themes` 0.4+, React Hook Form 7+, Zod 3+, Sonner, Motion 12+, Tailwind CSS 3.4+.

**Storage**: PostgreSQL with Prisma ORM (relational models `Category`, `UnitOfMeasure`, `Material`, `MaterialInVoucher`, `MaterialOutVoucher`, `InventoryLedger`). Image assets stored under `public/uploads/materials/`.

**Testing**: E2E scenario walkthroughs in `quickstart.md`, TypeScript strict compile checks (`tsc --noEmit`).

**Target Platform**: Responsive Web (Chrome, Edge, Firefox, Safari on desktop and construction site tablets).

**Project Type**: Full-stack Next.js web application.

**Performance Goals**: Material selector modal search response <200ms, theme switch <50ms without hydration flash, image upload <1s.

**Constraints**: Strict adherence to domain terminology (Material In / Material Out), zero negative stock invariance, strict foreign key constraints between Category/Unit and Material.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Next.js Architecture)**: All new UI controls utilize Client Components while mutations execute via Server Actions and route handlers.
- [x] **Principle II (PostgreSQL Relational Integrity)**: Relational `Category` and `UnitOfMeasure` with foreign keys to `Material`. `siteLocation` field added to `MaterialOutVoucher`.
- [x] **Principle III (Type-Safe Forms & Reactive Feedback)**: React Hook Form + Zod for Category, Unit, and Material forms; Sonner toast feedback for all operations.
- [x] **Principle IV (Ubiquitous Domain Terminology)**: Strictly Material In & Material Out maintained across all selector modals and forms.
- [x] **Principle V (Scalable Architecture & Audit Trails)**: Material selector paginated at 20 items to prevent DOM bloat on large catalogs; site work location captured in immutable ledger notes.

## Project Structure

### Documentation (this feature)

```text
specs/002-warehouse-erp-enhancements/
├── plan.md              # This file
├── research.md          # Phase 0 decisions
├── data-model.md        # Enhanced relational schema
├── quickstart.md        # E2E validation steps
├── contracts/           # API and component contracts
│   ├── category-api.md
│   ├── uom-api.md
│   ├── smart-item-code-api.md
│   ├── material-selector-api.md
│   └── image-upload-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command)
```

### Source Code Impact & New Files

```text
prisma/
└── schema.prisma                           # Add Category, UnitOfMeasure, imageUrl, siteLocation

public/
└── uploads/materials/                      # Storage for uploaded material images

src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts                 # Multipart image upload handler
│   │   ├── categories/route.ts             # Categories API
│   │   └── units/route.ts                  # Units of Measure API
│   ├── categories/page.tsx                 # Category management view
│   └── units/page.tsx                      # Unit of Measure management view
├── components/
│   ├── layout/
│   │   ├── navbar.tsx                      # Add ThemeToggle and Category/UOM links
│   │   └── theme-toggle.tsx                # Sun/Moon theme switcher button
│   ├── providers/
│   │   └── theme-provider.tsx              # next-themes wrapper
│   ├── materials/
│   │   └── material-selector-modal.tsx     # 20-item paginated picker modal
│   └── forms/
│       ├── material-form.tsx               # Updated with smart code generator & image upload
│       ├── category-form.tsx               # Category CRUD modal
│       ├── uom-form.tsx                    # UOM CRUD modal
│       ├── material-in-form.tsx            # Updated to use MaterialSelectorModal
│       └── material-out-form.tsx           # Updated to use MaterialSelectorModal + siteLocation
├── lib/
│   ├── item-code-generator.ts              # Smart SKU generator function
│   └── schemas/
│       ├── category.ts                     # Zod schema for Category
│       ├── uom.ts                          # Zod schema for UOM
│       ├── material.ts                     # Updated Zod schema
│       └── material-out.ts                 # Updated with siteLocation (removed issuedBy)
└── server/
    └── actions/
        ├── categories.ts                   # Category Server Actions
        ├── units.ts                        # UOM Server Actions
        ├── materials.ts                    # Updated with relational Category/Unit & images
        └── material-out.ts                 # Updated with siteLocation
```

## Complexity Tracking

*No constitution violations. All enhancements respect and build upon established principles.*
