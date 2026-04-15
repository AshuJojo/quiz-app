export function DashboardOverview() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight text-on-background">
          Dashboard
        </h2>
        <p className="mt-1 text-sm font-medium text-on-surface-variant">
          General overview for today
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Metric Cards - Tonal Stacking (White on Gray) */}
        <div className="rounded-md bg-surface-container-lowest p-6 shadow-ambient transition-transform hover:scale-[1.02]">
          <h3 className="text-sm font-bold tracking-wide text-on-surface-variant uppercase">
            Total Papers
          </h3>
          <p className="mt-2 text-4xl font-bold text-primary">24</p>
        </div>

        <div className="rounded-md bg-surface-container-lowest p-6 shadow-ambient transition-transform hover:scale-[1.02]">
          <h3 className="text-sm font-bold tracking-wide text-on-surface-variant uppercase">
            Exams
          </h3>
          <p className="mt-2 text-4xl font-bold text-primary">12</p>
        </div>

        <div className="rounded-md bg-surface-container-lowest p-6 shadow-ambient transition-transform hover:scale-[1.02]">
          <h3 className="text-sm font-bold tracking-wide text-on-surface-variant uppercase">
            Recent Submissions
          </h3>
          <p className="mt-2 text-4xl font-bold text-primary">156</p>
        </div>
      </div>

      <div className="rounded-md bg-surface-container-lowest p-8 shadow-ambient">
        <h3 className="font-display text-xl font-bold text-on-background">Analytics Progress</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          The "Paper" section is ready for management. Start by reviewing exams.
        </p>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-surface-container">
          <div className="h-full w-[65%] bg-primary transition-all duration-1000" />
        </div>
      </div>
    </div>
  );
}
