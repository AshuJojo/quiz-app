import { DashboardOverview } from '@/components/features/dashboard/components/dashboard-overview';

export const metadata = {
  title: 'Dashboard | Admin',
  description: 'Overview of the Prepvers Admin Panel',
};

export default function DashboardPage() {
  return (
    <div className="mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <DashboardOverview />
    </div>
  );
}
