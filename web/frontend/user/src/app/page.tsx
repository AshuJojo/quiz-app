export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <section className="w-full max-w-3xl rounded-md bg-surface-container-lowest p-10 shadow-ambient">
        <p className="text-sm font-medium text-primary">Prepvers Learner</p>
        <h1 className="mt-4 text-4xl font-semibold text-on-background">User app foundation</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-on-surface-variant">
          The learner experience is ready for feature modules, route groups, and shared UI without
          any product workflows wired in yet.
        </p>
      </section>
    </main>
  );
}
