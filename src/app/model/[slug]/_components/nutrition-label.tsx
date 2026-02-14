import type { ModelInfo, ModelScore } from "@/types/model";
import { CATEGORY_ORDER } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ScoreRing } from "@/components/ui/score-ring";
import { LetterGradeBadge } from "@/components/ui/letter-grade";
import { TrendIndicator } from "./trend-indicator";
import { CategoryRow } from "./category-row";

type NutritionLabelProps = {
  modelInfo: ModelInfo;
  modelScore: ModelScore;
};

export function NutritionLabel({ modelInfo, modelScore }: NutritionLabelProps) {
  const sortedCategories = CATEGORY_ORDER.map((cat) =>
    modelScore.categories.find((c) => c.category === cat)
  ).filter(Boolean);

  return (
    <div className="overflow-hidden rounded-xl border-2 border-label-border bg-label-bg">
      {/* Header */}
      <div className="border-b-4 border-label-border px-6 py-5">
        <h1 className="font-serif text-3xl font-black tracking-tight sm:text-4xl">
          Safety Facts
        </h1>
      </div>

      {/* Model info */}
      <div className="border-b border-card-border px-6 py-4">
        <div className="grid grid-cols-2 gap-y-1 text-sm">
          <span className="font-semibold">Model</span>
          <span>{modelInfo.name}</span>
          <span className="font-semibold">Provider</span>
          <span>{modelInfo.provider.name}</span>
          <span className="font-semibold">Evaluated</span>
          <span>{formatDate(modelScore.evaluatedDate)}</span>
          <span className="font-semibold">Methodology</span>
          <span>{modelScore.methodology}</span>
          {modelInfo.parameterCount && (
            <>
              <span className="font-semibold">Parameters</span>
              <span>{modelInfo.parameterCount}</span>
            </>
          )}
        </div>
      </div>

      {/* Overall score */}
      <div className="border-b-4 border-label-border px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">
              Overall Safety Score
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-4xl font-black tabular-nums sm:text-5xl">
                {modelScore.overallScore}
              </span>
              <span className="text-lg text-muted">/ 100</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <LetterGradeBadge grade={modelScore.overallGrade} size="lg" />
              <TrendIndicator trend={modelScore.overallTrend} size="md" />
              {modelScore.previousVersion && (
                <span className="text-xs text-muted">
                  vs {modelScore.previousVersion}
                </span>
              )}
            </div>
          </div>
          <div className="hidden sm:block">
            <ScoreRing score={modelScore.overallScore} size="lg" showGrade />
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="px-6 pb-2">
        <p className="pt-4 text-xs font-bold uppercase tracking-wider text-muted">
          Category Breakdown
        </p>

        {sortedCategories.map(
          (cs) =>
            cs && <CategoryRow key={cs.category} categoryScore={cs} />
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-card-border px-6 py-4">
        <p className="text-xs text-muted">
          Scores are based on publicly available benchmarks and are for
          educational purposes. They do not constitute endorsements or guarantees
          of safety.{" "}
          <a
            href="/about"
            className="font-medium text-green-700 underline underline-offset-2 dark:text-green-400"
          >
            View full methodology
          </a>
        </p>
      </div>
    </div>
  );
}
