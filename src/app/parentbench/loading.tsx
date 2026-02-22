export default function ParentBenchLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <section className="border-b border-card-border bg-gradient-to-b from-blue-50/50 to-background dark:from-blue-950/20 dark:to-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto h-6 w-48 rounded-full bg-muted-bg" />
            <div className="mx-auto mt-4 h-10 w-80 rounded-lg bg-muted-bg" />
            <div className="mx-auto mt-4 h-6 w-96 rounded-lg bg-muted-bg" />
            <div className="mt-8 flex justify-center gap-10">
              <div className="h-12 w-20 rounded-lg bg-muted-bg" />
              <div className="h-12 w-20 rounded-lg bg-muted-bg" />
              <div className="h-12 w-24 rounded-lg bg-muted-bg" />
            </div>
          </div>
        </div>
      </section>

      {/* Table Skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex gap-4">
          <div className="h-9 w-32 rounded-lg bg-muted-bg" />
          <div className="h-9 w-32 rounded-lg bg-muted-bg" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-card-border bg-card-bg p-4"
            >
              <div className="h-8 w-8 rounded-full bg-muted-bg" />
              <div className="h-7 w-7 rounded-md bg-muted-bg" />
              <div className="flex-1">
                <div className="h-5 w-40 rounded bg-muted-bg" />
                <div className="mt-1 h-4 w-24 rounded bg-muted-bg" />
              </div>
              <div className="h-12 w-12 rounded-full bg-muted-bg" />
              <div className="hidden lg:flex gap-4">
                <div className="h-6 w-16 rounded bg-muted-bg" />
                <div className="h-6 w-16 rounded bg-muted-bg" />
                <div className="h-6 w-16 rounded bg-muted-bg" />
                <div className="h-6 w-16 rounded bg-muted-bg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
