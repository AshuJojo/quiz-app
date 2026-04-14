# Zod Error Formatting

When validating input with Zod in a Server Action, you must return errors in a format that `react-hook-form` and standard UI components can consume easily.

## Extracting Field Errors

Zod's native error shape (`ZodIssue`) is too verbose for the UI. We use the `.flatten()` method exposed on the Zod error object.

### The Standard Validation Block

```ts
import { mySchema } from '@/lib/validations/my.schema';

export async function myAction(data: unknown) {
  const parsed = mySchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      // .flatten().fieldErrors returns a clean Record<string, string[]>
      // Example: { email: ["Invalid email"], password: ["Too short"] }
      errors: parsed.error.flatten().fieldErrors,
      message: 'Please fix the validation errors.',
    };
  }

  // proceed with parsed.data...
}
```

### Applying Field Errors to React Hook Form

When your Server Action returns these errors to the client, loop over the `Record<string, string[]>` and apply them directly to `react-hook-form` state so the user sees the red validation rings.

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { useTransition } from 'react';
import { myAction } from '@/actions/my.action';

export function MyForm() {
  const form = useForm();
  const [isPending, startTransition] = useTransition();

  function onSubmit(values) {
    startTransition(async () => {
      const response = await myAction(values);

      if (!response.success && response.errors) {
        // Map the flattened Zod field errors back to RHF inputs
        Object.entries(response.errors).forEach(([field, messages]) => {
          form.setError(field as keyof typeof values, {
            type: 'server',
            message: messages[0], // take the first error message
          });
        });
      }
    });
  }

  // <form onSubmit={form.handleSubmit(onSubmit)}>...
}
```

## Global Schema Errors

Sometimes a Zod schema has a `.refine()` block on the _whole_ object (e.g., verifying that "password" and "confirmPassword" match).

These become `formErrors` instead of `fieldErrors`.

```ts
if (!parsed.success) {
  const flat = parsed.error.flatten();
  return {
    success: false,
    errors: flat.fieldErrors,
    // Pass top-level refine errors back as a generic message
    message: flat.formErrors.length ? flat.formErrors[0] : 'Validation failed.',
  };
}
```
