# Form Architecture

The standard form architecture tightly integrates client-side interactivity with secure server-side mutations using **Zod**, **React Hook Form (RHF)**, and **Server Actions**.

## The Data Flow Checklist

1. **Shared Zod Schema**: Defines the precise shape and constraints of the data. Located in `src/components/features/[entity]/validations.ts`.
2. **Client Form (RHF)**: A Client Component (`'use client'`) that uses `useForm` with a zod resolver to enforce client-side validation, update UI state, and prevent invalid requests from hitting the server.
3. **Server Action**: An asynchronous function (`'use server'`) that receives the form data, re-validates it against the exact same Zod schema, performs the database mutation (via the Service layer), and `revalidatePath` / `revalidateTag` to update the UI on success.

## Core Rules

### Rule 1: Never Trust the Client

Client-side validation with RHF is for **UX** (immediate feedback, error messages). Server actions MUST re-validate the data using `zod.parse()` or `zod.safeParse()` because HTTP requests can bypass the client UI.

### Rule 2: Server Action Return Shapes

Server Actions handling forms should always return a consistent union shape so the client can handle formatting gracefully.

```ts
// Ideal Return Type
type ActionState = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>; // Field-specific errors
};
```

If validation fails on the server, return early:

```ts
if (!parsed.success) {
  return { errors: parsed.error.flatten().fieldErrors };
}
```

### Rule 3: Use React 19's `useTransition` for loading state

Do not manually manage `isSubmitting` bounds. When passing your data to a Server Action from RHF's `handleSubmit`, wrap the Server Action call in React's `startTransition`.

```tsx
const [isPending, startTransition] = useTransition();

const onSubmit = (data) => {
  startTransition(async () => {
    const result = await myServerAction(data);
    if (result?.errors) {
      // manual error setting if server failed
    }
  });
};
```

_(Reference: [Basic Form Example](../examples/basic-form.md))_
