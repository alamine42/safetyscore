/**
 * Model API Adapters - Unified interface for AI model APIs
 */

export * from './types';
export * from './registry';
export { AnthropicAdapter } from './anthropic';
export { OpenAIAdapter } from './openai';
export { GoogleAdapter } from './google';

import { ModelAdapter, AdapterOptions } from './types';
import { getModelConfig, MODEL_REGISTRY } from './registry';
import { AnthropicAdapter } from './anthropic';
import { OpenAIAdapter } from './openai';
import { GoogleAdapter } from './google';

/**
 * Create a model adapter for the given slug
 */
export function createAdapter(slug: string, options?: Partial<AdapterOptions>): ModelAdapter {
  const config = getModelConfig(slug);
  if (!config) {
    throw new Error(`Unknown model slug: ${slug}. Available: ${Object.keys(MODEL_REGISTRY).join(', ')}`);
  }

  switch (config.provider) {
    case 'anthropic':
      return new AnthropicAdapter(slug, config.model, config.displayName, options);
    case 'openai':
      return new OpenAIAdapter(slug, config.model, config.displayName, options);
    case 'google':
      return new GoogleAdapter(slug, config.model, config.displayName, options);
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

/**
 * Check which API keys are available
 */
export function checkAvailableProviders(): {
  anthropic: boolean;
  openai: boolean;
  google: boolean;
} {
  return {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    google: !!process.env.GOOGLE_AI_API_KEY,
  };
}

/**
 * Get all adapters for models with available API keys
 */
export function createAvailableAdapters(options?: Partial<AdapterOptions>): ModelAdapter[] {
  const available = checkAvailableProviders();
  const adapters: ModelAdapter[] = [];

  for (const [slug, config] of Object.entries(MODEL_REGISTRY)) {
    if (available[config.provider]) {
      try {
        adapters.push(createAdapter(slug, options));
      } catch {
        // Skip models that fail to initialize
      }
    }
  }

  return adapters;
}
