# Next.js Basics

A ground-up introduction to Next.js 16 — what it is, how to bootstrap a project, and the core concepts every developer needs before diving into advanced topics.

> **Examples**: See [Basic Page](../examples/basic-page.md) and [Project Config Boilerplate](../examples/project-config.md) for working code.
> **Project Layout**: See [Project Structure](./project-structure.md) for the full `src/`-based scalable folder tree.

## What is Next.js?

Next.js is a **React framework** that adds server-side capabilities to React out of the box:

| Feature                | What it gives you                                     |
| ---------------------- | ----------------------------------------------------- |
| File-based routing     | Pages are files — no router config needed             |
| Server Components      | Render on the server, ship zero JS for static UI      |
| Built-in optimizations | Images, fonts, and scripts auto-optimized             |
| API Routes             | Backend endpoints in the same project                 |
| Multiple render modes  | SSG, ISR, SSR, and streaming Suspense — auto-detected |

## Creating a Project

```bash
npx create-next-app@latest my-app --typescript --tailwind --eslint --app --src-dir
cd my-app
npm run dev   # http://localhost:3000 — Turbopack by default
```

The v16 setup defaults: App Router ✅ · TypeScript ✅ · Tailwind CSS (opt-in) ✅ · ESLint ✅ · Turbopack ✅

## Environment Variables

| File               | Loaded when        | Use for                    |
| ------------------ | ------------------ | -------------------------- |
| `.env`             | Always             | Safe defaults              |
| `.env.local`       | Always (overrides) | Secrets — **never commit** |
| `.env.development` | `next dev` only    | Dev-specific config        |
| `.env.production`  | `next build` only  | Prod-specific config       |

- `NEXT_PUBLIC_` prefix → **exposed to the browser**.
- All other vars → **server-only** (safe for secrets, DB URLs, API keys).

## Built-in Components

| Component  | Import             | Why use it                                                                                                                     |
| ---------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `<Image>`  | `next/image`       | Auto-resizes, serves WebP/AVIF, lazy loads, prevents CLS. **Never use raw `<img>`** (see [SKILL.md](../SKILL.md) constraints). |
| `<Link>`   | `next/link`        | Client-side navigation with automatic prefetching. **Never use raw `<a>` for internal links**.                                 |
| `<Script>` | `next/script`      | Load third-party scripts without blocking render. Control timing with `strategy`.                                              |
| Font       | `next/font/google` | Self-hosted fonts, zero layout shift, CSS variable output for Tailwind.                                                        |

### `next/script` Strategies

| Strategy              | When it loads                       |
| --------------------- | ----------------------------------- |
| `'beforeInteractive'` | Before the page hydrates (blocking) |
| `'afterInteractive'`  | After hydration (default)           |
| `'lazyOnload'`        | During browser idle time            |
| `'worker'`            | In a Web Worker (experimental)      |

## Render Modes — How Next.js Decides

Next.js picks the render mode **automatically** based on how you fetch data:

| Mode             | Trigger                                                        | Use case                  |
| ---------------- | -------------------------------------------------------------- | ------------------------- |
| **Static (SSG)** | No dynamic data                                                | Marketing pages, docs     |
| **ISR**          | `fetch(..., { next: { revalidate: N } })`                      | Blog posts, product pages |
| **SSR**          | `fetch(..., { cache: 'no-store' })` or reading cookies/headers | Personalized pages        |
| **Streaming**    | `<Suspense>` wrapping a slow Server Component                  | Dashboards                |

For deeper coverage see [Data Fetching & Caching](./data-fetching.md).

## Key Config Files

| File                 | Purpose                                             | Full example                                                |
| -------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| `next.config.ts`     | Image domains, redirects, experimental flags        | [Project Config Boilerplate](../examples/project-config.md) |
| `tailwind.config.ts` | Content paths, theme extension                      | [Project Config Boilerplate](../examples/project-config.md) |
| `tsconfig.json`      | Path aliases (`@/*` → `./src/*`)                    | [Project Config Boilerplate](../examples/project-config.md) |
| `src/proxy.ts`       | Network-level auth guard (replaces `middleware.ts`) | [Routing Patterns](../examples/routing-patterns.md)         |
