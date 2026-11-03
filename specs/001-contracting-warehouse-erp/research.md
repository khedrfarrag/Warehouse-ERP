# Research & Architectural Decisions: Contracting Warehouse ERP

**Feature**: [spec.md](spec.md) | **Branch**: `001-contracting-warehouse-erp` | **Date**: 2026-10-29

## Overview
This document records the architectural investigations, technology evaluations, and concrete engineering decisions for implementing the Contracting Warehouse ERP according to the project constitution.

---

## Technical Investigations & Decisions

### 1. Full-Stack Web Framework: Next.js (App Router)
* **Decision**: Adopt Next.js (App Router, React 19, TypeScript) with Server Components for catalog/ledger displays and Server Actions for transactional mutations.
* **Rationale**:
  * Unified TypeScript types across database queries, server business logic, and client UI forms.
  * Server Components eliminate client-side data fetching waterfalls and bundle bloat for data-dense tables (e.g., Material Catalog, Audit Ledger).
  * Server Actions offer seamless form submissions and automatic path revalidation (`revalidatePath`).
* **Alternatives Considered**:
  * *Separate Express/NestJS backend + React Vite SPA*: Rejected due to dual-repository/dual-server deployment complexity, CORS management, and duplicate type definitions.

### 2. Database & Persistence Layer: PostgreSQL with Prisma ORM
* **Decision**: PostgreSQL with Prisma ORM, utilizing interactive ACID transactions (`prisma.$transaction`) and PostgreSQL row-level locks for inventory operations.
* **Rationale**:
  * Strict relational integrity (foreign keys between Vouchers, Line Items, Materials, and Ledger Entries).
  * Robust migration management (`prisma migrate dev`).
  * Concurrency safety: atomic stock updates prevent race conditions and negative inventory drift during simultaneous dispatches.
* **Alternatives Considered**:
  * *Drizzle ORM*: Highly performant, but Prisma's type generation, relation query syntax, and transaction ergonomics provide faster and safer enterprise ERP development.
  * *MongoDB / Document DB*: Rejected because inventory ledger accounting requires ACID transactions and strict relational constraints.

### 3. Form Management & Schema Validation: React Hook Form + Zod
* **Decision**: `react-hook-form` integrated with `zod` via `@hookform/resolvers/zod`.
* **Rationale**:
  * High-performance uncontrolled inputs, minimizing re-renders when managing complex vouchers with dynamic multi-row line items (`useFieldArray`).
  * End-to-end schema validation: The same Zod schema validates user input in the browser and re-validates the payload inside Next.js Server Actions.
* **Alternatives Considered**:
  * *Formik*: Outdated architecture, high re-render overhead for dynamic tabular forms.
  * *Uncontrolled vanilla forms*: Lacks declarative error binding and automated array manipulation for line items.

### 4. User Feedback & Notifications: Sonner Toast Provider
* **Decision**: `sonner` for toast notifications combined with accessible Radix UI primitives and Tailwind CSS.
* **Rationale**:
  * Lightweight, accessible, supports promise-based notifications (`toast.promise(createMaterialInVoucher(...))`) displaying loading, success, and error states automatically.
  * Clean UI matching modern enterprise software aesthetics.
* **Alternatives Considered**:
  * *react-toastify*: Larger bundle size, dated default styles.

### 5. Micro-Interactions & Transitions: Motion (Framer Motion)
* **Decision**: `motion` (Framer Motion) for fluid tab transitions, modal dialogues, and dynamic line item insertions/deletions (`AnimatePresence`).
* **Rationale**:
  * Standardized declarative animation library for React with hardware-accelerated transitions and built-in accessibility (`prefers-reduced-motion`).
* **Alternatives Considered**:
  * *Pure CSS animations*: Difficult to coordinate exit animations when rows are removed from dynamic line item tables.

### 6. Scalability, Concurrency & Ledger Design (System Design Primer)
* **Decision**:
  * Implement an **Immutable Transaction Ledger Pattern** (Event Sourcing lite): On-hand balance in the `Material` table is an authoritative materialized view updated atomically with an `InventoryLedger` entry in the same transaction.
  * Enforce atomic conditional updates:
    ```sql
    UPDATE "Material"
    SET "currentStock" = "currentStock" - $qty
    WHERE "id" = $id AND "currentStock" >= $qty;
    ```
  * Indexing strategy: Composite index on `InventoryLedger(materialId, timestamp DESC)` and `Material(itemCode)`.
* **Rationale**:
  * Eliminates negative stock under concurrency without requiring heavyweight distributed locking.
  * Guarantees 100% auditability for every single stock intake and dispatch.
* **Alternatives Considered**:
  * *Recalculating stock on every read from all historical rows*: Unscalable as transaction volume grows into tens of thousands of entries.
  * *Redis locks*: Adds infrastructure complexity unnecessary for a centralized PostgreSQL instance.

---

## Terminology Enforcement Check
* Confirmed: All schemas, routes, components, and APIs use **Material In** and **Material Out** exclusively.
* Legacy terms "Goods In" and "Goods Out" are strictly prohibited across the codebase.

