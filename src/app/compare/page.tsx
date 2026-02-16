import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getAllModels, getModelBySlug } from "@/lib/data";
import { ModelSelector } from "./_components/model-selector";
import { ComparisonView } from "./_components/comparison-view";

export const metadata: Metadata = {
  title: "Compare AI Models",
  description:
    "Compare safety scores between AI models side-by-side. See which model performs better across honesty, fairness, safety, and more.",
};

type Props = {
  searchParams: Promise<{ a?: string; b?: string }>;
};

async function ComparisonContent({ searchParams }: Props) {
  const { a, b } = await searchParams;
  const models = await getAllModels();

  const modelA = a ? await getModelBySlug(a) : null;
  const modelB = b ? await getModelBySlug(b) : null;

  const bothSelected = modelA && modelB;

  return (
    <>
      <ModelSelector
        models={models}
        selectedA={a || null}
        selectedB={b || null}
      />

      {/* Comparison or placeholder */}
      <div className="mt-8">
        {bothSelected ? (
          <ComparisonView modelA={modelA} modelB={modelB} />
        ) : (
          <div className="rounded-xl border border-dashed border-card-border bg-muted-bg/30 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted-bg">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted"
              >
                <path d="M16 3h5v5" />
                <path d="M8 3H3v5" />
                <path d="M21 3l-7 7" />
                <path d="M3 3l7 7" />
                <path d="M16 21h5v-5" />
                <path d="M8 21H3v-5" />
                <path d="M21 21l-7-7" />
                <path d="M3 21l7-7" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              Select two models to compare
            </h3>
            <p className="text-muted">
              Choose models from the dropdowns above to see a detailed
              side-by-side safety comparison.
            </p>
          </div>
        )}
      </div>

      {/* Quick comparison links */}
      {!bothSelected && (
        <div className="mt-8">
          <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted">
            Popular Comparisons
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { a: "claude-3-5-sonnet", b: "gpt-4o", label: "Claude vs GPT-4o" },
              { a: "gpt-4o", b: "gemini-1-5-pro", label: "GPT-4o vs Gemini" },
              { a: "claude-3-5-sonnet", b: "llama-3-1-405b", label: "Claude vs Llama" },
            ].map((comparison) => (
              <Link
                key={`${comparison.a}-${comparison.b}`}
                href={`/compare?a=${comparison.a}&b=${comparison.b}`}
                className="rounded-full border border-card-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-green-500 hover:text-green-600 dark:hover:text-green-400"
              >
                {comparison.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default async function ComparePage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Compare AI Models</h1>
        <p className="mt-2 text-muted">
          See how different AI models stack up on safety metrics
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        }
      >
        <ComparisonContent searchParams={searchParams} />
      </Suspense>

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
        >
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to all models
        </Link>
      </div>
    </div>
  );
}
