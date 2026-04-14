# Example: Service + Action Pattern

Demonstrates the recommended data-flow layer in a scalable Next.js project:
**Component → Server Action → Service → `lib/db`**

## `src/components/features/users/validations.ts` — Zod Schema

```ts
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

## `src/components/features/users/services.ts` — Business Logic Layer

Services own all DB queries. Actions and API routes call services within this feature — never `db` directly.

```ts
import { db } from '@/lib/db';
import type { CreateUserInput } from './validations';

export async function getUserById(id: string) {
  return db.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}

export async function createUser(data: CreateUserInput) {
  return db.user.create({ data });
}

export async function getAllUsers({ page = 1, limit = 20 } = {}) {
  const [users, total] = await db.$transaction([
    db.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    db.user.count(),
  ]);
  return { users, total, pages: Math.ceil(total / limit) };
}

export async function deleteUser(id: string) {
  return db.user.delete({ where: { id } });
}
```

## `src/components/features/users/actions.ts` — Server Action Layer

Actions are thin: validate input → call service → revalidate cache → return result.

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { createUser, deleteUser } from './services';
import { createUserSchema } from './validations';

export async function createUserAction(formData: FormData) {
  const parsed = createUserSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const user = await createUser(parsed.data);
  revalidatePath('/users');
  return { success: true, user };
}

export async function deleteUserAction(id: string) {
  await deleteUser(id);
  revalidatePath('/users');
  return { success: true };
}
```

## Using the Action in a Component

```tsx
// src/components/features/users/components/user-form.tsx
'use client';

import { createUserAction } from '../actions';
import { useFormState } from 'react-dom';

const initialState = { error: null };

export function UserForm() {
  const [state, action] = useFormState(createUserAction, initialState);

  return (
    <form action={action}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="name" placeholder="Name" />
      {state?.error?.email && <p>{state.error.email}</p>}
      <button type="submit">Create User</button>
    </form>
  );
}
```
