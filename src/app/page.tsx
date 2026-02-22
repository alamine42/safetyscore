import Link from "next/link";
import { getAllModels } from "@/lib/data";
import { getParentBenchScores } from "@/lib/parentbench";
import { ModelGrid } from "@/components/model-grid";
import { NewsletterSignup } from "@/components/newsletter-signup";

export default async function HomePage() {
  const [models, parentBenchScores] = await Promise.all([
    getAllModels(),
    getParentBenchScores(),
  ]);

  // Create a record of model slug to ParentBench grade (plain object for serialization)
  const parentBenchGrades: Record<string, string> = {};
  for (const score of parentBenchScores) {
    parentBenchGrades[score.modelSlug] = score.overallGrade;
  }

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
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-medium text-white transition-colors hover:bg-green-700"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                    clipRule="evenodd"
                  />
                </svg>
                Which AI Should I Use?
              </Link>
              <Link
                href="/compare"
                className="inline-flex items-center gap-2 rounded-lg border border-card-border px-6 py-3 font-medium transition-colors hover:bg-muted-bg"
              >
                Compare Models
              </Link>
            </div>
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
        <ModelGrid models={models} parentBenchGrades={parentBenchGrades} />
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <NewsletterSignup />
      </section>
    </div>
  );
}
