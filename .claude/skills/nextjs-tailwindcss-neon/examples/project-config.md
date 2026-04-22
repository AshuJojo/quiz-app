# Example: Project Config Boilerplate

Ready-to-copy configuration files for a scalable Next.js 16 + Tailwind CSS project with `src/` layout.

## `tailwind.config.ts`

```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/providers/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        // Add your brand palette here
      },
    },
  },
  plugins: [],
};

export default config;
```

## `src/app/globals.css`

```css
@import 'tailwindcss';
```

> Tailwind v4 (default with Next.js 16) uses a single import instead of the old `@tailwind base/components/utilities` directives.

## `tsconfig.json` — Path Aliases

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## `next.config.ts`

```ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [{ source: '/home', destination: '/', permanent: true }];
  },
};

export default config;
```

## `src/lib/utils/cn.ts` — Tailwind Class Merger

```ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Used in every component to conditionally merge Tailwind classes safely:

```tsx
import { cn } from '@/lib/utils/cn';

function Button({ className, disabled }: { className?: string; disabled?: boolean }) {
  return (
    <button className={cn('px-4 py-2 rounded', disabled && 'opacity-50', className)}>
      Click me
    </button>
  );
}
```

## `src/config/site.ts`

```ts
export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME ?? 'My App',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  description: 'A scalable Next.js 16 application.',
  nav: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Users', href: '/users' },
    { label: 'Settings', href: '/settings' },
  ],
} as const;
```

## `src/providers/index.tsx` — Composed Providers

```tsx
'use client';

import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>{children}</QueryProvider>
    </ThemeProvider>
  );
}
```

## `src/proxy.ts` — Auth Guard

```ts
import { createProxy } from 'next/proxy';

export default createProxy({
  '/dashboard/:path*': async ({ request, next }) => {
    const session = request.cookies.get('session')?.value;
    if (!session) return Response.redirect(new URL('/login', request.url));
    return next();
  },
  '/settings/:path*': async ({ request, next }) => {
    const session = request.cookies.get('session')?.value;
    if (!session) return Response.redirect(new URL('/login', request.url));
    return next();
  },
});
```
