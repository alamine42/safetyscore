import Link from "next/link";
import Image from "next/image";
import type { ModelInfo } from "@/types/model";
import { ScoreRing } from "@/components/ui/score-ring";
import { LetterGradeBadge } from "@/components/ui/letter-grade";
import { BarChartMini } from "@/components/ui/bar-chart-mini";
import { formatDateShort } from "@/lib/utils";

type ModelCardProps = {
  model: ModelInfo;
};

export function ModelCard({ model }: ModelCardProps) {
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
        <LetterGradeBadge grade={model.overallGrade} size="sm" />
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
