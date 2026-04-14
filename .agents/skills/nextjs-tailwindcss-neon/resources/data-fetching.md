# Data Fetching & Caching

> **Examples**: See [Data Fetching Patterns](../examples/data-fetching-patterns.md) for `use cache`, `fetch` options, on-demand invalidation, PPR, streaming, and direct DB access examples.

## Primary Primitive: `use cache` (New in v16)

`use cache` is the **recommended** caching primitive in Next.js 16. Apply it at the top of a file, on an individual function, or on a Server Component. It replaces ad-hoc `fetch` cache options as the primary way to cache data.

- `cacheTag('name')` — assigns a cache tag; call `revalidateTag('name')` to invalidate everything with that tag.
- `cacheLife('profile')` — sets cache lifetime using a named profile.

### `cacheLife` Built-in Profiles

| Profile     | Revalidate | Expire   |
| ----------- | ---------- | -------- |
| `'seconds'` | 1s         | 60s      |
| `'minutes'` | 60s        | 3600s    |
| `'hours'`   | 3600s      | 86400s   |
| `'days'`    | 86400s     | 604800s  |
| `'weeks'`   | 604800s    | 2592000s |
| `'max'`     | 2592000s   | ∞        |

Custom profiles can be defined in `next.config.ts` under `experimental.cacheLife`.

## `fetch` Cache Options

The `fetch` API is extended with a `next` option. Prefer `use cache` for new code; `fetch` options are useful for one-off cases or external API calls without a wrapper function.

| Pattern   | Option                         | Behaviour                         |
| --------- | ------------------------------ | --------------------------------- |
| Static    | _(default)_                    | Cached indefinitely at build time |
| ISR       | `{ next: { revalidate: 60 } }` | Re-generated after N seconds      |
| Dynamic   | `{ cache: 'no-store' }`        | Always fetched fresh per request  |
| Tag-based | `{ next: { tags: ['name'] } }` | Invalidated via `revalidateTag()` |

## On-Demand Invalidation

Call these inside **Server Actions** after mutations:

- `revalidateTag('tag')` — purges all caches tagged with that name.
- `revalidatePath('/path')` — purges the cache for a specific URL. Use sparingly — prefer `revalidateTag` for precision.

See [Service + Action Pattern](../examples/service-action-pattern.md) for how this fits into the actions layer.

## Partial Pre-Rendering (PPR)

PPR enables a **static shell + dynamic holes** on a single page. Enable with `experimental.ppr: true` in `next.config.ts` ([Project Config Boilerplate](../examples/project-config.md)). Wrap dynamic content in `<Suspense>` — Next.js determines what can be pre-rendered at build time.

## Streaming with Suspense

Without PPR, wrap any slow-loading Server Component in `<Suspense>` to stream it in without blocking the rest of the page. This is always safe and costs nothing when the component is fast.

## Direct DB Access (Prisma / Drizzle)

Do not wrap DB calls in `fetch`. Call the DB client directly inside `services/` functions, and annotate with `use cache`:

```
lib/data/users.ts  ('use cache')
  └── db.user.findMany()    ← Prisma, called directly
```

See [Prisma + NeonDB Setup](../examples/prisma-neondb-setup.md) for the `db.ts` singleton and [Service + Action Pattern](../examples/service-action-pattern.md) for caching in the service layer.
