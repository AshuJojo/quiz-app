import { LayoutGrid, FolderTree, FileText } from 'lucide-react';

export const siteConfig = {
  name: 'Prepvers',
  description: 'Admin Panel',
  mainNav: [
    {
      title: 'Overview',
      href: '/dashboard',
      icon: LayoutGrid,
    },
    {
      title: 'Exams',
      href: '/exams',
      icon: FolderTree,
    },
    {
      title: 'Papers',
      href: '/papers',
      icon: FileText,
    },
  ],
};

export type SiteConfig = typeof siteConfig;
