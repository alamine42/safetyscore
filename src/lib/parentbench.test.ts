import { describe, it, expect } from "vitest";
import {
  getParentBenchScores,
  getParentBenchScoreBySlug,
  getParentBenchMethodology,
  getParentBenchTestCases,
  computeParentBenchRank,
  getParentBenchModelCount,
  getParentBenchLastUpdated,
} from "./parentbench";
import { getAllModels } from "./data";
import { parentBenchCategories } from "@/types/parentbench";

describe("getParentBenchScores", () => {
  it("returns an array of results", async () => {
    const scores = await getParentBenchScores();
    expect(Array.isArray(scores)).toBe(true);
    expect(scores.length).toBeGreaterThan(0);
  });

  it("returns results sorted by overallScore descending", async () => {
    const scores = await getParentBenchScores();
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1].overallScore).toBeGreaterThanOrEqual(scores[i].overallScore);
    }
  });

  it("each result has required fields", async () => {
    const scores = await getParentBenchScores();
    for (const score of scores) {
      expect(score.modelSlug).toBeDefined();
      expect(typeof score.modelSlug).toBe("string");
      expect(score.overallScore).toBeDefined();
      expect(typeof score.overallScore).toBe("number");
      expect(score.overallGrade).toBeDefined();
      expect(score.categoryScores).toBeDefined();
      expect(Array.isArray(score.categoryScores)).toBe(true);
    }
  });

  it("all scores are in valid 0-100 range", async () => {
    const scores = await getParentBenchScores();
    for (const score of scores) {
      expect(score.overallScore).toBeGreaterThanOrEqual(0);
      expect(score.overallScore).toBeLessThanOrEqual(100);
      for (const cat of score.categoryScores) {
        expect(cat.score).toBeGreaterThanOrEqual(0);
        expect(cat.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it("each result has all 4 category scores", async () => {
    const scores = await getParentBenchScores();
    for (const score of scores) {
      expect(score.categoryScores.length).toBe(4);
      const categories = score.categoryScores.map((c) => c.category);
      for (const expected of parentBenchCategories) {
        expect(categories).toContain(expected);
      }
    }
  });
});

describe("getParentBenchScoreBySlug", () => {
  it("returns correct model for valid slug", async () => {
    const result = await getParentBenchScoreBySlug("claude-opus-4-6");
    expect(result).not.toBeNull();
    expect(result?.modelSlug).toBe("claude-opus-4-6");
  });

  it("returns null for invalid slug", async () => {
    const result = await getParentBenchScoreBySlug("nonexistent-model-xyz");
    expect(result).toBeNull();
  });

  it("returns null for empty slug", async () => {
    const result = await getParentBenchScoreBySlug("");
    expect(result).toBeNull();
  });
});

describe("computeParentBenchRank", () => {
  it("returns 1 for highest-scoring model", async () => {
    const scores = await getParentBenchScores();
    const topModel = scores[0].modelSlug;
    const rank = await computeParentBenchRank(topModel);
    expect(rank).toBe(1);
  });

  it("returns correct rank for last model", async () => {
    const scores = await getParentBenchScores();
    const lastModel = scores[scores.length - 1].modelSlug;
    const rank = await computeParentBenchRank(lastModel);
    expect(rank).toBe(scores.length);
  });

  it("returns null for invalid slug", async () => {
    const rank = await computeParentBenchRank("nonexistent-model-xyz");
    expect(rank).toBeNull();
  });

  it("ranks are consistent with sorted order", async () => {
    const scores = await getParentBenchScores();
    for (let i = 0; i < scores.length; i++) {
      const rank = await computeParentBenchRank(scores[i].modelSlug);
      expect(rank).toBe(i + 1);
    }
  });
});

describe("getParentBenchModelCount", () => {
  it("returns correct count matching scores array length", async () => {
    const count = await getParentBenchModelCount();
    const scores = await getParentBenchScores();
    expect(count).toBe(scores.length);
  });

  it("returns a positive number", async () => {
    const count = await getParentBenchModelCount();
    expect(count).toBeGreaterThan(0);
  });
});

describe("getParentBenchMethodology", () => {
  it("returns methodology with required fields", async () => {
    const methodology = await getParentBenchMethodology();
    expect(methodology.version).toBeDefined();
    expect(methodology.name).toBeDefined();
    expect(methodology.description).toBeDefined();
    expect(methodology.categoryWeights).toBeDefined();
    expect(methodology.testCaseCounts).toBeDefined();
    expect(methodology.scoringApproach).toBeDefined();
    expect(methodology.limitations).toBeDefined();
    expect(methodology.lastUpdated).toBeDefined();
  });

  it("category weights sum to 1.0", async () => {
    const methodology = await getParentBenchMethodology();
    const sum = Object.values(methodology.categoryWeights).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2);
  });

  it("has weights for all 4 categories", async () => {
    const methodology = await getParentBenchMethodology();
    for (const cat of parentBenchCategories) {
      expect(methodology.categoryWeights[cat]).toBeDefined();
      expect(methodology.categoryWeights[cat]).toBeGreaterThan(0);
    }
  });

  it("test case counts are positive", async () => {
    const methodology = await getParentBenchMethodology();
    for (const cat of parentBenchCategories) {
      expect(methodology.testCaseCounts[cat]).toBeGreaterThan(0);
    }
  });
});

describe("getParentBenchTestCases", () => {
  it("returns an array of test cases", async () => {
    const testCases = await getParentBenchTestCases();
    expect(Array.isArray(testCases)).toBe(true);
    expect(testCases.length).toBeGreaterThan(0);
  });

  it("each test case has required fields", async () => {
    const testCases = await getParentBenchTestCases();
    for (const tc of testCases) {
      expect(tc.id).toBeDefined();
      expect(tc.category).toBeDefined();
      expect(tc.prompt).toBeDefined();
      expect(tc.expectedBehavior).toBeDefined();
      expect(tc.severity).toBeDefined();
      expect(tc.description).toBeDefined();
    }
  });

  it("all test cases have valid categories", async () => {
    const testCases = await getParentBenchTestCases();
    for (const tc of testCases) {
      expect(parentBenchCategories).toContain(tc.category);
    }
  });

  it("test case count matches methodology counts", async () => {
    const testCases = await getParentBenchTestCases();
    const methodology = await getParentBenchMethodology();

    const countByCategory: Record<string, number> = {};
    for (const tc of testCases) {
      countByCategory[tc.category] = (countByCategory[tc.category] || 0) + 1;
    }

    for (const cat of parentBenchCategories) {
      expect(countByCategory[cat]).toBe(methodology.testCaseCounts[cat]);
    }
  });
});

describe("getParentBenchLastUpdated", () => {
  it("returns a valid date string", async () => {
    const lastUpdated = await getParentBenchLastUpdated();
    expect(lastUpdated).toBeDefined();
    expect(typeof lastUpdated).toBe("string");
    // Should be in YYYY-MM-DD format
    expect(lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("ParentBench data consistency", () => {
  it("all models in models.json have ParentBench entries", async () => {
    const allModels = await getAllModels();
    const parentBenchScores = await getParentBenchScores();
    const parentBenchSlugs = new Set(parentBenchScores.map((s) => s.modelSlug));

    for (const model of allModels) {
      expect(parentBenchSlugs.has(model.slug)).toBe(true);
    }
  });

  it("grade is consistent with score thresholds", async () => {
    const scores = await getParentBenchScores();
    for (const score of scores) {
      const s = score.overallScore;
      const g = score.overallGrade;

      if (s >= 97) expect(g).toBe("A+");
      else if (s >= 93) expect(g).toBe("A");
      else if (s >= 90) expect(g).toBe("A-");
      else if (s >= 87) expect(g).toBe("B+");
      else if (s >= 83) expect(g).toBe("B");
      else if (s >= 80) expect(g).toBe("B-");
      else if (s >= 77) expect(g).toBe("C+");
      else if (s >= 73) expect(g).toBe("C");
      else if (s >= 70) expect(g).toBe("C-");
      else if (s >= 67) expect(g).toBe("D+");
      else if (s >= 63) expect(g).toBe("D");
      else if (s >= 60) expect(g).toBe("D-");
      else expect(g).toBe("F");
    }
  });
});
