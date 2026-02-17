"use client";

import { useState } from "react";
import type { HistoricalScore, SafetyCategory } from "@/types/model";

const CATEGORY_LABELS: Record<SafetyCategory, string> = {
  honesty: "Honesty",
  fairness: "Fairness",
  refusal_to_harm: "Refusal to Harm",
  manipulation_resistance: "Manipulation Resistance",
  privacy_respect: "Privacy Respect",
  straight_talk: "Straight Talk",
};

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getBarColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  return "bg-red-500";
}

type Props = {
  history: HistoricalScore[];
  currentVersion: string;
};

export function VersionHistory({ history, currentVersion }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<"overall" | SafetyCategory>("overall");

  if (history.length < 2) {
    return null;
  }

  const categories: Array<"overall" | SafetyCategory> = [
    "overall",
    "honesty",
    "fairness",
    "refusal_to_harm",
    "manipulation_resistance",
    "privacy_respect",
    "straight_talk",
  ];

  const getScore = (entry: HistoricalScore, category: "overall" | SafetyCategory): number => {
    if (category === "overall") return entry.overallScore;
    return entry.categoryScores[category] ?? 0;
  };

  const maxScore = Math.max(...history.map((h) => getScore(h, selectedCategory)));
  const minScore = Math.min(...history.map((h) => getScore(h, selectedCategory)));
  const range = Math.max(maxScore - minScore, 10);

  // Calculate score change from first to last
  const firstScore = getScore(history[0], selectedCategory);
  const lastScore = getScore(history[history.length - 1], selectedCategory);
  const change = lastScore - firstScore;

  return (
    <div className="mt-8 rounded-xl border border-card-border bg-card-bg p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version History</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">Change:</span>
          <span
            className={
              change > 0
                ? "font-semibold text-green-600 dark:text-green-400"
                : change < 0
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : "text-muted"
            }
          >
            {change > 0 ? "+" : ""}
            {change} pts
          </span>
        </div>
      </div>

      {/* Category selector */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-muted-bg text-muted hover:text-foreground"
            }`}
          >
            {cat === "overall" ? "Overall" : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Timeline chart */}
      <div className="space-y-3">
        {history.map((entry, index) => {
          const score = getScore(entry, selectedCategory);
          const barWidth = ((score - (minScore - 5)) / (range + 10)) * 100;
          const isLatest = index === history.length - 1;

          return (
            <div key={entry.version} className="flex items-center gap-4">
              <div className="w-32 flex-shrink-0 text-right">
                <div
                  className={`text-sm font-medium ${isLatest ? "text-foreground" : "text-muted"}`}
                >
                  {entry.version}
                </div>
                <div className="text-xs text-muted">
                  {new Date(entry.evaluatedDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="relative flex-1">
                <div className="h-8 overflow-hidden rounded-lg bg-muted-bg">
                  <div
                    className={`h-full rounded-lg transition-all duration-500 ${getBarColor(score)} ${
                      isLatest ? "opacity-100" : "opacity-60"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>

              <div
                className={`w-12 text-right text-lg font-bold ${getScoreColor(score)} ${
                  isLatest ? "" : "opacity-70"
                }`}
              >
                {score}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted">
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>80+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-yellow-500" />
          <span>60-79</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-red-500" />
          <span>&lt;60</span>
        </div>
      </div>
    </div>
  );
}
