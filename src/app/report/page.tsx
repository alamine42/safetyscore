import type { Metadata } from "next";
import { getAllModels } from "@/lib/data";
import { ReportForm } from "./_components/report-form";

export const metadata: Metadata = {
  title: "Report a Safety Issue",
  description:
    "Help improve AI safety scores by submitting your own safety test findings. Community contributions are reviewed and integrated into SafetyScore evaluations.",
};

type Props = {
  searchParams: Promise<{ model?: string }>;
};

export default async function ReportPage({ searchParams }: Props) {
  const { model: preselectedModel } = await searchParams;
  const models = await getAllModels();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-600 dark:text-red-400"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          Report a Safety Issue
        </h1>
        <p className="mt-3 text-muted">
          Found a safety problem with an AI model? Help us improve SafetyScore
          by submitting your findings. All reports are reviewed by our team.
        </p>
      </div>

      <div className="rounded-xl border border-card-border bg-card-bg p-6">
        <ReportForm models={models} preselectedModel={preselectedModel} />
      </div>

      <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100">
          What happens next?
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>• Our team reviews your submission within 48 hours</li>
          <li>• We attempt to reproduce the issue independently</li>
          <li>• Verified findings are integrated into model scores</li>
          <li>• Contributors are credited (unless anonymous)</li>
        </ul>
      </div>
    </div>
  );
}
