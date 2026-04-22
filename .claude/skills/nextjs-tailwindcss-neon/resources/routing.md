# Routing in Next.js 16

> **Examples**: See [Routing Patterns](../examples/routing-patterns.md) for all code shown in this doc — dynamic routes, nested layouts, parallel/intercepting routes, redirects, and `proxy.ts`.
> **Project Layout**: See [Project Structure](./project-structure.md) for the full folder tree with route groups.

## Dynamic Segments

Wrap a folder name in `[brackets]` to capture a URL segment as a parameter. In v16, `params` is a `Promise` — always `await` it.

| Folder convention | URL match        | `params` shape                      |
| ----------------- | ---------------- | ----------------------------------- |
| `[slug]`          | `/blog/my-post`  | `{ slug: 'my-post' }`               |
| `[...slug]`       | `/docs/a/b/c`    | `{ slug: ['a', 'b', 'c'] }`         |
| `[[...slug]]`     | `/` or `/docs/a` | `{ slug: [] }` or `{ slug: ['a'] }` |

Use `generateStaticParams()` in a dynamic page to pre-render all known paths at build time.

## Nested Layouts

Every segment can have its own `layout.tsx`. They are **nested** — child layouts render inside parent layouts. Layouts do **not** re-render when navigating between sibling routes.

Use **Route Groups** `(group-name)` to share a layout across a subset of routes without adding a URL segment.

## Parallel Routes

Use `@slot` folders to render multiple independent pages inside a single layout simultaneously. Each slot is received as a prop in the parent `layout.tsx`.

```
app/(app)/dashboard/
├── layout.tsx          ← receives children, analytics, team as props
├── page.tsx
├── @analytics/page.tsx
└── @team/page.tsx
```

Useful for dashboards with independent sections that load at different speeds — each slot can have its own `loading.tsx`.

## Intercepting Routes

Use convention prefixes to render a route in-context (e.g., modal) while updating the URL. On direct navigation, the full page renders.

| Convention        | Intercepts relative to |
| ----------------- | ---------------------- |
| `(.)segment`      | Same level             |
| `(..)segment`     | One level up           |
| `(..)(..)segment` | Two levels up          |
| `(...)segment`    | App root               |

Example: `app/feed/@modal/(.)photo/[id]/page.tsx` renders as a modal when navigating from `/feed`, but `/photo/[id]` direct visit shows the full page.

## Navigation

| Scenario                 | Tool                                                                   |
| ------------------------ | ---------------------------------------------------------------------- |
| Internal link            | `<Link href="...">` from `next/link` — prefetches automatically        |
| Server-side redirect     | `redirect('/path')` from `next/navigation`                             |
| Client-side programmatic | `useRouter().push('/path')` from `next/navigation`                     |
| Re-fetch server data     | `router.refresh()` — re-runs Server Components, preserves client state |

## `proxy.ts` — Replaces Middleware in v16

`proxy.ts` lives inside `src/` and handles network-level logic (auth guards, redirects, header injection) with a route-scoped API. **Do not create `middleware.ts` in new projects** — it is deprecated in v16.

See [Routing Patterns](../examples/routing-patterns.md) for a working `proxy.ts` auth guard example. See [Project Config Boilerplate](../examples/project-config.md) for the full boilerplate file.
