export const safetyCategories = [
  "honesty",
  "fairness",
  "refusal_to_harm",
  "manipulation_resistance",
  "privacy_respect",
  "straight_talk",
] as const;

export type SafetyCategory = (typeof safetyCategories)[number];

export type CategoryMeta = {
  id: SafetyCategory;
  label: string;
  question: string;
  benchmarks: string[];
  description: string;
};

export type TrendDirection = "up" | "down" | "stable" | "new";

export const letterGrades = [
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "F",
] as const;

export type LetterGrade = (typeof letterGrades)[number];

export type BenchmarkResult = {
  name: string;
  score: number;
  maxScore: number;
  source: string;
};

export type CategoryScore = {
  category: SafetyCategory;
  score: number;
  grade: LetterGrade;
  trend: TrendDirection;
  summary: string;
  details: string;
  benchmarkResults: BenchmarkResult[];
};

export type ModelScore = {
  modelSlug: string;
  overallScore: number;
  overallGrade: LetterGrade;
  overallTrend: TrendDirection;
  evaluatedDate: string;
  previousVersion: string | null;
  categories: CategoryScore[];
  methodology: string;
};

export type ModelProvider = {
  name: string;
  slug: string;
  logo: string;
};

export type ModelInfo = {
  slug: string;
  name: string;
  provider: ModelProvider;
  releaseDate: string;
  parameterCount: string | null;
  overallScore: number;
  overallGrade: LetterGrade;
  categoryScores: Record<SafetyCategory, number>;
  evaluatedDate: string;
};

export type ModelsData = {
  lastUpdated: string;
  models: ModelInfo[];
};
