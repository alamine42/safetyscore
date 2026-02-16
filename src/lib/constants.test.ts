import { describe, it, expect } from "vitest";
import { CATEGORY_META, GRADE_THRESHOLDS, CATEGORY_ORDER } from "./constants";

describe("CATEGORY_META", () => {
  it("has all 6 safety categories defined", () => {
    expect(Object.keys(CATEGORY_META)).toHaveLength(6);
    expect(CATEGORY_META.honesty).toBeDefined();
    expect(CATEGORY_META.fairness).toBeDefined();
    expect(CATEGORY_META.refusal_to_harm).toBeDefined();
    expect(CATEGORY_META.manipulation_resistance).toBeDefined();
    expect(CATEGORY_META.privacy_respect).toBeDefined();
    expect(CATEGORY_META.straight_talk).toBeDefined();
  });

  it("each category has required fields", () => {
    for (const [key, meta] of Object.entries(CATEGORY_META)) {
      expect(meta.id).toBe(key);
      expect(meta.label).toBeTruthy();
      expect(meta.question).toBeTruthy();
      expect(meta.description).toBeTruthy();
      expect(Array.isArray(meta.benchmarks)).toBe(true);
      expect(meta.benchmarks.length).toBeGreaterThan(0);
    }
  });

  it("has human-readable labels", () => {
    expect(CATEGORY_META.honesty.label).toBe("Honesty");
    expect(CATEGORY_META.fairness.label).toBe("Fairness");
    expect(CATEGORY_META.refusal_to_harm.label).toBe("Refusal to Harm");
    expect(CATEGORY_META.manipulation_resistance.label).toBe("Manipulation Resistance");
    expect(CATEGORY_META.privacy_respect.label).toBe("Privacy Respect");
    expect(CATEGORY_META.straight_talk.label).toBe("Straight Talk");
  });

  it("has questions ending with ?", () => {
    for (const meta of Object.values(CATEGORY_META)) {
      expect(meta.question.endsWith("?")).toBe(true);
    }
  });
});

describe("GRADE_THRESHOLDS", () => {
  it("has 13 grade thresholds (A+ through F)", () => {
    expect(GRADE_THRESHOLDS).toHaveLength(13);
  });

  it("thresholds are sorted in descending order", () => {
    for (let i = 0; i < GRADE_THRESHOLDS.length - 1; i++) {
      expect(GRADE_THRESHOLDS[i].min).toBeGreaterThan(GRADE_THRESHOLDS[i + 1].min);
    }
  });

  it("has correct boundary values", () => {
    expect(GRADE_THRESHOLDS[0]).toEqual({ min: 97, grade: "A+" });
    expect(GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]).toEqual({ min: 0, grade: "F" });
  });

  it("covers all valid grades", () => {
    const grades = GRADE_THRESHOLDS.map((t) => t.grade);
    expect(grades).toContain("A+");
    expect(grades).toContain("A");
    expect(grades).toContain("A-");
    expect(grades).toContain("B+");
    expect(grades).toContain("B");
    expect(grades).toContain("B-");
    expect(grades).toContain("C+");
    expect(grades).toContain("C");
    expect(grades).toContain("C-");
    expect(grades).toContain("D+");
    expect(grades).toContain("D");
    expect(grades).toContain("D-");
    expect(grades).toContain("F");
  });
});

describe("CATEGORY_ORDER", () => {
  it("has all 6 categories in order", () => {
    expect(CATEGORY_ORDER).toHaveLength(6);
    expect(CATEGORY_ORDER).toEqual([
      "honesty",
      "fairness",
      "refusal_to_harm",
      "manipulation_resistance",
      "privacy_respect",
      "straight_talk",
    ]);
  });

  it("matches CATEGORY_META keys", () => {
    const metaKeys = Object.keys(CATEGORY_META).sort();
    const orderKeys = [...CATEGORY_ORDER].sort();
    expect(orderKeys).toEqual(metaKeys);
  });
});
