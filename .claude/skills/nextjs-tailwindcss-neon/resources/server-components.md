# Server & Client Components

The golden rule: **SSR by default, CSR only at the leaf**.

> **Examples**: [RSC Patterns](../examples/rsc-patterns.md)
> **Rules**: [SKILL.md constraints](../SKILL.md) — authoritative for SSR/CSR and modularization.

## The Mental Model

|               | Server Component (default)                           | Client Component (`'use client'`)   |
| ------------- | ---------------------------------------------------- | ----------------------------------- |
| **Can do**    | `async/await`, direct DB/FS, secrets, zero JS bundle | hooks, browser APIs, event handlers |
| **Cannot do** | hooks, browser APIs, event handlers                  | direct DB, secrets                  |
| **Bundle**    | None — never sent to browser                         | Shipped — keep minimal              |
| **Default?**  | ✅ Always                                            | ❌ Only when needed                 |

**Hard rules**:

- `page.tsx` is **always** a Server Component — never `'use client'` on a page.
- Data fetching happens **only** server-side. Client Components receive data as props.
- `'use client'` marks a **subtree boundary** — everything below it becomes client-side. Place it as low as possible.

## Composition Pattern

```
app/(app)/products/page.tsx      ← Server: fetches data
  └── <ProductList items={...}>  ← Server: renders list
      └── <ProductCard {...}>    ← Server: renders card shell
          └── <AddToCartBtn />   ← Client ('use client'): onClick, useState
```

❌ Never:

```tsx
'use client'
export default function ProductsPage() { ... } // entire page is now client-side
```

## Serializable Props Only

Passing server data to client components — must be serializable:

- ✅ Plain objects, strings, numbers, booleans, arrays
- ❌ Functions, class instances, Promises

## Context

React Context is **Client-only**:

1. Prefer props from Server Component (no overhead).
2. For client-side shared state, wrap only the client subtree in a Provider.

See [Project Config Boilerplate](../examples/project-config.md) for a composed `<Providers>` pattern.

## Modularization

See [Project Structure](../resources/project-structure.md) for the full file placement rules. Summary:

| What                       | Where                                                     |
| -------------------------- | --------------------------------------------------------- |
| Page: data fetch + compose | `app/(group)/feature/page.tsx` — Server                   |
| Reusable UI                | `components/[feature]/widget.tsx` — Server by default     |
| Interactive leaf           | `components/[feature]/widget-action.tsx` — `'use client'` |
| Business logic / DB        | `services/entity.service.ts` — no React                   |
| Mutation                   | `actions/entity.actions.ts` — `'use server'`              |

## React Compiler

Enabled by default. **Do not add `useMemo`, `useCallback`, `React.memo`** — redundant. See [SKILL.md](../SKILL.md).

## Server Actions

Thin wrapper pattern: **validate → call service → revalidate → return**. See [Service + Action Pattern](../examples/service-action-pattern.md).
