# App Router & File Conventions

Next.js 16 uses the **App Router** (`app/` directory) as the recommended architecture. Every file inside `app/` participates in the routing system through special naming conventions.

> **Examples**: See [App Router File Templates](../examples/app-router-templates.md) for copy-paste code for every file type below.
> **Project Layout**: See [Project Structure](./project-structure.md) for the full folder tree showing how `app/` fits into the `src/` layout.

## Special Files — What Each Does

| File               | Purpose                                                                                 |
| ------------------ | --------------------------------------------------------------------------------------- |
| `layout.tsx`       | Persistent wrapper — does **not** re-render on navigation. Wraps all child segments.    |
| `template.tsx`     | Like layout but creates a **new instance** on every navigation (useful for animations). |
| `page.tsx`         | The leaf UI for a route. Makes the route publicly accessible.                           |
| `loading.tsx`      | Auto-wraps the page in `<Suspense>` — shows while the page streams in.                  |
| `error.tsx`        | Must be `'use client'`. Error boundary for the segment and its children.                |
| `not-found.tsx`    | Rendered when `notFound()` is called or a URL has no matching route.                    |
| `global-error.tsx` | Catches errors that occur inside the root `layout.tsx` itself.                          |
| `route.ts`         | API Route Handler — export named HTTP method functions (`GET`, `POST`, etc.).           |

## Key Rules

- **`params` and `searchParams` are `Promise` in v16** — always `await` them in `page.tsx` and `generateMetadata`. See [Routing](./routing.md) for all dynamic segment patterns.
- The **root layout is required** and must render `<html>` and `<body>`.
- **Route groups** `(name)` — group routes without adding a URL segment. Useful for sharing a layout across a subset of pages.
- **Layouts do not re-render** on sibling navigation — only the `page.tsx` portion updates.
- **`template.tsx` vs `layout.tsx`** — use template when you need fresh state or animations on route change; prefer layout otherwise.
- **API Route Handlers** export named functions matching HTTP methods. The `params` argument is also a `Promise` — always `await`.
- **`middleware.ts` is deprecated in v16** — use `src/proxy.ts` instead. See [Routing](./routing.md#proxytts--replaces-middleware-in-v16) for usage.
