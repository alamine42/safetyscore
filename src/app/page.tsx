import { getAllModels } from "@/lib/data";
import { ModelGrid } from "@/components/model-grid";

export default async function HomePage() {
  const models = await getAllModels();

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-card-border bg-gradient-to-b from-green-50/50 to-background dark:from-green-950/20 dark:to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
              <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2L3 8v12l11 6 11-6V8L14 2z"
                  fill="currentColor"
                  opacity="0.3"
                />
                <path
                  d="M9 14l3 3 7-7"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              AI Safety Ratings for Everyone
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              How Safe Is{" "}
              <span className="text-green-600 dark:text-green-400">
                Your AI
              </span>
              ?
            </h1>
            <p className="mt-4 text-lg text-muted sm:text-xl">
              We translate complex AI safety benchmarks into simple scorecards
              anyone can understand. Think nutrition labels, but for AI.
            </p>
          </div>
        </div>
      </section>

      {/* Model Grid */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Model Ratings</h2>
          <p className="mt-1 text-muted">
            Click any model to see its full safety scorecard.
          </p>
        </div>
        <ModelGrid models={models} />
      </section>
    </div>
  );
}
