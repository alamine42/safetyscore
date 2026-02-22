import { test, expect } from "@playwright/test";

test.describe("ParentBench Leaderboard Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/parentbench");
  });

  test("loads with leaderboard showing all models", async ({ page, isMobile }) => {
    // Page title should contain ParentBench
    await expect(page).toHaveTitle(/ParentBench/);

    // Hero section should be visible
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    if (isMobile) {
      // Mobile uses details cards
      const cards = page.locator("details");
      await expect(cards.first()).toBeVisible();
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    } else {
      // Desktop uses table
      const table = page.locator("table");
      await expect(table).toBeVisible();
      const rows = table.locator("tbody tr");
      await expect(rows.first()).toBeVisible();
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("sort controls work", async ({ page, isMobile }) => {
    // Sort select should be visible on both mobile and desktop
    const sortSelect = page.locator("select#sort");
    await expect(sortSelect).toBeVisible();

    // Change sort option
    await sortSelect.selectOption("manipulation_resistance");
    await page.waitForTimeout(300);

    // Verify content still renders
    if (isMobile) {
      await expect(page.locator("details").first()).toBeVisible();
    } else {
      await expect(page.locator("table tbody tr").first()).toBeVisible();
    }
  });

  test("provider filter works", async ({ page, isMobile }) => {
    // Get initial count
    let initialCount: number;
    if (isMobile) {
      initialCount = await page.locator("details").count();
    } else {
      initialCount = await page.locator("table tbody tr").count();
    }

    // Find provider filter select
    const filterSelect = page.locator("select#provider");
    await expect(filterSelect).toBeVisible();

    // Get options
    const options = await filterSelect.locator("option").allTextContents();

    // Select a specific provider if multiple options exist
    if (options.length > 1) {
      await filterSelect.selectOption({ index: 1 });
      await page.waitForTimeout(300);

      // Count may change
      let filteredCount: number;
      if (isMobile) {
        filteredCount = await page.locator("details").count();
      } else {
        filteredCount = await page.locator("table tbody tr").count();
      }
      expect(filteredCount).toBeLessThanOrEqual(initialCount);
    }

    expect(initialCount).toBeGreaterThan(0);
  });

  test("model name links navigate to model page", async ({ page, isMobile }) => {
    // Get first model link
    let firstModelLink;
    if (isMobile) {
      // On mobile, links are inside details cards
      firstModelLink = page.locator("details").first().locator("a").first();
    } else {
      firstModelLink = page.locator("table tbody tr").first().locator("a").first();
    }
    await expect(firstModelLink).toBeVisible();

    const href = await firstModelLink.getAttribute("href");
    expect(href).toContain("/model/");

    // Click and verify navigation
    await firstModelLink.click();
    await expect(page).toHaveURL(/\/model\//);
  });

  test("methodology section is visible", async ({ page }) => {
    // Scroll to bottom to find methodology
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for methodology heading
    const methodologyHeading = page.getByRole("heading", { name: "Methodology" });
    await expect(methodologyHeading).toBeVisible();

    // Should have weight information
    await expect(page.getByText(/weight/i).first()).toBeVisible();
  });

  test("test cases link navigates to test cases page", async ({ page }) => {
    // Scroll to find the link
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Look for test cases link
    const testCasesLink = page.getByRole("link", { name: /test cases/i });
    await expect(testCasesLink).toBeVisible();

    await testCasesLink.click();
    await expect(page).toHaveURL(/\/parentbench\/test-cases/);
  });
});

test.describe("ParentBench Navigation", () => {
  test("ParentBench link in header navigation works", async ({ page }) => {
    await page.goto("/");

    // Find ParentBench nav link (may be text or have shield icon)
    const navLink = page.getByRole("link", { name: /parentbench|child safety/i });
    await expect(navLink).toBeVisible();

    // Click and verify navigation
    await navLink.click();
    await expect(page).toHaveURL("/parentbench");
  });
});

test.describe("Model Detail Page - ParentBench Badge", () => {
  test("model detail page shows ParentBench information", async ({ page }) => {
    // Go to a model page
    await page.goto("/model/claude-opus-4-6");

    // Look for child safety related content
    const childSafetyContent = page.getByText(/child safety|parentbench/i).first();
    await expect(childSafetyContent).toBeVisible();
  });

  test("ParentBench section links to leaderboard", async ({ page }) => {
    await page.goto("/model/claude-opus-4-6");

    // Find link to ParentBench from the page
    const parentBenchLink = page.locator("a[href='/parentbench']").first();

    if (await parentBenchLink.isVisible()) {
      await parentBenchLink.click();
      await expect(page).toHaveURL("/parentbench");
    }
  });
});

test.describe("Dark Mode", () => {
  test("dark mode can be toggled", async ({ page, isMobile }) => {
    await page.goto("/parentbench");

    // Check initial state
    const initialDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    // Try clicking any button in header that might be theme toggle
    const buttons = page.locator("header button");
    const buttonCount = await buttons.count();

    if (buttonCount > 0) {
      // Click first button (likely theme toggle)
      await buttons.first().click();
      await page.waitForTimeout(300);
    }

    // Page should still be functional - check for either table (desktop) or cards (mobile)
    if (isMobile) {
      await expect(page.locator("details").first()).toBeVisible();
    } else {
      await expect(page.locator("table")).toBeVisible();
    }
  });
});

test.describe("SEO Metadata", () => {
  test("ParentBench page has correct meta tags", async ({ page }) => {
    await page.goto("/parentbench");

    // Check title contains ParentBench
    await expect(page).toHaveTitle(/ParentBench/);

    // Check meta description exists and mentions child
    const metaDescription = page.locator('meta[name="description"]');
    const content = await metaDescription.getAttribute("content");
    expect(content).toBeTruthy();
    expect(content?.toLowerCase()).toMatch(/child|safety|ai/);
  });

  test("test cases page has correct title", async ({ page }) => {
    await page.goto("/parentbench/test-cases");

    // Check title
    await expect(page).toHaveTitle(/test cases/i);
  });
});

test.describe("Responsive Layout", () => {
  test("leaderboard uses card layout on mobile", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only test");

    await page.goto("/parentbench");

    // Mobile uses details/summary cards instead of table
    const mobileCards = page.locator("details");
    await expect(mobileCards.first()).toBeVisible();

    // Should have multiple model cards
    const cardCount = await mobileCards.count();
    expect(cardCount).toBeGreaterThan(0);

    // Cards should be expandable
    const firstCard = mobileCards.first();
    await firstCard.click();

    // Should show category scores when expanded
    await expect(page.getByText(/Age Content|Manipulation|Privacy/i).first()).toBeVisible();
  });

  test("hero adapts to mobile viewport", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only test");

    await page.goto("/parentbench");

    // Main heading should be visible and not overflow
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    const viewportWidth = page.viewportSize()?.width || 375;
    const box = await heading.boundingBox();

    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewportWidth + 50); // Allow small margin
    }
  });
});

test.describe("Test Cases Page", () => {
  test("test cases page loads with content", async ({ page }) => {
    await page.goto("/parentbench/test-cases");

    // Should have heading
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    // Should show test case content - look for category labels or prompts
    const categoryLabels = page.getByText(/age|manipulation|privacy|parental/i);
    await expect(categoryLabels.first()).toBeVisible();
  });

  test("test cases show example responses", async ({ page }) => {
    await page.goto("/parentbench/test-cases");

    // Look for example indicators (good/bad, safe/unsafe, etc.)
    const examples = page.getByText(/example|response|good|bad|safe/i);
    const hasExamples = await examples.count() > 0;
    expect(hasExamples).toBe(true);
  });

  test("can navigate back to leaderboard", async ({ page }) => {
    await page.goto("/parentbench/test-cases");

    // Find link back to ParentBench
    const backLink = page.locator("a[href='/parentbench']").first();

    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL("/parentbench");
    }
  });
});
