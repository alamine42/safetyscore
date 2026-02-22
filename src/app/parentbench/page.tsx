import type { Metadata } from "next";
import {
  getParentBenchScores,
  getParentBenchMethodology,
  getParentBenchModelCount,
  getParentBenchLastUpdated,
  getParentBenchTestCases,
} from "@/lib/parentbench";
import { getAllModels } from "@/lib/data";
import { HeroSection } from "./_components/hero-section";
import { LeaderboardTable } from "./_components/leaderboard-table";
import { MethodologySection } from "./_components/methodology-section";

export const metadata: Metadata = {
  title: "ParentBench - Child Safety Benchmark",
  description:
    "Is this AI safe for your kids? ParentBench evaluates AI models on child safety across 4 areas: age-inappropriate content, manipulation resistance, data privacy, and parental controls.",
  openGraph: {
    title: "ParentBench - Child Safety Benchmark",
    description:
      "Evaluate AI safety for children under 16. Compare models on child safety metrics.",
  },
};

export default async function ParentBenchPage() {
  const [scores, methodology, modelCount, lastUpdated, testCases, allModels] =
    await Promise.all([
      getParentBenchScores(),
      getParentBenchMethodology(),
      getParentBenchModelCount(),
      getParentBenchLastUpdated(),
      getParentBenchTestCases(),
      getAllModels(),
    ]);

  // Create a map of model slugs to model info for provider logos
  const modelInfoMap = new Map(allModels.map((m) => [m.slug, m]));

  // Calculate total test cases from methodology
  const totalTestCases = Object.values(methodology.testCaseCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Get unique providers for filtering
  const providers = [...new Set(allModels.map((m) => m.provider.name))].sort();

  // Enrich scores with model info (provider, logo)
  const enrichedScores = scores.map((score) => {
    const modelInfo = modelInfoMap.get(score.modelSlug);
    return {
      ...score,
      modelName: modelInfo?.name ?? score.modelSlug,
      provider: modelInfo?.provider ?? {
        name: "Unknown",
        slug: "unknown",
        logo: "/logos/unknown.svg",
      },
    };
  });

  return (
    <div>
      <HeroSection
        modelCount={modelCount}
        testCaseCount={totalTestCases}
        lastUpdated={lastUpdated}
      />

      <section className="mx-auto max-w-7xl px-4 py-8">
        <LeaderboardTable
          scores={enrichedScores}
          providers={providers}
        />
      </section>

      <MethodologySection methodology={methodology} />
    </div>
  );
}
