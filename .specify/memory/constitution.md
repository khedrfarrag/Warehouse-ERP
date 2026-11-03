<!--
# Sync Impact Report
- Version change: Uninitialized Template -> 1.0.0
- Modified principles: Replaced initial placeholders with 5 core domain & architectural principles:
  - I. Full-Stack Next.js Architecture
  - II. PostgreSQL Relational Integrity & Transactional Invariance
  - III. Type-Safe Form Management & Reactive UI Feedback
  - IV. Ubiquitous Domain Terminology (Material In / Material Out)
  - V. Scalable System Architecture & Audit Trails
- Added sections:
  - Technology Stack & Architectural Constraints
  - Development Workflow & Quality Gates
  - Governance
- Removed sections: Placeholder examples
- Follow-up TODOs: None
-->

# Contracting Warehouse ERP Constitution

## Core Principles

### I. Full-Stack Next.js Architecture
The application MUST be built using Next.js (App Router) with React and TypeScript. Client-side rendering and Server Components MUST be distinctly segregated: data fetching and business mutations MUST be handled through Server Actions or secure API route handlers, while interactive widgets leverage React Client Components. Modular file structure and clean separation of presentation, business logic, and data access MUST be maintained across all modules.

### II. PostgreSQL Relational Integrity & Transactional Invariance
All persistent data MUST be stored in PostgreSQL. Inventory operations, stock balance updates, and warehouse transaction records MUST execute within strict ACID database transactions with row-level locking or optimistic concurrency controls to prevent race conditions and negative inventory drift. Schema migrations MUST be version-controlled, reproducible, and executed via an ORM or migration runner with strict foreign key constraints and indexed lookup paths.

### III. Type-Safe Form Management & Reactive UI Feedback
All data intake forms across the warehouse workflow MUST use React Hook Form paired with Zod schemas for end-to-end validation. Form validation MUST occur synchronously on the client and MUST be re-verified on the server. Every user mutation (creation, modification, stock transfer, deletion) MUST provide immediate, clear feedback via Toast notifications for successes, warnings, and errors. State transitions and page changes MUST utilize Motion (Framer Motion) to maintain visual continuity and professional UX standards.

### IV. Ubiquitous Domain Terminology (Material In / Material Out)
The system MUST strictly enforce standardized domain language across code, database schemas, APIs, and the UI. The legacy navigation and conceptual labels "Goods In" and "Goods Out" MUST NOT be used anywhere in the codebase; they MUST be named "Material In" (representing receipts, inbound shipments, and material intake) and "Material Out" (representing material issues, dispatches, and stock requisitions). All route paths, component names, schema models, and navigation items MUST adhere to this ubiquitous terminology.

### V. Scalable System Architecture & Audit Trails (System Design Primer)
Adhering to foundational principles established in the System Design Primer, the architecture MUST prioritize high availability, modularity, and comprehensive auditability. Every inventory movement (Material In, Material Out, adjustments) MUST generate an immutable ledger entry recording the material identifier, quantity change, timestamp, operator identity, and reference document. Read-heavy endpoints (e.g., warehouse item catalogs, dashboard summaries) SHOULD incorporate caching strategies and database indexing without compromising ledger accuracy.

## Technology Stack & Architectural Constraints

- **Application Framework**: Next.js (latest stable App Router), TypeScript (strict mode enabled), React.
- **Database Engine**: PostgreSQL with connection pooling, structured schema migrations, and relational integrity.
- **Form Architecture**: React Hook Form with Zod schema resolution for type safety and validation.
- **UI & Feedback**: Tailwind CSS (or modular design system), Toast notification provider (Sonner / standard toast) for operation alerts.
- **Motion & Animation**: Motion (Framer Motion) for route transitions, dialog modals, and micro-interactions.
- **System Design Standards**: Strict separation of concerns (Presentation Layer, Domain/Service Layer, Persistence Layer), idempotency on warehouse transaction endpoints, and zero tolerance for untracked inventory balance mutations.

## Development Workflow & Quality Gates

- **Terminology Linter**: PRs and commits MUST be validated against the domain glossary; any occurrence of "Goods In" or "Goods Out" in user-facing UI, route names, or schema attributes MUST fail CI checks.
- **Schema & Migration Gate**: Any modification to database schemas MUST include a validated PostgreSQL migration script and corresponding TypeScript types.
- **Transaction Safety**: All stock-altering functions MUST have automated integration tests verifying transactional rollback on unexpected errors.
- **Code Review & Quality**: Zero TypeScript `any` types allowed in domain models and API contracts.

## Governance

This Constitution represents the governing architectural and domain contract for Contracting Warehouse ERP. It supersedes informal agreements, transient pull requests, and legacy HTML demo patterns. Amendments to this Constitution MUST follow formal versioning:
- **MAJOR** version bumps require structural architectural shifts, removal of core principles, or breaking database paradigm alterations.
- **MINOR** version bumps indicate additions of new architectural standards, modules, or principle expansions.
- **PATCH** version bumps denote wording refinements, typo corrections, or clarifications.

All specification planning (`/speckit-plan`), task generations (`/speckit-tasks`), and implementations (`/speckit-implement`) MUST verify compliance against these principles before merging.

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
