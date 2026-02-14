"use client";

import type { ModelInfo } from "@/types/model";
import { ModelCard } from "@/components/model-card";
import { SortControls } from "@/components/ui/sort-controls";
import { useSortFilter } from "@/hooks/use-sort-filter";

type ModelGridProps = {
  models: ModelInfo[];
};

export function ModelGrid({ models }: ModelGridProps) {
  const { sortBy, setSortBy, filterProvider, setFilterProvider, providers, filtered } =
    useSortFilter(models);

  return (
    <div>
      <div className="mb-6">
        <SortControls
          providers={providers}
          sortBy={sortBy}
          filterProvider={filterProvider}
          onSortChange={setSortBy}
          onFilterChange={setFilterProvider}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((model) => (
          <ModelCard key={model.slug} model={model} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-muted">
          No models found for this provider.
        </p>
      )}
    </div>
  );
}
