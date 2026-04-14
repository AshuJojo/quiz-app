---
name: error-handling
description: Structured error handling for Next.js 16 including Server Action return shapes, global logging integrations, API route responses, and Zod error formatting.
---

# Error Handling Skill

Structured guidance for consistently catching, resolving, and surfacing errors to the user in Next.js 16.

**Triggers**: Creating a Server Action that mutates data · building a form with validation errors · handling database failures · setting up Sentry or external logging.

## Skill Structure

- **Resources**
  - [Server Action Responses](./resources/action-responses.md): The required union return type for Server Actions to ensure clients can handle successes and failures identically.
  - [Zod Error Formatting](./resources/zod-formatting.md): How to flatten and return Zod validation errors to a generic React Hook Form client.
- **Examples**
  - [Safe Action Wrapper](./examples/action-wrapper.md): A higher-order function to wrap Server Actions, guaranteeing a consistent return shape and catching unhandled exceptions.
  - [Global Error Logger](./examples/global-error-logger.md): Centralized logging utility for recording `500` level server errors before returning a generic response to the user.

## Strategy

1. **Validation Failures (4xx)** → Prevent bad data from hitting the database using Zod. Return these errors cleanly as `Success: false` with a `fieldErrors` map so the UI can highlight the correct input.
2. **Expected Business Logic Failures** → e.g., "Email already in use." Return as `Success: false` with a generic `message`.
3. **Unexpected Server Errors (5xx)** → e.g., Database goes down. ALWAYS catch these. Log the real error to your logger (Sentry/console) and return a generic "An unexpected error occurred" message to the client. _Never leak database stack traces to the browser._

## Key Constraints & Rules

> **Authoritative.** These constraints must be followed.

- **No throw in Actions** — Server Actions should almost never `throw Error()`, as this triggers the nearest React Error Boundary (`error.tsx`), causing a jarring full-page or partial-page crash. Instead, catch the error and return `{ success: false, message: "..." }` so the UI can display it gracefully.
- **Consistent Return Shape** — Every mutating Server Action must return the same unified type (e.g., `ActionState<T>`) so client-side handling is predictable.
- **`error.tsx` Ownership** — This skill does _not_ cover the structural placement of `error.tsx` or `not-found.tsx` files. That is owned by the `nextjs-tailwindcss-neon` App Router skill. This skill governs the _data flow_ of errors before they crash the page.
- **Sanitize Error Messages** — Server errors (Prisma codes, API keys) must be sanitized before reaching the return object payload.
