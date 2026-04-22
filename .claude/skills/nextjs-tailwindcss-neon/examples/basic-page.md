# Basic Page Example

A minimal but complete Next.js 16 page with a root layout, metadata, a server-fetched data source, and an interactive client component.

## File Structure

```
app/
├── layout.tsx
├── page.tsx
└── components/
    └── like-button.tsx   ← 'use client'
```

## Root Layout

```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0070f3',
};

export const metadata: Metadata = {
  title: {
    template: '%s | My App',
    default: 'My App',
  },
  description: 'A Next.js 16 application.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

## Page (Server Component)

```tsx
// app/page.tsx
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { LikeButton } from './components/like-button';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Welcome to the homepage.',
};

// Server-side data fetch — runs only on the server
async function getFeaturedPost() {
  const res = await fetch('https://api.example.com/posts/featured', {
    next: { revalidate: 3600 }, // Revalidate every hour
  });
  if (!res.ok) return null;
  return res.json() as Promise<{ title: string; excerpt: string; slug: string; image: string }>;
}

export default async function HomePage() {
  const post = await getFeaturedPost();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1>Welcome</h1>

      {post && (
        <article>
          <Image src={post.image} alt={post.title} width={800} height={400} priority />
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <Link href={`/blog/${post.slug}`}>Read more →</Link>

          {/* Interactive client component leaf */}
          <LikeButton postSlug={post.slug} />
        </article>
      )}
    </main>
  );
}
```

## Interactive Client Component

```tsx
// app/components/like-button.tsx
'use client';

import { useState } from 'react';

interface Props {
  postSlug: string;
}

export function LikeButton({ postSlug }: Props) {
  const [liked, setLiked] = useState(false);

  async function handleLike() {
    setLiked(true);
    await fetch(`/api/likes/${postSlug}`, { method: 'POST' });
  }

  return (
    <button onClick={handleLike} disabled={liked}>
      {liked ? '❤️ Liked!' : '🤍 Like'}
    </button>
  );
}
```

## API Route for Likes

```ts
// app/api/likes/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  await db.likes.increment({ slug });
  return NextResponse.json({ success: true });
}
```

## Key Patterns Demonstrated

| Pattern                             | Where                       |
| ----------------------------------- | --------------------------- |
| Root layout with font optimization  | `layout.tsx`                |
| Static + dynamic metadata           | `layout.tsx` + `page.tsx`   |
| Server Component with `fetch` + ISR | `page.tsx`                  |
| `next/image` for optimized images   | `page.tsx`                  |
| `next/link` for internal navigation | `page.tsx`                  |
| Client Component at the leaf        | `like-button.tsx`           |
| API Route Handler                   | `api/likes/[slug]/route.ts` |
