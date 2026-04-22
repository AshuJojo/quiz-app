---
name: forms
description: Forms architecture using react-hook-form, zod, and Next.js Server Actions, including optimistic UI, multi-step forms, and file uploads.
---

# Forms Skill

Structured guidance for implementing robust, accessible, and type-safe forms in Next.js 16 applications.

**Triggers**: Building a form · validating user input · handling complex state (multi-step) · optimistic UI updates · file uploads.

## Skill Structure

- **Resources** — concepts & architecture (no code). Each resource links to its paired example.
  - [Form Architecture](./resources/architecture.md): The core pattern combining `react-hook-form` (client state), `zod` (validation), and Server Actions (mutations).
  - [Optimistic UI](./resources/optimistic-ui.md): Utilizing React 19's `useOptimistic` hook for immediate UI feedback before Server Actions complete.
- **Examples** — copy-paste code templates. Load only what's needed.
  - [Basic Form](./examples/basic-form.md): Standard, single-step form with validation and Server Action submission.
  - [Multi-Step Form](./examples/multi-step-form.md): A wizard pattern managing state across multiple views before final submission.
  - [File Uploads](./examples/file-upload.md): Handling `FormData` correctly for file inputs via Server Actions.

## Strategy

1. **Schema first** → Define the `zod` schema in `src/components/features/[entity]/validations.ts` before writing any UI or Action code. (See `nextjs-tailwindcss-neon` skill).
2. **Client-side validation** → Always use `react-hook-form` paired with `@hookform/resolvers/zod` to validate input interactively before hitting the server.
3. **Server-side execution** → Submit the validated data to a Server Action. The Server Action _must_ re-validate the data using the same `zod` schema to ensure security.
4. **Use native form components** → Build the form using the handcrafted UI primitives from the `ui-system` skill (`Input`, `Label`, `Button`).

## Key Constraints & Rules

> **Authoritative.** These constraints must be followed.

- **Dual Validation Required** — You MUST validate data on the client using `react-hook-form` and the _same_ `zod` schema on the server inside the Server Action. Never trust client data.
- **No API Routes for Forms** — Do not use `app/api/...` route handlers for form submission. Use Server Actions exclusively.
- **Progressive Enhancement Optional** — We optimize for heavily interactive web apps. Pure progressive enhancement (forms working without JavaScript) is not a strict requirement unless explicitly requested by the user. Rely on `react-hook-form`.
- **UI Decoupling** — This skill does not own the visual design of inputs or buttons. Use the primitives defined by the `ui-system` skill.
- **No Third-Party Form Builders** — Do not use tools like Formik or Formbricks. Stick to the `react-hook-form` + `zod` standard.
