# Metadata & SEO

> **Examples**: See [Metadata & SEO Examples](../examples/metadata-seo.md) for copy-paste code — static metadata, `generateMetadata`, title template, `robots.ts`, `sitemap.ts`, viewport, JSON-LD, and `next/font`.

## Metadata API Overview

Export a `metadata` object or `generateMetadata` function from any `layout.tsx` or `page.tsx`. Next.js **merges metadata** from parent → child, with children taking priority for overlapping keys.

## Static vs Dynamic Metadata

| Pattern                                              | When to use                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| `export const metadata`                              | Title/description known at build time                        |
| `export async function generateMetadata({ params })` | Depends on fetched data (e.g. blog post title, product name) |

In v16, `generateMetadata` receives `params` as a `Promise` — always `await` it, consistent with `page.tsx`.

## Title Templates

Define `title.template` in the root layout (`'%s | My App'`). Child pages that export a plain `title: 'Page Name'` automatically render as `Page Name | My App`. The `default` value is used when no child sets a title.

## SEO Files

| File                 | What it generates                                       |
| -------------------- | ------------------------------------------------------- |
| `app/robots.ts`      | `robots.txt` — control crawler access per user-agent    |
| `app/sitemap.ts`     | `sitemap.xml` — can be async to include DB-fetched URLs |
| `app/icon.png`       | Auto-detected and served as `favicon.ico`               |
| `app/apple-icon.png` | Auto-detected Apple touch icon                          |

All are **type-safe** — return typed objects from `MetadataRoute.Robots`, `MetadataRoute.Sitemap`, etc.

## Viewport

Export `viewport` as a **separate named export** from `layout.tsx` — it is no longer part of the `Metadata` type in v16. Use for `themeColor`, `width`, and `initialScale`.

## JSON-LD Structured Data

Inject `<script type="application/ld+json">` directly in the Server Component JSX using `dangerouslySetInnerHTML`. No third-party library needed. Common schemas: `Product`, `Article`, `BreadcrumbList`, `FAQPage`.

## `next/font`

Always use `next/font/google` (or `next/font/local`) to load fonts:

- Self-hosted at build time — no runtime external request.
- Zero layout shift — dimensions reserved before font loads.
- Outputs CSS variables for Tailwind integration.

See [Metadata & SEO Examples](../examples/metadata-seo.md) for the full `next/font` setup in `layout.tsx`.
