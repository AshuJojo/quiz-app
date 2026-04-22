---
name: nextjs-tailwindcss-neon
description: A comprehensive skill for building modern web applications with Next.js 16, TailwindCSS, Prisma, NeonDB, covering the App Router, React Server Components, caching, routing, and data-fetching patterns.
---

# Next.js 16 Skill

Structured guidance for building, debugging, and optimizing Next.js 16 + Tailwind CSS + Prisma + NeonDB applications.

**Triggers**: Bootstrapping a project · App Router features · RSC/CSR boundaries · data fetching/caching · routing · metadata/SEO · Prisma/NeonDB · state management · performance.

## Skill Structure

- **Resources** — concept & rules (no code). Each links to its paired example.
  - [Basics](./resources/basics.md): create-next-app, env vars, built-in components, render modes.
  - [Project Structure](./resources/project-structure.md): **Canonical `src/` folder layout.** Reference for all file placement questions.
  - [App Router & File Conventions](./resources/app-router.md): Special files, route groups, key rules.
  - [Server & Client Components](./resources/server-components.md): RSC model, SSR/CSR boundary, composition, Server Actions.
  - [Routing](./resources/routing.md): Dynamic segments, nested layouts, parallel/intercepting routes, `proxy.ts`.
  - [Data Fetching & Caching](./resources/data-fetching.md): `use cache`, `cacheLife`, `fetch` options, PPR, streaming.
  - [Metadata & SEO](./resources/metadata.md): Metadata API, `generateMetadata`, SEO files, `next/font`.
  - [State Management](./resources/state-management.md): When/how to add global state, Zustand/Jotai/React Query rules.
- **Examples** — copy-paste code. Load only what's needed.
  - [Basic Page](./examples/basic-page.md): Layout + page + client component + API route.
  - [App Router File Templates](./examples/app-router-templates.md): `layout`, `page`, `loading`, `error`, `not-found`, API routes.
  - [RSC Patterns](./examples/rsc-patterns.md): Server/client components, composition, providers, Server Actions.
  - [Routing Patterns](./examples/routing-patterns.md): Dynamic routes, layouts, parallel/intercepting routes, `proxy.ts`.
  - [Data Fetching Patterns](./examples/data-fetching-patterns.md): `use cache`, fetch options, invalidation, PPR, streaming.
  - [Metadata & SEO Examples](./examples/metadata-seo.md): Static/dynamic metadata, robots.ts, sitemap.ts, JSON-LD, `next/font`.
  - [Prisma + NeonDB Setup](./examples/prisma-neondb-setup.md): `lib/db.ts`, `schema.prisma`, `.env.local`.
  - [Service + Action Pattern](./examples/service-action-pattern.md): Zod schema, service layer, Server Action, form.
  - [Project Config Boilerplate](./examples/project-config.md): `tailwind.config.ts`, `tsconfig.json`, `next.config.ts`, `cn.ts`, `proxy.ts`.
  - [Zustand Store](./examples/zustand-store.md): UI store, sidebar/modal state, usage in client component.

## Strategy

1. **New project** → [Basics](./resources/basics.md) → [Project Structure](./resources/project-structure.md) → [Project Config Boilerplate](./examples/project-config.md).
2. **Identify task** → load the relevant resource. Need code → load the matching example.
3. **Load lazily** — load only the file(s) needed. Never load all resources upfront.
4. **SSR first** — pages and components are Server Components by default. CSR only at the smallest interactive leaf. Never `'use client'` on a `page.tsx`.
5. **Scale state gradually** — props → lift state → Context → Zustand/Jotai. See [State Management](./resources/state-management.md).
6. **Cache explicitly** — prefer `use cache` + `cacheTag`/`cacheLife` over `revalidatePath`.
7. **Type-safe** — TypeScript always. Use `next/types` helpers.
8. **Use built-ins** — `next/image`, `next/font`, `next/link`, `next/script` before third-party.
9. **Modularize** — one file, one concern. See [Project Structure](./resources/project-structure.md).

## Key Constraints & Rules

> **Authoritative.** Resource files must not restate these — they reference here.

- **Node.js ≥ 20.9** · **TypeScript ≥ 5.1**
- **SSR by default, CSR at the leaf** — `page.tsx` is always a Server Component. `'use client'` only on the smallest interactive leaf.
- **No data fetching in Client Components** — all `fetch`/DB/service calls happen server-side. Client Components receive data as props.
- **Modularize** — one component per file, one concern per module. Pages are thin — fetch + compose + metadata only.
- **`proxy.ts` replaces `middleware.ts`** — never generate `middleware.ts`. See [Routing](./resources/routing.md).
- **React Compiler** — never add `useMemo`, `useCallback`, `React.memo`. Compiler handles memoization.
- **Turbopack** — default bundler. Avoid webpack customization.
- **Tailwind CSS by default for UI** — hand-craft all components with Tailwind. Use `cn()` from `src/lib/utils/cn.ts` for conditional class merging. Only use shadcn/ui or another component library if the user **explicitly requests it**.
- **No raw `<img>`** — use `next/image`. **No raw `<a>` for internal links** — use `next/link`.
- **`params`/`searchParams` are `Promise` in v16** — always `await`.
- **`viewport` is a separate export** from `metadata` in v16.
