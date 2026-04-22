# Optimistic UI Update Pattern

Optimistic UI means updating the client interface immediately as if a mutation succeeded, while simultaneously executing the mutation in the background via a Server Action.

This eliminates perceived latency for the user.

## React 19 `useOptimistic`

The `useOptimistic` hook manages this state. It requires the 'true' server state as an initial value, and provides a dispatcher to optimistically append or mutate that state during an active transition.

### Rules for using `useOptimistic`

1. **Props first.** The source of truth comes from a Server Component as a prop.
2. **Transition boundary.** The optimistic update MUST be dispatched inside a React transition (via `<form action={action}>` or `startTransition`).
3. **Rollback is automatic.** If the Server Action throws an error or returns a failure without calling `revalidatePath`, the optimistic state automatically rolls back to the initial prop value when the transition ends.

### Basic Pattern

```tsx
'use client';

import { useOptimistic } from 'react';
import { submitMessageAction } from '@/actions/message.actions';

export function MessageList({ messages }: { messages: string[] }) {
  // 1. Initialize optimistic state with the server truth
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: string) => [...state, newMessage] // Reducer
  );

  // 2. Action handler wrapping the Server Action
  const action = async (formData: FormData) => {
    const text = formData.get('message') as string;

    // 3. Dispatch the optimistic update (happens immediately)
    addOptimisticMessage(text);

    // 4. Send to server (happens in background)
    // If this fails, React undoes the optimistic update automatically
    await submitMessageAction(formData);
  };

  return (
    <div>
      <ul>
        {optimisticMessages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
      <form action={action}>
        <input name="message" type="text" />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

### When to use Optimistic UI

- **High-frequency actions:** Liking a post, adding an item to a cart, sending a chat message.
- **Low-failure-rate actions:** If the mutation frequently fails (e.g., requires strict unique constraints that often collide), optimistic UI can cause jarring rollbacks for the user. Avoid it there.
