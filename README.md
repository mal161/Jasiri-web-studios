# Jasiri Platform — Jasiri Web Studios Operating System

Public website + portfolio + CRM + analytics + client portal + project management + finance/HR foundations + blog CMS + admin command center. Built as a real product, not a mockup.

## Stack

- **Web:** Next.js 14 (App Router) + React + Tailwind CSS (design tokens + dark mode) + Recharts + Zod + Lucide icons
- **API:** Node.js + Express (REST, `/api/v1/*`, consistent `{success,data}` envelopes)
- **Data/Auth/Storage:** Supabase (PostgreSQL + Auth + Storage + RLS)

## Monorepo

```text
apps/web      Next.js — public site, dashboards, portals
apps/api      Express — business logic, protected APIs, analytics
packages/validation  Shared Zod schemas (leads, projects, invoices, quotes, posts, analytics)
supabase/migrations  001 schema · 002 RLS · 003 notifications/files/messages
supabase/seed        roles, permissions, departments
```

## Setup

1. `cp .env.example .env` (root) and fill Supabase values. Also create `apps/web/.env.local` with the `NEXT_PUBLIC_*` vars.
2. Install: `npm install` (root installs workspaces; needs network).
3. Supabase: run migrations in order (`supabase/migrations`), then `supabase/seed/001_initial_data.sql`.
4. Create the admin user in Supabase Auth, then set `profiles.role = 'SUPER_ADMIN'`.
5. Run: `npm run dev:web` (port 3000) and `npm run dev:api` (port 4000).

## Routes

- Public: `/ /about /services /projects /projects/[slug] /blog /blog/[slug] /contact /careers /quote /login`
- Dashboard: `/dashboard /dashboard/leads /dashboard/leads/[id] /dashboard/quotes /dashboard/quotes/[id] /dashboard/projects /dashboard/projects/[id] /dashboard/tasks /dashboard/client /dashboard/analytics /dashboard/invoices /dashboard/invoices/[id] /dashboard/posts /dashboard/employees /dashboard/departments /dashboard/notifications /dashboard/audit-logs /dashboard/search /dashboard/settings`
- API: `/api/health`, `/api/v1/auth/*`, `/api/v1/leads`, `/projects`, `/tasks`, `/milestones`, `/clients`, `/analytics`, `/posts`, `/invoices`, `/quotes` (+`/quotes/:id/convert`), `/notifications`, `/employees`, `/departments`, `/files`, `/messages`, `/settings`, `/audit-logs`, `/search`

## Conventions

- Tailwind only for styling; colors come from CSS-variable tokens (`apps/web/app/globals.css`).
- Lucide icons only — no emojis in UI.
- Dark mode: `class` strategy + persisted `localStorage` + system preference.
- Validation with Zod on API boundary; RLS enforces authorization in the database.
- Every async UI states: loading / error / empty — no blank screens.
- Never commit `.env`. Service-role key stays server-side.
