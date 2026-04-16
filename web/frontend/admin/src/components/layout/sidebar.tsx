'use client';

import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col bg-surface-container py-8 md:flex">
      <div className="mb-12 px-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-primary">
          {siteConfig.name}
        </h1>
        <p className="font-sans text-[10px] font-bold tracking-[0.1em] text-on-surface-variant uppercase">
          {siteConfig.description}
        </p>
      </div>

      <nav className="flex flex-1 flex-col space-y-1.5 px-4">
        {siteConfig.mainNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || (item.href === '/dashboard' && pathname === '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-md px-4 py-2.5 transition-all duration-200',
                isActive
                  ? 'bg-primary-container/30 text-primary border-r-4 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-transform duration-200',
                  isActive ? 'text-primary' : 'text-on-surface-variant group-hover:scale-110'
                )}
              />
              <span className="font-sans text-sm font-semibold tracking-tight">{item.title}</span>

              {/* Active Indicator Pillar */}
              {/* {isActive && (
                <div className="absolute right-0 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-l-full bg-primary" />
              )} */}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
