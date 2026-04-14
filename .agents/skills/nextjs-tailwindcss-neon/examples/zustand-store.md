# Example: Zustand UI Store

Zustand for app-wide client UI state — sidebar, modals, toasts. Only use inside `'use client'` components.

## `src/stores/ui.store.ts`

```ts
import { create } from 'zustand';

interface UIStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
```

## Usage in a Client Component

```tsx
'use client';
import { useUIStore } from '@/stores/ui.store';

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  return (
    <aside className={isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}>
      <button onClick={toggleSidebar}>{isSidebarOpen ? 'Collapse' : 'Expand'}</button>
    </aside>
  );
}
```

## Modal Trigger

```tsx
'use client';
import { useUIStore } from '@/stores/ui.store';

export function DeleteButton({ id }: { id: string }) {
  const openModal = useUIStore((s) => s.openModal);
  return <button onClick={() => openModal(`delete-${id}`)}>Delete</button>;
}

export function ConfirmDeleteModal({ id }: { id: string }) {
  const { activeModal, closeModal } = useUIStore();
  if (activeModal !== `delete-${id}`) return null;
  return (
    <dialog open>
      <p>Are you sure?</p>
      <button onClick={closeModal}>Cancel</button>
    </dialog>
  );
}
```

## Hydration-Safe Pattern (SSR Projects)

When the store needs server-passed initial values, use `createStore` inside a Provider:

```tsx
// src/providers/ui-store-provider.tsx
'use client';
import { createContext, useContext, useRef } from 'react';
import { createStore, useStore } from 'zustand';

type UIState = { isSidebarOpen: boolean };
type UIStore = UIState & { toggleSidebar: () => void };

const UIStoreContext = createContext<ReturnType<typeof createStore<UIStore>> | null>(null);

export function UIStoreProvider({
  children,
  defaultOpen = true,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const storeRef = useRef<ReturnType<typeof createStore<UIStore>>>();
  if (!storeRef.current) {
    storeRef.current = createStore<UIStore>((set) => ({
      isSidebarOpen: defaultOpen,
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
    }));
  }
  return <UIStoreContext.Provider value={storeRef.current}>{children}</UIStoreContext.Provider>;
}

export function useUIStore<T>(selector: (s: UIStore) => T) {
  const store = useContext(UIStoreContext);
  if (!store) throw new Error('useUIStore must be used inside UIStoreProvider');
  return useStore(store, selector);
}
```
