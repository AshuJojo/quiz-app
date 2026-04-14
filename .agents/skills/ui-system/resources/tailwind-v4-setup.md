# Tailwind v4 Setup & Tokens

Tailwind CSS v4 introduces significant changes over v3. We use the `@theme` directive in CSS instead of a `tailwind.config.ts` JavaScript file.

## Design Tokens configuration in `globals.css`

The core to a cohesive design system is leveraging **Semantic Tokens** over hardcoded colors (e.g. `bg-blue-500`). We map a semantic palette (primary, secondary, muted, background, foreground) to distinct utility variables.

```css
@import 'tailwindcss';

@theme {
  /* Fonts */
  --font-sans: 'Inter', 'system-ui', sans-serif;
  --font-mono: 'Fira Code', monospace;

  /* Colors */
  --color-background: var(--background);
  --color-foreground: var(--foreground);

  /* Semantic Palette */
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  /* Radius */
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
}
```

## CSS Variables for Dark Mode

We control the semantic colors internally via standard CSS variables declared in the `:root` and `.dark` blocks. This avoids needing `dark:bg-primary` everywhere — instead, `bg-primary` automatically points to the correct value based on the scheme.

### Required base structure

See the [Theme Config](../examples/theme-config.md) example for a complete boilerplate of the CSS structure.

## Layout Values vs. Visual Settings

When building your generic primitives (cards, dialogs), prefer setting structural utilities (like `flex`, `grid`, `gap`, `p-`, `m-`) in the target page component. Try to restrict your primitive UI component to only handle semantic shape (`rounded`, `border`, `bg`, `text`), letting its parent dictate exactly how wide it is or where it sits on the screen.
