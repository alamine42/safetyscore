import type { Metadata } from "next";
import Link from "next/link";
import { getParentBenchTestCases, getParentBenchMethodology } from "@/lib/parentbench";
import { PARENTBENCH_CATEGORY_META, PARENTBENCH_CATEGORY_ORDER } from "@/lib/constants";
import type { ParentBenchCategory } from "@/types/parentbench";

export const metadata: Metadata = {
  title: "Test Cases - ParentBench",
  description:
    "Browse all ParentBench test cases with examples of good and bad AI responses for child safety evaluation.",
};

const severityColors = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

const behaviorLabels = {
  refuse: "Should Refuse",
  safe_response: "Safe Response Expected",
  redirect: "Should Redirect",
};

export default async function TestCasesPage() {
  const [testCases, methodology] = await Promise.all([
    getParentBenchTestCases(),
    getParentBenchMethodology(),
  ]);

  // Group test cases by category
  const testCasesByCategory = PARENTBENCH_CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = testCases.filter((tc) => tc.category === cat);
    return acc;
  }, {} as Record<ParentBenchCategory, typeof testCases>);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/parentbench"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to ParentBench
        </Link>
        <h1 className="text-3xl font-bold">Test Cases</h1>
        <p className="mt-2 text-muted">
          {testCases.length} test cases across {PARENTBENCH_CATEGORY_ORDER.length} categories.
          Each test case includes the prompt, expected behavior, and examples of good and bad responses.
        </p>
      </div>

      {/* Category sections */}
      {PARENTBENCH_CATEGORY_ORDER.map((cat) => {
        const meta = PARENTBENCH_CATEGORY_META[cat];
        const cases = testCasesByCategory[cat];
        const testCount = methodology.testCaseCounts[cat];

        return (
          <section key={cat} className="mb-12">
            <div className="sticky top-0 bg-background/95 backdrop-blur py-4 border-b border-card-border mb-6 z-10">
              <h2 className="text-xl font-bold">{meta.label}</h2>
              <p className="text-sm text-muted mt-1">{meta.description}</p>
              <p className="text-xs text-muted mt-1">{testCount} test cases</p>
            </div>

            <div className="space-y-6">
              {cases.map((tc) => (
                <div
                  key={tc.id}
                  className="rounded-lg border border-card-border bg-card-bg overflow-hidden"
                >
                  {/* Test case header */}
                  <div className="p-4 border-b border-card-border bg-muted-bg/30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${severityColors[tc.severity]}`}>
                        {tc.severity}
                      </span>
                      <span className="text-xs text-muted">
                        {behaviorLabels[tc.expectedBehavior]}
                      </span>
                      <span className="text-xs text-muted ml-auto font-mono">
                        {tc.id}
                      </span>
                    </div>
                    <p className="font-medium">&ldquo;{tc.prompt}&rdquo;</p>
                    <p className="text-sm text-muted mt-1">{tc.description}</p>
                  </div>

                  {/* Examples */}
                  {tc.examples && tc.examples.length > 0 && (
                    <div className="p-4 space-y-4">
                      {tc.examples.map((example, i) => (
                        <div key={i}>
                          <div className="flex items-center gap-2 mb-2">
                            {example.type === "good" ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 dark:text-green-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Good Response
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Bad Response
                              </span>
                            )}
                          </div>
                          <div className={`rounded-md p-3 text-sm ${
                            example.type === "good"
                              ? "bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800"
                              : "bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800"
                          }`}>
                            <p className="italic">&ldquo;{example.response}&rdquo;</p>
                          </div>
                          <p className="text-xs text-muted mt-1">{example.explanation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* No examples placeholder */}
                  {(!tc.examples || tc.examples.length === 0) && (
                    <div className="p-4 text-sm text-muted italic">
                      Examples coming soon
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
