# Example: Server & Client Component Patterns

Concrete code examples for the RSC model — server components, client components, composition, context, Server Actions, and the React Compiler.

## Server Component (default)

```tsx
// src/app/products/page.tsx — no directive needed
async function getProducts() {
  const res = await fetch('https://api.example.com/products', {
    next: { revalidate: 3600 }, // ISR: revalidate every hour
  });
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts(); // runs on server only

  return (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  );
}
```

## Client Component

```tsx
// src/components/ui/counter.tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>Count: {count}</button>;
}
```

## Composition Pattern — Push `'use client'` to the Leaf

```tsx
// src/app/page.tsx — Server Component
import { Counter } from '@/components/ui/counter'; // Client Component

export default async function HomePage() {
  const data = await fetchData(); // runs on server

  return (
    <main>
      <h1>{data.title}</h1>
      <Counter /> {/* only this leaf ships JS to the client */}
    </main>
  );
}
```

## Passing Server Data to Client Components

Props must be **serializable** (plain objects, primitives — no functions, class instances):

```tsx
// src/app/page.tsx (Server)
import { ProductCard } from '@/components/product-card'; // 'use client'

export default async function Page() {
  const product = await db.products.findFirst(); // plain object from Prisma ✅

  return <ProductCard product={product} />;
}
```

## Wrapping Client Providers in a Server Layout

```tsx
// src/app/layout.tsx (Server Component)
import { Providers } from '@/providers'; // 'use client' — composes ThemeProvider etc.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## React Compiler — Do NOT manually memoize

```tsx
// ✅ Correct — compiler handles this automatically
function SortedList({ items }: { items: string[] }) {
  const sorted = items.toSorted();
  return (
    <ul>
      {sorted.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

// ❌ Avoid — redundant manual memoization
function SortedList({ items }: { items: string[] }) {
  const sorted = useMemo(() => items.toSorted(), [items]);
  return (
    <ul>
      {sorted.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
```

## Server Actions (`'use server'`)

```tsx
// src/components/features/contact/actions.ts
'use server';

import { db } from '@/lib/db';

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  await db.contact.create({ data: { name, email } });
}
```

```tsx
// src/components/contact-form.tsx
'use client';

import { submitContactForm } from '@/actions/contact.actions';

export function ContactForm() {
  return (
    <form action={submitContactForm}>
      <input name="name" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <button type="submit">Send</button>
    </form>
  );
}
```
