import type { Metadata } from "next";
import Link from "next/link";
import { getAllModels } from "@/lib/data";
import { QuizFlow } from "./_components/quiz-flow";

export const metadata: Metadata = {
  title: "Which AI Should I Use?",
  description:
    "Take our quick 3-question quiz to find the AI model that best matches your safety priorities.",
};

export default async function QuizPage() {
  const models = await getAllModels();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
              clipRule="evenodd"
            />
          </svg>
          3 Quick Questions
        </div>
        <h1 className="text-3xl font-bold sm:text-4xl">
          Which AI Should{" "}
          <span className="text-green-600 dark:text-green-400">You</span> Use?
        </h1>
        <p className="mt-3 text-lg text-muted">
          Answer 3 simple questions and we&apos;ll recommend the safest AI for your needs.
        </p>
      </div>

      {/* Quiz */}
      <div className="rounded-2xl border border-card-border bg-card p-6 shadow-sm sm:p-8">
        <QuizFlow models={models} />
      </div>

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
