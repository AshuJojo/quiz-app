---
name: ui-system
description: Design System with Tailwind CSS v4, custom component library, design tokens, dark mode, and accessible UI patterns (no Shadcn).
---

# UI System Skill

Structured guidance for implementing a robust, handcrafted design system using **pure Tailwind CSS**.

**Triggers**: Creating a new UI component · styling a page · setting up typography/colors · implementing dark mode · building forms · adding animations or transitions.

## Skill Structure

- **Resources** — concept & rules (no code). Each links to its paired example.
  - [Tailwind v4 Setup & Tokens](./resources/tailwind-v4-setup.md): Explanation of `@theme` block, defining tokens, and separating layout values from visual styles.
  - [Component Architecture](./resources/component-architecture.md): Principles for hand-crafting Tailwind components without an external library (like shadcn/ui). Use of `cn()`, variant management (e.g. `cva`), and prop spreading.
- **Examples** — copy-paste code snippets. Load only what's needed.
  - [Core Components](./examples/core-components.md): `Button`, `Input`, `Label`, `Card` hand-crafted implementations.
  - [Utility: `cn()`](./examples/cn-utility.md): The essential `clsx` and `tailwind-merge` utility wrapper.
  - [Theme Config (`globals.css`)](./examples/theme-config.md): Standard layout for `globals.css` holding all `@theme` variables and base styles.

## Strategy

1. **Initial setup** → Start with [Theme Config](./examples/theme-config.md) to define the color palette and typography in `globals.css`. Ensure the [Utility: `cn()`](./examples/cn-utility.md) is placed in `src/lib/utils/cn.ts`.
2. **Building UI** → Review the rules in [Component Architecture](./resources/component-architecture.md) before building new components. Reference [Core Components](./examples/core-components.md) for patterns.
3. **Variant management** → When a component requires multiple visual states (e.g. primary/secondary/destructive buttons, or sm/md/lg sizes), prefer `cva` (class-variance-authority) in combination with the `cn()` utility.

## Key Constraints & Rules

> **Authoritative.** These constraints must be followed.

- **Pure Tailwind CSS** — Do NOT use shadcn/ui, MUI, Chakra, or Ant Design unless the user _explicitly requests it_. Read the global rules: we hand-craft components.
- **The `cn()` utility** — Never manually concatenate dynamic Tailwind strings (e.g. `` `flex ${isActive ? 'bg-blue-500' : 'bg-transparent'}` ``). Always use `cn("flex", isActive ? "bg-blue-500" : "bg-transparent")`.
- **Tailwind v4 Tokens** — Do not use an external `tailwind.config.ts` for theme definitions (unless upgrading). Define all tokens (colors, fonts, box-shadows, etc.) directly using the `@theme` directive in `src/globals.css`.
- **Dark Mode Strategy** — Use class-based dark mode (`dark:bg-slate-900`) instead of media queries. Define distinct semantic CSS variables within the `@theme` or `:root` block for light/dark rather than hardcoding specific hex values into standard utility classes when a unified semantic system is better.
- **No Inline Styles** — Avoid the `style` attribute. Only use it when the value is truly dynamic (like a progress bar width calculated from a database value) and cannot be mapped to a utility class.
