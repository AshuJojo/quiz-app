# Server Action Responses

Server Actions invoked by forms or client-side interactions should never crash the React tree. They must return a predictable object shape.

## Standard Action State Type

Define this generic type in `src/types/index.ts` so it is available globally.

```ts
export type ActionState<T = void> = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>; // Zod field errors
  data?: T; // Optional payload on success
};
```

## Implementation Rules

### 1. The Validation Response

When Zod validation fails, return the specific `errors` object. Set `success: false`.

```ts
const result = mySchema.safeParse(input);
if (!result.success) {
  return {
    success: false,
    message: 'Please fix the errors in the form.',
    errors: result.error.flatten().fieldErrors,
  };
}
```

### 2. The Business Logic Failure

When an operation fails due to rules (e.g. payment declined, user not found), return a user-facing `message`.

```ts
const user = await db.user.findUnique({ email });
if (user) {
  return {
    success: false,
    message: 'A user with this email already exists.',
  };
}
```

### 3. The Unexpected Server Error (Catch Block)

If Prisma or an external API throws, catch the error, log the real error on the server, and return a _sanitized_ generic message to the client.

```ts
  try {
    await db.post.create(...)
    return { success: true, message: "Post created successfully." }
  } catch (error) {
    // 1. Log the real error to your observability platform
    console.error("[PostAction:Create]", error)

    // 2. Return a safe, generic message
    return {
      success: false,
      message: "An unexpected error occurred while saving the post.",
    }
  }
```

## Why not just `throw new Error()`?

Throwing an error inside a Server Action that was instantiated from a Client Component (like a form) will trigger the nearest Next.js `error.tsx` boundary. This replaces the user's current UI with a crash screen, losing their form state and context.

Returning a standardized error payload allows the Client Component to display a red toast or inline error message while preserving the UI and user input.
