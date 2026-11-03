# Implementation Plan: Contracting Warehouse ERP

**Branch**: `001-contracting-warehouse-erp` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-contracting-warehouse-erp/spec.md`

## Summary

The Contracting Warehouse ERP provides a full-stack warehouse management platform for tracking construction and contracting materials. The technical approach leverages **Next.js (App Router)** for unified server/client presentation, **PostgreSQL** with **Prisma ORM** for ACID transactional inventory math and immutable ledger auditing, **React Hook Form + Zod** for robust client/server form validation, **Sonner** for real-time toast feedback, **Motion** for interface animations, and strict enforcement of the ubiquitous domain terminology (**Material In** and **Material Out**).

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20+

**Primary Dependencies**: Next.js 15+ (App Router, React 19), Prisma ORM 6+, React Hook Form 7+, Zod 3+, Sonner (Toaster), Motion (Framer Motion 12+), Tailwind CSS 4+, Radix UI primitives.

**Storage**: PostgreSQL (with ACID transactions, row-level concurrency locks, and schema migrations via Prisma).

**Testing**: Vitest / Jest for unit tests (inventory calculation invariants) & Playwright for E2E user flows.

**Target Platform**: Web application (Responsive desktop and warehouse tablet browsers).

**Project Type**: Full-stack Next.js web application.

**Performance Goals**: Sub-second catalog queries (<500ms p95), voucher submissions processed in <1s, 60fps UI animations.

**Constraints**: Zero negative stock balance tolerance, immutable audit logs (no updates or deletes to ledger entries), strict avoidance of deprecated "Goods In" / "Goods Out" terminology.

**Scale/Scope**: Up to 50,000 material items, thousands of daily transaction vouchers, multi-item receipt and issuance lines.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Full-Stack Next.js Architecture)**: Verified. App Router with Server Components for data displays and Server Actions for mutations.
- [x] **Principle II (PostgreSQL Relational Integrity & Transactions)**: Verified. Prisma `$transaction` handles all voucher creations with atomic stock decrements/increments and ledger recording.
- [x] **Principle III (Type-Safe Forms & Reactive Feedback)**: Verified. `react-hook-form` + `zod` handles all forms; `sonner` provides toast notifications; `motion` drives transitions.
- [x] **Principle IV (Ubiquitous Domain Terminology)**: Verified. "Material In" and "Material Out" applied across all routes, components, navigation, and documentation.
- [x] **Principle V (Scalable Architecture & Audit Trails)**: Verified. Immutable `InventoryLedger` table maintains complete history; indexes placed on `itemCode`, `timestamp`, and `materialId`.

## Project Structure

### Documentation (this feature)

```text
specs/001-contracting-warehouse-erp/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   ├── materials-api.md
│   ├── material-in-api.md
│   ├── material-out-api.md
│   └── ledger-api.md
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
prisma/
├── schema.prisma              # PostgreSQL models & relations
└── seed.ts                    # Initial contracting materials seed

src/
├── app/                       # Next.js App Router
│   ├── layout.tsx             # Root layout with Navbar and Toaster
│   ├── page.tsx               # ERP Dashboard summary & metrics
│   ├── materials/
│   │   ├── page.tsx           # Materials catalog table view
│   │   └── loading.tsx        # Skeleton loading state
│   ├── material-in/
│   │   ├── page.tsx           # Material In vouchers history
│   │   └── new/page.tsx       # Material In voucher intake form
│   ├── material-out/
│   │   ├── page.tsx           # Material Out vouchers history
│   │   └── new/page.tsx       # Material Out voucher issuance form
│   ├── ledger/
│   │   └── page.tsx           # Inventory transaction audit ledger
│   └── api/                   # REST API routes
│       ├── materials/route.ts
│       ├── material-in/route.ts
│       ├── material-out/route.ts
│       └── ledger/route.ts
├── components/
│   ├── layout/
│   │   └── navbar.tsx         # Navigation bar (Material In & Material Out)
│   ├── ui/                    # UI building blocks (Button, Input, Table, Badge, Card, Dialog)
│   ├── forms/
│   │   ├── material-form.tsx  # React Hook Form for Material registration
│   │   ├── material-in-form.tsx # Multi-item intake form
│   │   └── material-out-form.tsx # Multi-item issuance form
│   └── motion/
│       └── page-transition.tsx# Motion animated wrapper
├── lib/
│   ├── db.ts                  # Prisma client singleton
│   ├── schemas/               # Shared Zod validation schemas
│   │   ├── material.ts
│   │   ├── material-in.ts
│   │   └── material-out.ts
│   └── utils.ts               # Helper utilities (formatting, cn)
└── server/
    └── actions/               # Next.js Server Actions with ACID transactions
        ├── materials.ts
        ├── material-in.ts
        ├── material-out.ts
        └── ledger.ts
```

**Structure Decision**: A clean full-stack Next.js layout combining Server Actions, Server Components, and Prisma. It maintains strict boundary separation between data definitions (`prisma/`), business actions (`src/server/actions/`), shared schemas (`src/lib/schemas/`), and UI presentation (`src/components/`, `src/app/`).

## Complexity Tracking

*No constitution violations. All choices comply strictly with the project constitution.*
