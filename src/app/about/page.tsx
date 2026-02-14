import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How SafetyScore evaluates AI models. Learn about our benchmarks, scoring methodology, and limitations.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Methodology
      </h1>
      <p className="mt-4 text-lg text-muted">
        How we evaluate AI models and what the scores mean.
      </p>

      {/* What is SafetyScore */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">What is SafetyScore?</h2>
        <p className="mt-3 text-muted">
          SafetyScore translates complex AI safety research into simple,
          consumer-friendly ratings. We take publicly available benchmarks that
          researchers use to evaluate AI models and present them in a format
          anyone can understand — like a nutrition label for AI safety.
        </p>
        <p className="mt-3 text-muted">
          Our goal is to help everyday people make informed decisions about which
          AI tools they use, without needing a PhD in machine learning.
        </p>
      </section>

      {/* How scores are calculated */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">How Scores Are Calculated</h2>
        <p className="mt-3 text-muted">
          Each model is evaluated across six safety categories. Scores range from
          0 to 100, where higher is better. The overall score is a weighted
          average of all category scores.
        </p>

        <div className="mt-6 overflow-hidden rounded-lg border border-card-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border bg-muted-bg">
                <th className="px-4 py-3 text-left font-semibold">Score Range</th>
                <th className="px-4 py-3 text-left font-semibold">Grade</th>
                <th className="px-4 py-3 text-left font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-card-border">
                <td className="px-4 py-3">90 &ndash; 100</td>
                <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">A range</td>
                <td className="px-4 py-3 text-muted">Excellent safety performance</td>
              </tr>
              <tr className="border-b border-card-border">
                <td className="px-4 py-3">80 &ndash; 89</td>
                <td className="px-4 py-3 font-semibold text-green-700 dark:text-green-400">B range</td>
                <td className="px-4 py-3 text-muted">Good, with minor areas to improve</td>
              </tr>
              <tr className="border-b border-card-border">
                <td className="px-4 py-3">70 &ndash; 79</td>
                <td className="px-4 py-3 font-semibold text-yellow-700 dark:text-yellow-400">C range</td>
                <td className="px-4 py-3 text-muted">Adequate but notable weaknesses</td>
              </tr>
              <tr className="border-b border-card-border">
                <td className="px-4 py-3">60 &ndash; 69</td>
                <td className="px-4 py-3 font-semibold text-yellow-700 dark:text-yellow-400">D range</td>
                <td className="px-4 py-3 text-muted">Below average, significant concerns</td>
              </tr>
              <tr>
                <td className="px-4 py-3">0 &ndash; 59</td>
                <td className="px-4 py-3 font-semibold text-red-700 dark:text-red-400">F</td>
                <td className="px-4 py-3 text-muted">Poor safety performance</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* The Six Categories */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">The Six Safety Categories</h2>
        <div className="mt-6 space-y-6">
          <CategoryExplainer
            label="Honesty"
            question="Does it make stuff up?"
            benchmarks={["TruthfulQA", "HaluEval"]}
            description="Measures how often the model generates false or unverifiable claims. A high score means the model sticks to what it actually knows and admits when it's uncertain."
          />
          <CategoryExplainer
            label="Fairness"
            question="Does it treat people differently?"
            benchmarks={["BBQ", "WinoBias"]}
            description="Evaluates whether the model shows bias based on race, gender, age, or other characteristics. A high score means it treats everyone more equally."
          />
          <CategoryExplainer
            label="Refusal to Harm"
            question="Can you trick it into saying dangerous things?"
            benchmarks={["HarmBench", "AdvBench"]}
            description="Tests whether the model can be manipulated into generating harmful, dangerous, or illegal content. A high score means it's harder to trick."
          />
          <CategoryExplainer
            label="Manipulation Resistance"
            question="Does it try to manipulate you?"
            benchmarks={["MACHIAVELLI"]}
            description="Assesses whether the model attempts to manipulate user decisions or emotions. A high score means it plays fair and presents balanced information."
          />
          <CategoryExplainer
            label="Privacy Respect"
            question="Does it leak personal info?"
            benchmarks={["PrivacyBench", "PII Leakage Test"]}
            description="Checks if the model memorizes and reveals personal information from its training data. A high score means it keeps private info private."
          />
          <CategoryExplainer
            label="Straight Talk"
            question="Does it just tell you what you want to hear?"
            benchmarks={["Sycophancy Eval", "TruthfulQA (sycophancy subset)"]}
            description="Measures whether the model agrees with incorrect premises just to please you. A high score means it'll respectfully push back when you're wrong."
          />
        </div>
      </section>

      {/* Limitations */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">Limitations</h2>
        <ul className="mt-4 space-y-3 text-muted">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
            <span>
              <strong className="text-foreground">Benchmarks are imperfect.</strong>{" "}
              No benchmark perfectly captures real-world safety. Models can perform
              well on tests while still having issues in practice.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
            <span>
              <strong className="text-foreground">Scores are approximations.</strong>{" "}
              We normalize and aggregate scores from multiple sources, which
              introduces some imprecision.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
            <span>
              <strong className="text-foreground">Models change over time.</strong>{" "}
              AI companies regularly update their models. A score from one evaluation
              may not reflect the current version.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
            <span>
              <strong className="text-foreground">Not all risks are covered.</strong>{" "}
              These six categories don&apos;t capture every possible safety concern.
              New risks emerge as AI capabilities expand.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-muted" />
            <span>
              <strong className="text-foreground">Independence matters.</strong>{" "}
              SafetyScore is not funded by or affiliated with any AI company. We
              strive for objectivity but welcome scrutiny of our methods.
            </span>
          </li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="mt-6 space-y-6">
          <FaqItem
            question="Where does the data come from?"
            answer="We aggregate publicly available benchmark results from academic papers, model cards, and safety reports published by AI companies and independent researchers."
          />
          <FaqItem
            question="How often are scores updated?"
            answer="We update scores when major new models are released or when significant new benchmark data becomes available. Each model page shows when it was last evaluated."
          />
          <FaqItem
            question="Can I trust these scores?"
            answer="Our scores are a useful starting point for understanding relative safety differences between models, but they shouldn't be your only source of information. We publish our methodology transparently so you can judge for yourself."
          />
          <FaqItem
            question="Why doesn't my favorite model have a score?"
            answer="We currently focus on the most widely-used consumer-facing models. We plan to expand coverage over time."
          />
        </div>
      </section>

      <div className="mt-12 text-center">
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

function CategoryExplainer({
  label,
  question,
  benchmarks,
  description,
}: {
  label: string;
  question: string;
  benchmarks: string[];
  description: string;
}) {
  return (
    <div className="rounded-lg border border-card-border bg-card-bg p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="text-sm italic text-muted">&ldquo;{question}&rdquo;</p>
      <p className="mt-2 text-sm text-muted">{description}</p>
      <p className="mt-2 text-xs text-muted">
        <span className="font-semibold">Benchmarks:</span>{" "}
        {benchmarks.join(", ")}
      </p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div>
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-1 text-sm text-muted">{answer}</p>
    </div>
  );
}
