# Changelog

All notable changes to **PerGon OS** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) once releases are tagged.

## [Unreleased]

### Added

#### Monorepo foundation (Fase 0)

- Turborepo + pnpm workspace (`apps/*`, `packages/*`)
- Apps: `@pergon/web` (port 3000), `@pergon/admin` (port 3001)
- Packages: `@pergon/config`, `@pergon/ui`, `@pergon/shared`, `@pergon/database`, `@pergon/three`
- Tooling: ESLint, Prettier, Husky, lint-staged, TypeScript strict
- Cursor Foundation Rules (`.cursor/rules` 01–12 + project index)
- Docs: Design Bible outline, UI/UX Principles, Master Architecture set, getting started

#### Identity core (Fase 1) — `@pergon/identity`

- Domain: passport states/transitions, QR models, events, errors
- Use cases: create, transition, rotate QR, verify, recharge, history
- Memory Unit of Work + typed ports
- Migration: `supabase/migrations/20260304210000_identity_core.sql`
- APIs (no UI): Web `POST /api/v1/verify`; Admin passport issue/transition/rotate/recharge/history

#### Auth & authorization (Fase 2) — `@pergon/auth`

- Login, logout, refresh, session management
- Roles + permission catalog (authorization by **permission**, not role checks)
- Policies, guards, middleware helpers, audit trail
- Multi-tenant `organization_id`, users, invitations, password recovery
- MFA prepared (challenge + verify stub)
- Migration: `20260304220000_auth_core.sql`
- APIs on Admin (full) and Web (public auth surface)

#### Admin operations logic (Fase 3) — `@pergon/ops`

- Shared engines: Filters, Dashboard widgets, Audit, Notifications (email/WhatsApp/push/in_app outbox)
- Modules (domain/use cases/repos/validation/events/permissions, no UI):
  Dashboard, Products, Customers, Distributors, Production, Inventory, Automations, AI, Reports, Settings, Audit, Notifications
- Bridges for QR / Passport / Users / Roles → identity & auth
- Migration: `20260304230000_ops_core.sql`
- Admin APIs under `/api/v1/*` gated by permissions

#### Design system (Fase 4) — `@pergon/ui`

- Design tokens: color (light/dark + semantic), typography, spacing, radius, shadows, z-index, motion, breakpoints, layout, charts
- Base components (accessible, typed, RSC-aware where possible): Button, Input, Textarea, Select, Checkbox, Switch, Radio, Card, Dialog, Drawer, Popover, Tooltip, Dropdown, Tabs, Accordion, Avatar, Badge, Alert, Toast, Table, DataTable, Pagination, Breadcrumb, Navbar, Sidebar, Command, Search, Calendar, DatePicker, Loading, Skeleton, EmptyState, ErrorState, Charts, StatCard, MetricCard, Section, Container, QrViewer, PassportBadge, StatusBadge
- Catalog: `packages/ui/docs/COMPONENTS.md`

#### Supabase integration

- `@pergon/database`: browser, server (cookies), service_role, middleware session refresh, storage helpers, realtime helpers, edge invoke
- App wiring: `apps/web|admin/src/lib/supabase.ts` + env helpers
- Env templates with project URL `https://hrsxzqdfvwwsiiegbzvg.supabase.co` (keys local-only)
- Migrations: `20260304240000_rls_foundation.sql` (RLS fail-closed), `20260304250000_storage_realtime.sql`
- Edge function stub: `supabase/functions/health`
- Docs: `docs/SUPABASE.md`

### Notes

- Domain packages still default to **in-memory** Unit of Work; Supabase HTTP clients are ready for persistence adapters.
- No production UI pages/modules/dashboards yet — architecture, APIs, and design system only.
- Secrets (`.env.local`) are gitignored; never commit anon/service keys.

## [0.0.0] — 2026-08-04

### Added

- Initial repository foundation commit (`feat: initialize PerGon OS foundation`).
