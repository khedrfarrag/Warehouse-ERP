# Contracting Warehouse ERP (Sinoma)

An enterprise-grade Full-Stack Warehouse Resource Planning application engineered for contracting, engineering, and construction projects.

Built with **Next.js 15 (App Router)**, **PostgreSQL** with **Prisma ORM**, **React Hook Form + Zod**, **Sonner Toast notifications**, and **Motion animations**.

---

## Architecture & Core Modules

* **Material Catalog (`/materials`)**: Centralized repository of all commodities, tools, and consumables. Real-time stock status, search, and safety threshold alerts.
* **Material In (`/material-in`)**: Multi-item inbound receipts workflow. Automatically increments available stock, captures delivery notes/POs, and logs immutable entries into the audit ledger.
* **Material Out (`/material-out`)**: Multi-item outbound issuance workflow. Strict transactional stock availability validation with row-level locks; prevents negative inventory under all concurrent conditions.
* **Inventory Audit Ledger (`/ledger`)**: Immutable event-sourced transaction ledger tracing all inward and outward material flows with running balance calculations.
* **Executive Dashboard (`/`)**: High-level KPIs, low-stock warnings, and recent transaction feeds.

---

## Ubiquitous Domain Terminology

In adherence to project governance standards:
- The legacy terms `Goods In` and `Goods Out` have been retired and replaced across all navigation, routes, code, schemas, and UI components with **Material In** and **Material Out**.

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database

### 2. Environment Setup
Configure your database connection in `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/sinoma_warehouse_erp?schema=public"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Database Setup & Migrations
```bash
# Generate Prisma Client
npx prisma generate

# Push or migrate database schema
npx prisma db push

# (Optional) Seed contracting sample materials
npx tsx prisma/seed.ts
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

