import { Sidebar } from '@/components/layout/sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 pl-0 md:pl-64">
        <div>{children}</div>
      </main>
    </div>
  );
}
