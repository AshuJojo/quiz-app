# Utility: `cn()`

The `cn()` utility allows safe conditional class injection and prevents Tailwind conflict overriding using `clsx` and `tailwind-merge`.

**Every UI component that accepts `className` must merge structural utilities with its internal visual utilities using this function.**

## `src/lib/utils/cn.ts`

```ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Make sure the required dependencies are installed:

```bash
npm install clsx tailwind-merge
```
