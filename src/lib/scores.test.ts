import { describe, it, expect } from "vitest";
import { scoreToGrade, scoreToColor, scoreToColorClasses, gradeToColorClasses } from "./scores";

describe("scoreToGrade", () => {
  it("returns A+ for scores 97 and above", () => {
    expect(scoreToGrade(97)).toBe("A+");
    expect(scoreToGrade(100)).toBe("A+");
  });

  it("returns A for scores 93-96", () => {
    expect(scoreToGrade(93)).toBe("A");
    expect(scoreToGrade(96)).toBe("A");
  });

  it("returns A- for scores 90-92", () => {
    expect(scoreToGrade(90)).toBe("A-");
    expect(scoreToGrade(92)).toBe("A-");
  });

  it("returns B+ for scores 87-89", () => {
    expect(scoreToGrade(87)).toBe("B+");
    expect(scoreToGrade(89)).toBe("B+");
  });

  it("returns B for scores 83-86", () => {
    expect(scoreToGrade(83)).toBe("B");
    expect(scoreToGrade(86)).toBe("B");
  });

  it("returns B- for scores 80-82", () => {
    expect(scoreToGrade(80)).toBe("B-");
    expect(scoreToGrade(82)).toBe("B-");
  });

  it("returns C+ for scores 77-79", () => {
    expect(scoreToGrade(77)).toBe("C+");
    expect(scoreToGrade(79)).toBe("C+");
  });

  it("returns C for scores 73-76", () => {
    expect(scoreToGrade(73)).toBe("C");
    expect(scoreToGrade(76)).toBe("C");
  });

  it("returns C- for scores 70-72", () => {
    expect(scoreToGrade(70)).toBe("C-");
    expect(scoreToGrade(72)).toBe("C-");
  });

  it("returns D+ for scores 67-69", () => {
    expect(scoreToGrade(67)).toBe("D+");
    expect(scoreToGrade(69)).toBe("D+");
  });

  it("returns D for scores 63-66", () => {
    expect(scoreToGrade(63)).toBe("D");
    expect(scoreToGrade(66)).toBe("D");
  });

  it("returns D- for scores 60-62", () => {
    expect(scoreToGrade(60)).toBe("D-");
    expect(scoreToGrade(62)).toBe("D-");
  });

  it("returns F for scores below 60", () => {
    expect(scoreToGrade(59)).toBe("F");
    expect(scoreToGrade(0)).toBe("F");
    expect(scoreToGrade(30)).toBe("F");
  });
});

describe("scoreToColor", () => {
  it("returns green for scores 80 and above", () => {
    expect(scoreToColor(80)).toBe("green");
    expect(scoreToColor(100)).toBe("green");
    expect(scoreToColor(85)).toBe("green");
  });

  it("returns yellow for scores 60-79", () => {
    expect(scoreToColor(60)).toBe("yellow");
    expect(scoreToColor(79)).toBe("yellow");
    expect(scoreToColor(70)).toBe("yellow");
  });

  it("returns red for scores below 60", () => {
    expect(scoreToColor(59)).toBe("red");
    expect(scoreToColor(0)).toBe("red");
    expect(scoreToColor(30)).toBe("red");
  });
});

describe("scoreToColorClasses", () => {
  it("returns green classes for high scores", () => {
    const classes = scoreToColorClasses(85);
    expect(classes.text).toContain("green");
    expect(classes.bg).toContain("green");
    expect(classes.bar).toContain("green");
  });

  it("returns yellow classes for medium scores", () => {
    const classes = scoreToColorClasses(70);
    expect(classes.text).toContain("yellow");
    expect(classes.bg).toContain("yellow");
    expect(classes.bar).toContain("yellow");
  });

  it("returns red classes for low scores", () => {
    const classes = scoreToColorClasses(50);
    expect(classes.text).toContain("red");
    expect(classes.bg).toContain("red");
    expect(classes.bar).toContain("red");
  });
});

describe("gradeToColorClasses", () => {
  it("returns green classes for A grades and B+", () => {
    expect(gradeToColorClasses("A+").text).toContain("green");
    expect(gradeToColorClasses("A").text).toContain("green");
    expect(gradeToColorClasses("A-").text).toContain("green");
    expect(gradeToColorClasses("B+").text).toContain("green");
  });

  it("returns yellow classes for B and C grades", () => {
    expect(gradeToColorClasses("B").text).toContain("yellow");
    expect(gradeToColorClasses("B-").text).toContain("yellow");
    expect(gradeToColorClasses("C+").text).toContain("yellow");
    expect(gradeToColorClasses("C").text).toContain("yellow");
    expect(gradeToColorClasses("C-").text).toContain("yellow");
  });

  it("returns red classes for D grades and F", () => {
    expect(gradeToColorClasses("D+").text).toContain("red");
    expect(gradeToColorClasses("D").text).toContain("red");
    expect(gradeToColorClasses("D-").text).toContain("red");
    expect(gradeToColorClasses("F").text).toContain("red");
  });
});
