# Example: Data Fetching & Caching

Code examples for `use cache`, `fetch` cache options, on-demand invalidation, PPR, streaming, and direct DB access.

## `use cache` on a Function

```ts
// src/lib/data/products.ts
'use cache';

import { cacheTag, cacheLife } from 'next/cache';

export async function getProduct(id: string) {
  cacheTag(`product-${id}`); // for targeted invalidation
  cacheLife('hours'); // revalidate ~every hour

  const res = await fetch(`https://api.example.com/products/${id}`);
  return res.json();
}

export async function getProductList() {
  cacheTag('products');
  cacheLife('minutes');

  const res = await fetch('https://api.example.com/products');
  return res.json();
}
```

## `use cache` on a Component

```tsx
// src/components/price-chart.tsx
'use cache';

import { cacheLife } from 'next/cache';

export async function PriceChart({ productId }: { productId: string }) {
  cacheLife('minutes');

  const prices = await fetchPriceHistory(productId);
  return <Chart data={prices} />;
}
```

## `fetch` Cache Options

```ts
// Static — cached indefinitely (equivalent to old getStaticProps)
const data = await fetch('https://api.example.com/config');

// ISR — revalidate every 60 seconds
const posts = await fetch('https://api.example.com/posts', {
  next: { revalidate: 60 },
});

// Dynamic — no caching (equivalent to old getServerSideProps)
const user = await fetch('https://api.example.com/me', {
  cache: 'no-store',
});

// Tag-based — revalidate on demand via revalidateTag()
const products = await fetch('https://api.example.com/products', {
  next: { tags: ['products'] },
});
```

## On-Demand Cache Invalidation

```ts
// src/components/features/products/actions.ts
'use server';

import { revalidateTag, revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function updateProductAction(id: string, data: Partial<Product>) {
  await db.product.update({ where: { id }, data });
  revalidateTag(`product-${id}`); // invalidate cached getProduct(id)
  revalidateTag('products'); // invalidate cached product lists
}

export async function publishPostAction(slug: string) {
  await db.post.update({ where: { slug }, data: { published: true } });
  revalidatePath(`/blog/${slug}`); // invalidate the specific page URL
}
```

## Partial Pre-Rendering (PPR) — Static Shell + Dynamic Holes

Enable in `next.config.ts`:

```ts
const config: NextConfig = {
  experimental: { ppr: true },
};
```

Then in the page:

```tsx
// src/app/product/[id]/page.tsx
import { Suspense } from 'react';
import { ProductDetails } from './product-details'; // cached static
import { RecommendedProducts } from './recommended'; // dynamic per request

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <ProductDetails params={params} />

      <Suspense fallback={<p>Loading recommendations…</p>}>
        <RecommendedProducts params={params} />
      </Suspense>
    </main>
  );
}
```

## Streaming with Suspense (without PPR)

```tsx
// src/app/dashboard/page.tsx
import { Suspense } from 'react';

async function RecentActivity() {
  const data = await fetch('/api/activity', { cache: 'no-store' }).then((r) => r.json());
  return (
    <ul>
      {data.map((item: any) => (
        <li key={item.id}>{item.text}</li>
      ))}
    </ul>
  );
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<p>Loading activity…</p>}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
```

## Direct DB Access with `use cache` (Prisma)

```ts
// src/lib/data/users.ts
'use cache';

import { cacheTag, cacheLife } from 'next/cache';
import { db } from '@/lib/db';

export async function getCachedUsers() {
  cacheTag('users');
  cacheLife('minutes');
  return db.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getCachedUserById(id: string) {
  cacheTag(`user-${id}`);
  cacheLife('hours');
  return db.user.findUnique({ where: { id } });
}
```
