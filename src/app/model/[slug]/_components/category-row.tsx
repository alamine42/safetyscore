import type { CategoryScore } from "@/types/model";
import { CATEGORY_META } from "@/lib/constants";
import { LetterGradeBadge } from "@/components/ui/letter-grade";
import { ColorBar } from "@/components/ui/color-bar";
import { TrendIndicator } from "./trend-indicator";
import { ExpandableSection } from "./expandable-section";

type CategoryRowProps = {
  categoryScore: CategoryScore;
};

export function CategoryRow({ categoryScore }: CategoryRowProps) {
  const meta = CATEGORY_META[categoryScore.category];

  return (
    <div className="border-t border-card-border py-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{meta.label}</span>
            <LetterGradeBadge grade={categoryScore.grade} size="sm" />
            <TrendIndicator trend={categoryScore.trend} />
          </div>
          <p className="mt-0.5 text-sm italic text-muted">
            &ldquo;{meta.question}&rdquo;
          </p>
        </div>
        <span className="text-xl font-bold tabular-nums">
          {categoryScore.score}
        </span>
      </div>

      {/* Score bar */}
      <div className="mt-2">
        <ColorBar score={categoryScore.score} />
      </div>

      {/* Summary */}
      <p className="mt-2 text-sm text-muted">{categoryScore.summary}</p>

      {/* Expandable details */}
      <div className="mt-1">
        <ExpandableSection title="What this means">
          <p className="text-sm text-muted">{categoryScore.details}</p>

          {categoryScore.benchmarkResults.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
                Benchmarks Used
              </p>
              <div className="space-y-1">
                {categoryScore.benchmarkResults.map((br) => (
                  <div
                    key={br.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <a
                      href={br.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-700 underline decoration-green-300 underline-offset-2 hover:text-green-600 dark:text-green-400 dark:decoration-green-700"
                    >
                      {br.name}
                    </a>
                    <span className="font-medium tabular-nums">
                      {br.score}/{br.maxScore}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ExpandableSection>
      </div>
    </div>
  );
}
