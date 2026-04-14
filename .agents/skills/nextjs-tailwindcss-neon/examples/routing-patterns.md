# Example: Routing Patterns

Code examples for dynamic segments, nested layouts, parallel routes, intercepting routes, redirects, and `proxy.ts`.

## Dynamic Segment — `[slug]`

```tsx
// src/app/blog/[slug]/page.tsx
interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  return <article>{post.content}</article>;
}
```

## Catch-all Segment — `[...slug]`

```tsx
// src/app/docs/[...slug]/page.tsx
interface Props {
  params: Promise<{ slug: string[] }>;
}

export default async function DocsPage({ params }: Props) {
  const { slug } = await params; // e.g. ['getting-started', 'install']
  return <div>{slug.join(' / ')}</div>;
}
```

## `generateStaticParams` — SSG for Dynamic Routes

```tsx
// src/app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

## Nested Layout

```tsx
// src/app/(app)/layout.tsx
import { Sidebar } from '@/components/layout/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
```

## Parallel Routes — `@slot` Pattern

```tsx
// src/app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode;
  analytics: React.ReactNode;
  team: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <div className="grid grid-cols-2 gap-4">
        {analytics}
        {team}
      </div>
    </div>
  );
}
```

Folder structure for the above:

```
src/app/dashboard/
├── layout.tsx
├── page.tsx
├── @analytics/
│   └── page.tsx
└── @team/
    └── page.tsx
```

## Intercepting Routes — Modal Pattern

```
src/app/
├── feed/page.tsx
├── photo/[id]/page.tsx          ← Full-page photo view
└── feed/@modal/(.)photo/
    └── [id]/page.tsx            ← Modal when navigating from /feed
```

The intercepting page renders the photo in a modal; the URL becomes `/photo/[id]`. Direct navigation to `/photo/[id]` shows the full page.

## Server-Side Redirect

```tsx
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return <div>Protected content</div>;
}
```

## Client-Side Navigation

```tsx
'use client';

import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh(); // re-fetch server data
  }

  return <button onClick={handleLogout}>Logout</button>;
}
```

## `src/proxy.ts` — Auth Guard (replaces middleware)

```ts
import { createProxy } from 'next/proxy';

export default createProxy({
  '/dashboard/:path*': async ({ request, next }) => {
    const session = request.cookies.get('session')?.value;
    if (!session) return Response.redirect(new URL('/login', request.url));
    return next();
  },
  '/api/:path*': async ({ request, next }) => {
    const token = request.headers.get('authorization');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    return next();
  },
});
```
