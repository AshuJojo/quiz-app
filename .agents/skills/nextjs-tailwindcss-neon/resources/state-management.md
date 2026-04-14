# State Management

> **When to use**: Only when props and Server Components are no longer sufficient. Scale up gradually.

## Decision Flow

```
Data is server-fetched?        → Server Component + props (preferred)
                                 → React Context (if needed by many client leaves)
State is UI-only?              → useState (local) or Zustand (app-wide)
State is session/user data?    → Zustand or Jotai
State is async/server-synced?  → TanStack Query + Server Actions
```

## When NOT to Use Global State

- **Don't globalize props** — if two components share a parent, lift state up.
- **Don't put server data in stores** — use `use cache` or React Query instead. Stores = stale data risk.
- **Don't access stores in Server Components** — stores are Client-only (`'use client'` boundary).

## Library Guide

| Scenario                              | Library                                                |
| ------------------------------------- | ------------------------------------------------------ |
| App-wide UI (modals, sidebar, toasts) | **Zustand** — no Provider, granular subscriptions      |
| Fine-grained atom state               | **Jotai** — per-atom subscriptions, minimal re-renders |
| Async server-synced data              | **TanStack Query** — loading/error/stale handling      |
| Simple shared state (small app)       | **React Context** — no deps, fine for theme/locale     |

> **Scale trigger**: Introduce global state when prop-drilling exceeds 2 levels, or the same client state is needed in 3+ unrelated components.

## Rules

1. **Client-only** — import stores only inside `'use client'` components.
2. **`src/stores/`** — one file per domain (`ui.store.ts`, `user.store.ts`). See [Project Structure](./project-structure.md).
3. **No server data** — stores hold ephemeral UI state only (`isModalOpen`, `sidebarCollapsed`, `theme`).
4. **One store per domain** — no god-store.
5. **Hydration safety** — use `createStore` (not `create`) inside a Provider when SSR is involved. Init with server-passed props, not in-store fetches.
6. **Zustand > Context for dynamic state** — Context re-renders all consumers; Zustand subscriptions are selective.
7. **React Query for async** — never `useEffect` + `useState` to fetch and stash in Zustand. Use `useQuery`/`useMutation`.

> See [Zustand Store Example](../examples/zustand-store.md) for a working `ui.store.ts` with sidebar and modal state.
