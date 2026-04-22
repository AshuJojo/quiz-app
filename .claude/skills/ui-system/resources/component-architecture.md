# Component Architecture

Our UI components are handcrafted using Tailwind primitives. They must be robust, easy to drop in, and accessible.

## Core Rules for Creating a Component

### Use `cn()` for standard and conditional class merging

Component primitives frequently accept a `className` prop so the parent can override layout behaviors. You MUST use the `cn` utility (from `clsx` and `tailwind-merge`) to merge incoming class strings with base strings to prevent conflicts.

```tsx
// ❌ BAD: String concatenation conflicts with base 'flex' if className sets 'grid' or 'block'
export function Box({ className }: { className?: string }) {
  return <div className={`flex flex-col p-4 ${className}`} />;
}

// ✅ GOOD: 'flex' can be safely overridden by the caller using 'cn'
import { cn } from '@/lib/utils/cn';

export function Box({ className }: { className?: string }) {
  return <div className={cn('flex flex-col p-4', className)} />;
}
```

### Prop Forwarding

Your UI components should wrap intrinsic HTML elements `<button>`, `<div>`, `<input>` seamlessly without blocking their native props. Always use `React.ComponentProps<"element">` and standard rest property (`...props`) forwarding.

```tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface SimpleButtonProps extends React.ComponentProps<'button'> {
  children: ReactNode;
}

export function SimpleButton({ children, className, ...props }: SimpleButtonProps) {
  return (
    <button
      className={cn('bg-primary text-primary-foreground px-4 py-2 rounded-md', className)}
      {...props}
    >
      {children}
    </button>
  );
}
```

### Managing Variants with `cva`

If an element has multiple visual states (`variant`, `size`), do not manually write complex ternaries bridging them. Use `cva` (class-variance-authority) to map props automatically to standard utility sets.

See [Core Components](../examples/core-components.md) for how `cva` is used for powerful, declarative primitives.
