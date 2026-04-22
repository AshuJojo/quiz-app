# Safe Action Wrapper

To guarantee that _every_ Server Action always returns the correct `ActionState` type and never crashes the server due to an unhandled exception (e.g. Prisma throwing a unique constraint violation), define a safe higher-order wrapper.

## `src/lib/safe-action.ts`

```ts
import { z } from 'zod';
import { ActionState } from '@/types';
import { logError } from '@/lib/logger';

/**
 * A wrapper for Server Actions that handles Zod validation and catches all errors.
 * Guarantees a consistent `ActionState<T>` return shape.
 */
export async function safeAction<TSchema extends z.ZodType, TReturn>(
  schema: TSchema,
  data: unknown,
  actionFn: (validatedData: z.infer<TSchema>) => Promise<TReturn>
): Promise<ActionState<TReturn>> {
  // 1. Zod Validation Phase
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      success: false,
      errors: flat.fieldErrors,
      message: flat.formErrors.length ? flat.formErrors[0] : 'Invalid input data.',
    };
  }

  // 2. Execution Phase
  try {
    const result = await actionFn(parsed.data);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    // 3. Global Error Interception Phase

    // Log the actual server stack trace securely
    await logError(error, {
      context: 'safeAction',
      payload: parsed.data,
    });

    // Return a sanitized generic message to the client
    return {
      success: false,
      message: 'An unexpected error occurred. Our team has been notified.',
    };
  }
}
```

## Usage in `.actions.ts`

Using the wrapper ensures your Actions remain exceptionally thin, readable, and perfectly typed.

```ts
'use server';

import { safeAction } from '@/lib/safe-action';
import { userSchema } from '@/lib/validations/user.schema';
import { createUserService } from '@/services/user.service';
import { revalidatePath } from 'next/cache';

export async function createUserAction(data: unknown) {
  return safeAction(userSchema, data, async (validatedData) => {
    // We are guaranteed that `validatedData` matches the schema here

    // DB operations inside the service
    // If this throws, `safeAction` catches it automatically
    const user = await createUserService(validatedData);

    revalidatePath('/users');

    // Return the specific payload you want on success
    return { userId: user.id };
  });
}
```
