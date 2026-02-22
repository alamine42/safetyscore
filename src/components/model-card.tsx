import Link from "next/link";
import Image from "next/image";
import type { ModelInfo } from "@/types/model";
import { ScoreRing } from "@/components/ui/score-ring";
import { LetterGradeBadge } from "@/components/ui/letter-grade";
import { BarChartMini } from "@/components/ui/bar-chart-mini";
import { formatDateShort } from "@/lib/utils";

type ModelCardProps = {
  model: ModelInfo;
  childSafetyGrade?: string;
};

export function ModelCard({ model, childSafetyGrade }: ModelCardProps) {
  return (
    <Link
      href={`/model/${model.slug}`}
      className="group flex flex-col rounded-xl border border-card-border bg-card-bg p-5 transition-all hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={model.provider.logo}
            alt={model.provider.name}
            width={32}
            height={32}
            className="rounded-md"
          />
          <div>
            <h3 className="font-semibold leading-tight group-hover:text-green-600 dark:group-hover:text-green-400">
              {model.name}
            </h3>
            <p className="text-sm text-muted">{model.provider.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {childSafetyGrade && (
            <span
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              title={`Child Safety: ${childSafetyGrade}`}
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                />
              </svg>
              {childSafetyGrade}
            </span>
          )}
          <LetterGradeBadge grade={model.overallGrade} size="sm" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <ScoreRing score={model.overallScore} size="md" showGrade />
      </div>

      <div className="mt-4">
        <BarChartMini categories={model.categoryScores} />
      </div>

      <p className="mt-3 text-xs text-muted">
        Evaluated {formatDateShort(model.evaluatedDate)}
      </p>
    </Link>
  );
}
