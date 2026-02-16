import Image from "next/image";
import type { ModelInfo, SafetyCategory } from "@/types/model";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/constants";
import { scoreToGrade } from "@/lib/scores";
import { ScoreRing } from "@/components/ui/score-ring";

type ComparisonViewProps = {
  modelA: ModelInfo;
  modelB: ModelInfo;
};

function DiffIndicator({ diff }: { diff: number }) {
  if (diff === 0) {
    return (
      <span className="text-xs font-medium text-muted">TIE</span>
    );
  }

  const isPositive = diff > 0;
  return (
    <span
      className={`text-xs font-bold ${
        isPositive
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {isPositive ? "+" : ""}{diff}
    </span>
  );
}

function WinnerBadge({ winner }: { winner: "a" | "b" | "tie" }) {
  if (winner === "tie") return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
      <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      Better
    </span>
  );
}

function CategoryRow({
  category,
  scoreA,
  scoreB,
}: {
  category: SafetyCategory;
  scoreA: number;
  scoreB: number;
}) {
  const meta = CATEGORY_META[category];
  const diff = scoreA - scoreB;
  const winner: "a" | "b" | "tie" = diff > 0 ? "a" : diff < 0 ? "b" : "tie";

  return (
    <div className="grid grid-cols-[1fr_2fr_1fr] items-center gap-4 border-b border-card-border py-4 last:border-0">
      {/* Model A Score */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{scoreA}</span>
          {winner === "a" && <WinnerBadge winner="a" />}
        </div>
        <span className="text-xs text-muted">{scoreToGrade(scoreA)}</span>
      </div>

      {/* Category Info */}
      <div className="flex flex-col items-center text-center">
        <span className="font-semibold">{meta.label}</span>
        <span className="text-sm text-muted">{meta.question}</span>
        <div className="mt-2">
          <DiffIndicator diff={diff} />
        </div>
      </div>

      {/* Model B Score */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          {winner === "b" && <WinnerBadge winner="b" />}
          <span className="text-2xl font-bold">{scoreB}</span>
        </div>
        <span className="text-xs text-muted">{scoreToGrade(scoreB)}</span>
      </div>
    </div>
  );
}

export function ComparisonView({ modelA, modelB }: ComparisonViewProps) {
  const overallDiff = modelA.overallScore - modelB.overallScore;
  const overallWinner: "a" | "b" | "tie" =
    overallDiff > 0 ? "a" : overallDiff < 0 ? "b" : "tie";

  // Count category wins
  let winsA = 0;
  let winsB = 0;
  for (const cat of CATEGORY_ORDER) {
    const diff = modelA.categoryScores[cat] - modelB.categoryScores[cat];
    if (diff > 0) winsA++;
    else if (diff < 0) winsB++;
  }

  return (
    <div className="rounded-xl border border-card-border bg-card shadow-sm">
      {/* Header with overall scores */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-card-border p-6">
        {/* Model A */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Image
              src={modelA.provider.logo}
              alt={modelA.provider.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h2 className="font-bold">{modelA.name}</h2>
              <p className="text-sm text-muted">{modelA.provider.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ScoreRing score={modelA.overallScore} size="lg" showGrade />
            {overallWinner === "a" && <WinnerBadge winner="a" />}
          </div>
        </div>

        {/* VS divider */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl font-bold text-muted">VS</span>
          <div className="text-center text-sm text-muted">
            <span className="font-medium text-green-600 dark:text-green-400">{winsA}</span>
            {" - "}
            <span className="font-medium text-green-600 dark:text-green-400">{winsB}</span>
          </div>
        </div>

        {/* Model B */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <Image
              src={modelB.provider.logo}
              alt={modelB.provider.name}
              width={32}
              height={32}
              className="rounded-lg"
            />
            <div>
              <h2 className="font-bold">{modelB.name}</h2>
              <p className="text-sm text-muted">{modelB.provider.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {overallWinner === "b" && <WinnerBadge winner="b" />}
            <ScoreRing score={modelB.overallScore} size="lg" showGrade />
          </div>
        </div>
      </div>

      {/* Category comparison rows */}
      <div className="p-6">
        <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-muted">
          Category Breakdown
        </h3>
        {CATEGORY_ORDER.map((category) => (
          <CategoryRow
            key={category}
            category={category}
            scoreA={modelA.categoryScores[category]}
            scoreB={modelB.categoryScores[category]}
          />
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-card-border bg-muted-bg/50 p-6 text-center">
        {overallWinner === "tie" ? (
          <p className="text-muted">
            Both models have the same overall safety score.
          </p>
        ) : (
          <p className="text-muted">
            <span className="font-semibold text-foreground">
              {overallWinner === "a" ? modelA.name : modelB.name}
            </span>{" "}
            scores{" "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              {Math.abs(overallDiff)} points higher
            </span>{" "}
            overall and wins in{" "}
            <span className="font-semibold">
              {overallWinner === "a" ? winsA : winsB} of 6
            </span>{" "}
            categories.
          </p>
        )}
      </div>
    </div>
  );
}
