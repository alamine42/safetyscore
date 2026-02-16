/**
 * Data Validation Script
 *
 * Checks consistency between models.json and individual score files.
 * Run with: npx tsx scripts/validate-data.ts
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const MODELS_FILE = path.join(DATA_DIR, "models.json");
const SCORES_DIR = path.join(DATA_DIR, "scores");

const SAFETY_CATEGORIES = [
  "honesty",
  "fairness",
  "refusal_to_harm",
  "manipulation_resistance",
  "privacy_respect",
  "straight_talk",
] as const;

const VALID_GRADES = [
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D+", "D", "D-",
  "F",
];

const VALID_TRENDS = ["up", "down", "stable", "new"];

type ValidationError = {
  type: "error" | "warning";
  model: string;
  message: string;
};

const errors: ValidationError[] = [];

function addError(model: string, message: string) {
  errors.push({ type: "error", model, message });
}

function addWarning(model: string, message: string) {
  errors.push({ type: "warning", model, message });
}

function scoreToExpectedGrade(score: number): string {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 67) return "D+";
  if (score >= 63) return "D";
  if (score >= 60) return "D-";
  return "F";
}

function validateModelsJson(data: unknown): data is { lastUpdated: string; models: unknown[] } {
  if (typeof data !== "object" || data === null) return false;
  const obj = data as Record<string, unknown>;
  if (typeof obj.lastUpdated !== "string") return false;
  if (!Array.isArray(obj.models)) return false;
  return true;
}

function validateModelEntry(model: unknown, index: number): model is Record<string, unknown> {
  if (typeof model !== "object" || model === null) {
    addError(`models[${index}]`, "Model entry is not an object");
    return false;
  }
  return true;
}

function validateScoreFile(data: unknown, slug: string): data is Record<string, unknown> {
  if (typeof data !== "object" || data === null) {
    addError(slug, "Score file is not a valid JSON object");
    return false;
  }
  return true;
}

async function main() {
  console.log("🔍 Validating SafetyScore data...\n");

  // Check if models.json exists
  if (!fs.existsSync(MODELS_FILE)) {
    console.error("❌ models.json not found at", MODELS_FILE);
    process.exit(1);
  }

  // Read and validate models.json
  const modelsRaw = fs.readFileSync(MODELS_FILE, "utf-8");
  let modelsData: unknown;
  try {
    modelsData = JSON.parse(modelsRaw);
  } catch {
    console.error("❌ models.json is not valid JSON");
    process.exit(1);
  }

  if (!validateModelsJson(modelsData)) {
    console.error("❌ models.json has invalid structure");
    process.exit(1);
  }

  console.log(`📁 Found ${modelsData.models.length} models in models.json\n`);

  // Track score files for orphan detection
  const referencedScoreFiles = new Set<string>();

  // Validate each model
  for (let i = 0; i < modelsData.models.length; i++) {
    const model = modelsData.models[i];
    if (!validateModelEntry(model, i)) continue;

    const slug = model.slug as string;
    if (!slug || typeof slug !== "string") {
      addError(`models[${i}]`, "Missing or invalid slug");
      continue;
    }

    console.log(`Checking ${slug}...`);

    // Required fields in models.json entry
    const requiredFields = [
      "name", "provider", "releaseDate", "overallScore",
      "overallGrade", "categoryScores", "evaluatedDate"
    ];
    for (const field of requiredFields) {
      if (!(field in model)) {
        addError(slug, `Missing required field: ${field}`);
      }
    }

    // Validate provider structure
    if (model.provider) {
      const provider = model.provider as Record<string, unknown>;
      if (!provider.name || !provider.slug || !provider.logo) {
        addError(slug, "Provider missing required fields (name, slug, logo)");
      }
      // Check if logo file exists
      if (provider.logo && typeof provider.logo === "string") {
        const logoPath = path.join(process.cwd(), "public", provider.logo);
        if (!fs.existsSync(logoPath)) {
          addError(slug, `Provider logo not found: ${provider.logo}`);
        }
      }
    }

    // Validate score is in valid range
    const overallScore = model.overallScore as number;
    if (typeof overallScore !== "number" || overallScore < 0 || overallScore > 100) {
      addError(slug, `Invalid overallScore: ${overallScore} (must be 0-100)`);
    }

    // Validate grade
    const overallGrade = model.overallGrade as string;
    if (!VALID_GRADES.includes(overallGrade)) {
      addError(slug, `Invalid overallGrade: ${overallGrade}`);
    }

    // Validate grade matches score
    const expectedGrade = scoreToExpectedGrade(overallScore);
    if (overallGrade !== expectedGrade) {
      addWarning(slug, `Grade mismatch: got ${overallGrade}, expected ${expectedGrade} for score ${overallScore}`);
    }

    // Validate categoryScores
    const categoryScores = model.categoryScores as Record<string, number>;
    if (categoryScores) {
      for (const cat of SAFETY_CATEGORIES) {
        if (!(cat in categoryScores)) {
          addError(slug, `Missing category score: ${cat}`);
        } else {
          const score = categoryScores[cat];
          if (typeof score !== "number" || score < 0 || score > 100) {
            addError(slug, `Invalid ${cat} score: ${score}`);
          }
        }
      }
      // Check for extra categories
      for (const cat of Object.keys(categoryScores)) {
        if (!SAFETY_CATEGORIES.includes(cat as typeof SAFETY_CATEGORIES[number])) {
          addWarning(slug, `Unknown category: ${cat}`);
        }
      }
    }

    // Check for corresponding score file
    const scoreFile = path.join(SCORES_DIR, `${slug}.json`);
    referencedScoreFiles.add(`${slug}.json`);

    if (!fs.existsSync(scoreFile)) {
      addError(slug, `Score file not found: scores/${slug}.json`);
      continue;
    }

    // Read and validate score file
    let scoreData: unknown;
    try {
      const scoreRaw = fs.readFileSync(scoreFile, "utf-8");
      scoreData = JSON.parse(scoreRaw);
    } catch {
      addError(slug, `Score file is not valid JSON: scores/${slug}.json`);
      continue;
    }

    if (!validateScoreFile(scoreData, slug)) continue;

    // Validate score file structure
    const scoreFile_ = scoreData as Record<string, unknown>;

    // Check slug matches
    if (scoreFile_.modelSlug !== slug) {
      addError(slug, `Score file modelSlug mismatch: ${scoreFile_.modelSlug} !== ${slug}`);
    }

    // Check overall score matches
    if (scoreFile_.overallScore !== overallScore) {
      addError(slug, `Overall score mismatch: models.json=${overallScore}, score file=${scoreFile_.overallScore}`);
    }

    // Check overall grade matches
    if (scoreFile_.overallGrade !== overallGrade) {
      addError(slug, `Overall grade mismatch: models.json=${overallGrade}, score file=${scoreFile_.overallGrade}`);
    }

    // Validate trend
    if (scoreFile_.overallTrend && !VALID_TRENDS.includes(scoreFile_.overallTrend as string)) {
      addError(slug, `Invalid overallTrend: ${scoreFile_.overallTrend}`);
    }

    // Validate categories array
    const categories = scoreFile_.categories as unknown[];
    if (!Array.isArray(categories)) {
      addError(slug, "Score file missing categories array");
      continue;
    }

    if (categories.length !== SAFETY_CATEGORIES.length) {
      addWarning(slug, `Expected ${SAFETY_CATEGORIES.length} categories, got ${categories.length}`);
    }

    // Validate each category in score file
    for (const cat of categories) {
      const catObj = cat as Record<string, unknown>;
      const catName = catObj.category as string;

      if (!SAFETY_CATEGORIES.includes(catName as typeof SAFETY_CATEGORIES[number])) {
        addError(slug, `Unknown category in score file: ${catName}`);
        continue;
      }

      // Check score matches models.json
      const catScore = catObj.score as number;
      if (categoryScores && categoryScores[catName] !== catScore) {
        addError(slug, `Category ${catName} score mismatch: models.json=${categoryScores[catName]}, score file=${catScore}`);
      }

      // Validate category grade
      if (!VALID_GRADES.includes(catObj.grade as string)) {
        addError(slug, `Invalid grade for ${catName}: ${catObj.grade}`);
      }

      // Validate category trend
      if (!VALID_TRENDS.includes(catObj.trend as string)) {
        addError(slug, `Invalid trend for ${catName}: ${catObj.trend}`);
      }

      // Check required fields
      if (!catObj.summary || typeof catObj.summary !== "string") {
        addWarning(slug, `Category ${catName} missing summary`);
      }
      if (!catObj.details || typeof catObj.details !== "string") {
        addWarning(slug, `Category ${catName} missing details`);
      }

      // Validate benchmark results
      const benchmarks = catObj.benchmarkResults as unknown[];
      if (!Array.isArray(benchmarks) || benchmarks.length === 0) {
        addWarning(slug, `Category ${catName} has no benchmark results`);
      } else {
        for (const bench of benchmarks) {
          const benchObj = bench as Record<string, unknown>;
          if (!benchObj.name || !benchObj.score || !benchObj.maxScore || !benchObj.source) {
            addWarning(slug, `Category ${catName} has incomplete benchmark result`);
          }
        }
      }
    }
  }

  // Check for orphan score files
  const scoreFiles = fs.readdirSync(SCORES_DIR).filter(f => f.endsWith(".json"));
  for (const file of scoreFiles) {
    if (!referencedScoreFiles.has(file)) {
      addWarning("(orphan)", `Score file not referenced in models.json: ${file}`);
    }
  }

  // Report results
  console.log("\n" + "=".repeat(50) + "\n");

  const errorCount = errors.filter(e => e.type === "error").length;
  const warningCount = errors.filter(e => e.type === "warning").length;

  if (errors.length === 0) {
    console.log("✅ All data is valid! No issues found.\n");
  } else {
    if (errorCount > 0) {
      console.log(`❌ Errors (${errorCount}):\n`);
      for (const err of errors.filter(e => e.type === "error")) {
        console.log(`  [${err.model}] ${err.message}`);
      }
      console.log();
    }

    if (warningCount > 0) {
      console.log(`⚠️  Warnings (${warningCount}):\n`);
      for (const warn of errors.filter(e => e.type === "warning")) {
        console.log(`  [${warn.model}] ${warn.message}`);
      }
      console.log();
    }
  }

  console.log(`Summary: ${modelsData.models.length} models, ${errorCount} errors, ${warningCount} warnings`);

  // Exit with error code if there are errors
  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch(console.error);
