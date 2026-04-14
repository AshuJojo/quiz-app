# Basic Form Example

This is the standard pattern for a `react-hook-form` form using `zod` for validation, integrating tightly with a Server Action, and using a React transition for the pending state.

## 1. The Schema (`src/components/features/users/validations.ts`)

```ts
import { z } from 'zod';

export const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
```

## 2. The Server Action (`src/components/features/users/actions.ts`)

```ts
'use server';

import { userFormSchema } from './validations';
import { createUserService } from './services';
import { revalidatePath } from 'next/cache';

export async function createUser(data: unknown) {
  // Server MUST re-validate the data payload
  const result = userFormSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
      message: 'Invalid form data.',
    };
  }

  try {
    // Perform database operation strictly inside the service layer
    await createUserService(result.data);
    revalidatePath('/users');
    return { success: true };
  } catch (error) {
    return { success: false, message: 'A database error occurred.' };
  }
}
```

## 3. The Client Form (`src/components/features/users/components/user-form.tsx`)

```tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { userFormSchema, type UserFormValues } from '../validations';
import { createUser } from '../actions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function UserForm() {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  function onSubmit(values: UserFormValues) {
    setServerError(null);

    startTransition(async () => {
      const response = await createUser(values);

      if (!response.success) {
        if (response.errors) {
          // Map field errors from the server back to RHF
          Object.entries(response.errors).forEach(([key, messages]) => {
            form.setError(key as keyof UserFormValues, {
              type: 'server',
              message: messages[0],
            });
          });
        }
        if (response.message) {
          setServerError(response.message);
        }
      } else {
        // Success: reset form or redirect
        form.reset();
      }
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {serverError}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input id="name" placeholder="John Doe" {...form.register('name')} disabled={isPending} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          {...form.register('email')}
          disabled={isPending}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```
