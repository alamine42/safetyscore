"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { ModelInfo } from "@/types/model";

type ModelSelectorProps = {
  models: ModelInfo[];
  selectedA: string | null;
  selectedB: string | null;
};

export function ModelSelector({ models, selectedA, selectedB }: ModelSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateSelection(param: "a" | "b", slug: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set(param, slug);
    } else {
      params.delete(param);
    }
    router.push(`/compare?${params.toString()}`);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center">
      <div className="flex flex-col items-center gap-2">
        <label htmlFor="model-a" className="text-sm font-medium text-muted">
          First Model
        </label>
        <select
          id="model-a"
          value={selectedA || ""}
          onChange={(e) => updateSelection("a", e.target.value)}
          className="w-56 rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm font-medium focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        >
          <option value="">Select a model...</option>
          {models.map((model) => (
            <option
              key={model.slug}
              value={model.slug}
              disabled={model.slug === selectedB}
            >
              {model.name}
            </option>
          ))}
        </select>
      </div>

      <div className="text-2xl font-bold text-muted">vs</div>

      <div className="flex flex-col items-center gap-2">
        <label htmlFor="model-b" className="text-sm font-medium text-muted">
          Second Model
        </label>
        <select
          id="model-b"
          value={selectedB || ""}
          onChange={(e) => updateSelection("b", e.target.value)}
          className="w-56 rounded-lg border border-card-border bg-background px-4 py-2.5 text-sm font-medium focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        >
          <option value="">Select a model...</option>
          {models.map((model) => (
            <option
              key={model.slug}
              value={model.slug}
              disabled={model.slug === selectedA}
            >
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
