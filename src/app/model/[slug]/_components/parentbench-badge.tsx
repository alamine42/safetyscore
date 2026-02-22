import Link from "next/link";
import type { ParentBenchResult } from "@/types/parentbench";
import { ScoreRing } from "@/components/ui/score-ring";
import { LetterGradeBadge } from "@/components/ui/letter-grade";
import { ColorBar } from "@/components/ui/color-bar";
import { PARENTBENCH_CATEGORY_META, PARENTBENCH_CATEGORY_ORDER } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type ParentBenchBadgeProps = {
  result: ParentBenchResult | null;
  rank: number | null;
  totalModels: number;
};

export function ParentBenchBadge({ result, rank, totalModels }: ParentBenchBadgeProps) {
  // Model not yet evaluated
  if (!result) {
    return (
      <div className="mt-6 rounded-xl border border-card-border bg-card-bg p-6">
        <div className="flex items-center gap-2 text-muted">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            />
          </svg>
          <span className="font-semibold">ParentBench Child Safety</span>
        </div>
        <p className="mt-3 text-sm text-muted">
          This model has not yet been evaluated for child safety.
        </p>
        <Link
          href="/parentbench"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View evaluated models
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border border-card-border bg-card-bg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-card-border bg-blue-50/50 px-4 py-3 dark:bg-blue-950/20">
        <svg
          className="h-5 w-5 text-blue-600 dark:text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
          />
        </svg>
        <span className="font-semibold text-blue-900 dark:text-blue-100">
          ParentBench Child Safety
        </span>
      </div>

      <div className="p-4">
        {/* Overall score + rank */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScoreRing score={result.overallScore} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold tabular-nums">
                  {result.overallScore}
                </span>
                <LetterGradeBadge grade={result.overallGrade} size="sm" />
              </div>
              {rank && (
                <p className="text-sm text-muted">
                  Ranked #{rank} of {totalModels} models
                </p>
              )}
            </div>
          </div>
          <Link
            href="/parentbench"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View leaderboard →
          </Link>
        </div>

        {/* Category scores */}
        <div className="mt-4 grid gap-2">
          {PARENTBENCH_CATEGORY_ORDER.map((cat) => {
            const catScore = result.categoryScores.find((c) => c.category === cat);
            if (!catScore) return null;
            const meta = PARENTBENCH_CATEGORY_META[cat];
            return (
              <div key={cat} className="flex items-center gap-3">
                <span className="w-28 text-xs text-muted truncate" title={meta.label}>
                  {meta.label}
                </span>
                <div className="flex-1">
                  <ColorBar score={catScore.score} height="sm" />
                </div>
                <span className="w-8 text-right text-xs font-medium tabular-nums">
                  {catScore.score}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-4 text-xs text-muted">
          Evaluated {formatDate(result.evaluatedDate)}
        </p>
      </div>
    </div>
  );
}
