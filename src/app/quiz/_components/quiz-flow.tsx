"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ModelInfo, SafetyCategory } from "@/types/model";
import { CATEGORY_META } from "@/lib/constants";
import { ScoreRing } from "@/components/ui/score-ring";

type QuizFlowProps = {
  models: ModelInfo[];
};

type Priority = SafetyCategory | "balanced";

const questions = [
  {
    id: 1,
    question: "What matters MOST to you in an AI assistant?",
    options: [
      {
        value: "honesty" as Priority,
        label: "Honesty",
        description: "I need accurate, truthful information — no making stuff up",
        icon: "🎯",
      },
      {
        value: "refusal_to_harm" as Priority,
        label: "Safety",
        description: "It should never help with anything dangerous or harmful",
        icon: "🛡️",
      },
      {
        value: "privacy_respect" as Priority,
        label: "Privacy",
        description: "I want my personal information kept confidential",
        icon: "🔒",
      },
      {
        value: "balanced" as Priority,
        label: "Balanced",
        description: "I want good performance across all areas",
        icon: "⚖️",
      },
    ],
  },
  {
    id: 2,
    question: "What's your SECOND priority?",
    options: [
      {
        value: "fairness" as Priority,
        label: "Fairness",
        description: "Treats everyone equally regardless of background",
        icon: "🤝",
      },
      {
        value: "straight_talk" as Priority,
        label: "Straight Talk",
        description: "Tells me when I'm wrong instead of just agreeing",
        icon: "💬",
      },
      {
        value: "manipulation_resistance" as Priority,
        label: "No Manipulation",
        description: "Won't try to influence my decisions sneakily",
        icon: "🚫",
      },
      {
        value: "balanced" as Priority,
        label: "Still Balanced",
        description: "All categories matter equally to me",
        icon: "⚖️",
      },
    ],
  },
  {
    id: 3,
    question: "How do you feel about AI caution vs. helpfulness?",
    options: [
      {
        value: "cautious",
        label: "Better Safe Than Sorry",
        description: "I'd rather it refuse borderline requests than risk harm",
        icon: "🔐",
      },
      {
        value: "moderate",
        label: "Reasonable Balance",
        description: "Smart judgment on when to help vs. when to refuse",
        icon: "🎚️",
      },
      {
        value: "helpful",
        label: "Maximize Helpfulness",
        description: "I'm a responsible adult, help me when possible",
        icon: "🚀",
      },
    ],
  },
];

function calculateRecommendation(
  models: ModelInfo[],
  answers: (string | null)[]
): ModelInfo[] {
  const [priority1, priority2, cautiousness] = answers;

  // Score each model based on user preferences
  const scored = models.map((model) => {
    let score = 0;

    // Weight primary priority heavily
    if (priority1 && priority1 !== "balanced") {
      const cat = priority1 as SafetyCategory;
      score += model.categoryScores[cat] * 3;
    } else {
      // Balanced: use overall score
      score += model.overallScore * 3;
    }

    // Weight secondary priority
    if (priority2 && priority2 !== "balanced") {
      const cat = priority2 as SafetyCategory;
      score += model.categoryScores[cat] * 2;
    } else {
      score += model.overallScore * 2;
    }

    // Adjust for cautiousness preference
    if (cautiousness === "cautious") {
      // Prefer models with high refusal_to_harm
      score += model.categoryScores.refusal_to_harm * 1.5;
    } else if (cautiousness === "helpful") {
      // Slightly penalize overly cautious models (lower straight_talk often means more cautious)
      score += model.categoryScores.straight_talk * 1.5;
    } else {
      // Moderate: balanced approach
      score += model.overallScore;
    }

    return { model, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.model);
}

function QuestionCard({
  question,
  options,
  selectedValue,
  onSelect,
}: {
  question: string;
  options: { value: string; label: string; description: string; icon: string }[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-center text-2xl font-bold">{question}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={`flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all ${
              selectedValue === option.value
                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-card-border hover:border-green-300 hover:bg-muted-bg/50"
            }`}
          >
            <span className="text-2xl">{option.icon}</span>
            <div>
              <div className="font-semibold">{option.label}</div>
              <div className="text-sm text-muted">{option.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ResultCard({ model, rank }: { model: ModelInfo; rank: number }) {
  const isTop = rank === 1;

  return (
    <div
      className={`rounded-xl border-2 p-6 ${
        isTop
          ? "border-green-500 bg-green-50/50 dark:bg-green-900/10"
          : "border-card-border"
      }`}
    >
      {isTop && (
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          Best Match
        </div>
      )}
      <div className="flex items-center gap-4">
        <Image
          src={model.provider.logo}
          alt={model.provider.name}
          width={48}
          height={48}
          className="rounded-xl"
        />
        <div className="flex-1">
          <h3 className="text-xl font-bold">{model.name}</h3>
          <p className="text-muted">{model.provider.name}</p>
        </div>
        <ScoreRing score={model.overallScore} size="md" showGrade />
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          href={`/model/${model.slug}`}
          className="text-sm font-medium text-green-700 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
        >
          View full scorecard →
        </Link>
      </div>
    </div>
  );
}

export function QuizFlow({ models }: QuizFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null, null]);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  function handleSelect(value: string) {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);
  }

  function handleNext() {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResults(true);
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }

  function handleRestart() {
    setCurrentStep(0);
    setAnswers([null, null, null]);
    setShowResults(false);
  }

  if (showResults) {
    const rankedModels = calculateRecommendation(models, answers);
    const topThree = rankedModels.slice(0, 3);

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Your Recommendations</h2>
          <p className="mt-2 text-muted">
            Based on your priorities, here are the best AI models for you
          </p>
        </div>

        <div className="space-y-4">
          {topThree.map((model, index) => (
            <ResultCard key={model.slug} model={model} rank={index + 1} />
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleRestart}
            className="rounded-lg border border-card-border px-6 py-2.5 font-medium transition-colors hover:bg-muted-bg"
          >
            Retake Quiz
          </button>
          <Link
            href={`/compare?a=${topThree[0].slug}&b=${topThree[1].slug}`}
            className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-700"
          >
            Compare Top 2
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted">
          <span>Question {currentStep + 1} of {questions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted-bg">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <QuestionCard
        question={currentQuestion.question}
        options={currentQuestion.options}
        selectedValue={answers[currentStep]}
        onSelect={handleSelect}
      />

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="rounded-lg border border-card-border px-6 py-2.5 font-medium transition-colors hover:bg-muted-bg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={answers[currentStep] === null}
          className="rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentStep === questions.length - 1 ? "See Results" : "Next"}
        </button>
      </div>
    </div>
  );
}
