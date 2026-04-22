# Global Error Logger

A centralized logging utility ensures that `500` level errors (crashes, unhandled exceptions) are consistently recorded before sanitized generic responses are served to the client. This is the integration point for tools like Sentry, DataDog, or basic file logging.

## `src/lib/logger.ts`

```ts
import { headers } from 'next/headers';
// Example integration: import * as Sentry from "@sentry/nextjs"

type ErrorContext = {
  context: string;
  payload?: unknown;
  userId?: string;
  requestId?: string;
};

/**
 * Centrally logs unhandled exceptions.
 * Swap `console.error` for your preferred observability platform.
 */
export async function logError(error: unknown, meta?: ErrorContext) {
  // 1. Gather environmental context from Request Headers (optional)
  const reqHeaders = await headers();
  const userAgent = reqHeaders.get('user-agent') || 'unknown';
  const ip = reqHeaders.get('x-forwarded-for') || 'unknown';

  // 2. Format the error securely
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : undefined;

  // 3. Log to Console (Dev) or Service (Prod)
  if (process.env.NODE_ENV === 'development') {
    console.group(`🚨 ERROR [${meta?.context || 'Global'}]`);
    console.error(errorMessage);
    if (meta?.payload) console.dir(meta.payload, { depth: null });
    if (stack) console.error(stack);
    console.groupEnd();
  } else {
    // Production Logging
    const logPayload = {
      level: 'error',
      message: errorMessage,
      stack,
      ...meta,
      req: { ip, userAgent },
    };

    // --> Example: Send to Axiom, Datadog, or write to ELK stack
    console.error(JSON.stringify(logPayload));

    // --> Example: Send to Sentry
    /*
    Sentry.withScope((scope) => {
      if (meta?.context) scope.setTag("context", meta.context)
      if (meta?.userId) scope.setUser({ id: meta.userId })
      if (meta?.payload) scope.setExtra("payload", meta.payload)
      Sentry.captureException(error)
    })
    */
  }
}
```

## Usage

You primarily use `logError` inside the catch block of a Server Action Wrapper, or at the root `error.tsx` boundary.

See [Safe Action Wrapper](../examples/action-wrapper.md) for how it securely intercepts action executions.
