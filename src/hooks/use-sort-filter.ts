"use client";

import { useState, useMemo } from "react";
import type { ModelInfo } from "@/types/model";
import type { SortField } from "@/components/ui/sort-controls";

export function useSortFilter(models: ModelInfo[]) {
  const [sortBy, setSortBy] = useState<SortField>("score");
  const [filterProvider, setFilterProvider] = useState("all");

  const providers = useMemo(() => {
    const unique = [...new Set(models.map((m) => m.provider.name))];
    return unique.sort();
  }, [models]);

  const filtered = useMemo(() => {
    let result = [...models];

    if (filterProvider !== "all") {
      result = result.filter((m) => m.provider.name === filterProvider);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "score":
          return b.overallScore - a.overallScore;
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.evaluatedDate).getTime() -
            new Date(a.evaluatedDate).getTime()
          );
        default:
          return 0;
      }
    });

    return result;
  }, [models, sortBy, filterProvider]);

  return {
    sortBy,
    setSortBy,
    filterProvider,
    setFilterProvider,
    providers,
    filtered,
  };
}
