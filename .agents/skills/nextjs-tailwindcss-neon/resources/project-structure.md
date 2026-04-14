# Project Structure: Next.js + Tailwind CSS + Prisma + NeonDB (Scalable)

A production-ready, `src/`-based folder structure for a large-scale Next.js 16 application using Tailwind CSS, Prisma ORM, and NeonDB (serverless Postgres).

## Full Project Tree

```
my-app/
│
├── src/
│   │
│   ├── proxy.ts                                    ← Auth guard / network layer (v16)
│   ├── app/                                    ← App Router root
│   │   ├── layout.tsx                          ← Root layout (html, body, providers)
│   │   ├── page.tsx                            ← Home page /
│   │   ├── globals.css                         ← Tailwind base styles
│   │   ├── loading.tsx                         ← Root loading UI
│   │   ├── error.tsx                           ← Root error boundary ('use client')
│   │   ├── not-found.tsx                       ← 404 page
│   │   │
│   │   ├── (auth)/                             ← Route group — unauthenticated pages
│   │   │   ├── layout.tsx                      ← Auth shell layout
│   │   │   ├── login/page.tsx                  ← /login
│   │   │   ├── register/page.tsx               ← /register
│   │   │   └── forgot-password/page.tsx        ← /forgot-password
│   │   │
│   │   ├── (app)/                              ← Route group — authenticated app
│   │   │   ├── layout.tsx                      ← App shell (sidebar, nav, providers)
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx                    ← /dashboard
│   │   │   │   └── loading.tsx
│   │   │   ├── users/
│   │   │   │   ├── page.tsx                    ← /users
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx                ← /users/:id
│   │   │   │       └── edit/page.tsx           ← /users/:id/edit
│   │   │   └── settings/
│   │   │       └── page.tsx                    ← /settings
│   │   │
│   │   └── api/                                ← API Route Handlers
│   │       ├── auth/
│   │       │   └── [...nextauth]/route.ts      ← Auth.js / NextAuth
│   │       └── webhooks/
│   │           └── stripe/route.ts             ← External webhooks
│   │
│   ├── components/                             ← Global shared components & feature modules
│   │   ├── features/                           ← Business domains (Feature-Sliced Design)
│   │   │   └── users/
│   │   │       ├── components/                 ← Feature-specific UI
│   │   │       │   ├── user-card.tsx
│   │   │       │   └── user-form.tsx
│   │   │       ├── __tests__/                  ← Colocated feature tests (Vitest)
│   │   │       │   ├── actions.test.ts
│   │   │       │   └── services.test.ts
│   │   │       ├── actions.ts                  ← Server Actions for users
│   │   │       ├── services.ts                 ← DB queries for users
│   │   │       ├── validations.ts              ← Zod schemas
│   │   │       └── types.ts                    ← Types/Interfaces
│   │   ├── ui/                                 ← Primitive design-system atoms
│   │   │   ├── button.tsx
│   │   │   └── input.tsx
│   │   └── layout/                             ← Structural/page-level components
│   │       ├── header.tsx
│   │       └── sidebar.tsx
│   │
│   ├── lib/                                    ← Core server-side utilities
│   │   ├── db.ts                               ← Prisma client singleton
│   │   ├── auth.ts                             ← Auth config
│   │   └── utils/
│   │       ├── format.ts                       ← Date, number, string formatters
│   │       └── cn.ts                           ← clsx + twMerge helper
│   │
│   ├── hooks/                                  ← Custom React hooks (client-only shared)
│   │   ├── use-debounce.ts
│   │   └── use-toast.ts
│   │
│   ├── stores/                                 ← Client-side global state (Zustand, etc.)
│   │   ├── ui.store.ts
│   │   └── user.store.ts
│   │
│   ├── providers/                              ← React context providers
│   │   ├── index.tsx                           ← Composes all providers into one
│   │   └── theme-provider.tsx
│   │   └── query-provider.tsx                  ← React Query client provider
│   │
│   ├── types/                                  ← Global shared types ONLY
│   │   └── index.ts                            ← Re-exports everything
│   │
│   └── config/                                 ← App-level constants
│       ├── site.ts                             ← Site name, URL, nav links
│       └── constants.ts                        ← Enums, magic strings/numbers
│
├── prisma/
│   ├── schema.prisma                           ← Prisma schema (single source of truth)
│   ├── seed.ts                                 ← DB seed script
│   └── migrations/                             ← Auto-generated by prisma migrate
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/                                  ← Self-hosted fonts (fallback)
│
├── tests/                                      ← Test suite (mirrors src/ structure)
│   ├── e2e/                                    ← End-to-End Tests (Playwright)
│       └── auth.spec.ts
│
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── tsconfig.json
├── .env
├── .env.local                                  ← Secrets — never commit
└── package.json
```

## Architecture Principles

| Layer               | Folder                 | Responsibility                                                                                |
| ------------------- | ---------------------- | --------------------------------------------------------------------------------------------- |
| Routing & App Shell | `app/`                 | Pages, layouts, routing structure. **Server Components only** (except leaves).                |
| Features (FSD)      | `components/features/` | Core business logic grouped by domain. Contains actions, services, and local UI.              |
| Global UI           | `components/`          | Shared dumb UI primitives (`components/ui/`) and global layout shells (`components/layout/`). |
| Utilities           | `lib/`                 | Low-level utilities, DB singleton, system config.                                             |

> **Data flow rule**: Page → Feature **Actions** → Feature **Services** → `lib/db`. Nothing skips a layer.

## Modularization Rules (Feature-Sliced Design)

- **Domain-Driven Grouping** — Files belong in `src/components/features/[entity]/` (like `users/`, `billing/`). Do NOT scatter files across top-level `actions/`, `services/`, etc folders.
- **Strict Boundaries** — A feature should only expose what other parts of the app need. `src/components/features/billing` cannot directly import `src/components/features/users/services.ts` unless it is an explicitly shared export.
- **Test Colocation in Folders** — Unit tests for feature services belong inside a `__tests__/` folder within that feature module.
- **One component per file** — no barrel files that mix unrelated components.
- **Pages are thin composition layers** — `app/**/page.tsx` only: fetches data via a feature service (or `use cache`), passes it to feature components, and defines `metadata`. No UI logic inline.
- **Isolate Client Components** — Keep `'use client'` strictly at the interactive leaf nodes inside feature component folders.

## Key Files — Examples

Rather than duplicating code here, refer to the dedicated example files:

| File(s)                                                                                                                                | Example                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `src/lib/db.ts`, `prisma/schema.prisma`, `.env.local`                                                                                  | [Prisma + NeonDB Setup](../examples/prisma-neondb-setup.md)       |
| `src/components/features/[entity]/services.ts`, `actions.ts`, `validations.ts`                                                         | [Service + Action Pattern](../examples/service-action-pattern.md) |
| `tailwind.config.ts`, `tsconfig.json`, `next.config.ts`, `src/lib/utils/cn.ts`, `src/config/site.ts`, `src/providers/`, `src/proxy.ts` | [Project Config Boilerplate](../examples/project-config.md)       |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/like-button.tsx`                                                             | [Basic Page](../examples/basic-page.md)                           |

## Setup Commands

```bash
# 1. Create project (src/ layout, TypeScript, Tailwind, ESLint, App Router)
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir

# 2. Install Prisma
npm install prisma @prisma/client
npx prisma init

# 3. Install helpers
npm install clsx tailwind-merge zod

# 4. Set DATABASE_URL + DIRECT_URL in .env.local, then push schema to NeonDB
npx prisma db push

# 5. Generate Prisma client
npx prisma generate

# 6. Seed (optional)
npx tsx prisma/seed.ts
```
