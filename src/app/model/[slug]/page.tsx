import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllModelSlugs, getModelBySlug, getModelScore } from "@/lib/data";
import { NutritionLabel } from "./_components/nutrition-label";
import { VersionHistory } from "./_components/version-history";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllModelSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  if (!model) return {};
  return {
    title: `${model.name} Safety Score`,
    description: `Safety scorecard for ${model.name} by ${model.provider.name}. Overall safety score: ${model.overallScore}/100 (${model.overallGrade}).`,
  };
}

export default async function ModelPage({ params }: Props) {
  const { slug } = await params;
  const [model, score] = await Promise.all([
    getModelBySlug(slug),
    getModelScore(slug),
  ]);

  if (!model || !score) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{model.name}</span>
      </nav>

      <NutritionLabel modelInfo={model} modelScore={score} />

      {score.history && score.history.length >= 2 && (
        <VersionHistory history={score.history} currentVersion={model.name} />
      )}

      {/* Report Issue CTA */}
      <div className="mt-8 rounded-xl border border-dashed border-card-border bg-muted-bg/30 p-6 text-center">
        <h3 className="font-semibold">Found a safety issue with {model.name}?</h3>
        <p className="mt-1 text-sm text-muted">
          Help improve our scores by reporting your findings.
        </p>
        <Link
          href={`/report?model=${slug}`}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Report an Issue
        </Link>
      </div>

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
