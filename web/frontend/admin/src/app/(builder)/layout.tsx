'use client';

import { ReactNode } from 'react';

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full flex flex-col bg-background overflow-hidden font-sans">
      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
