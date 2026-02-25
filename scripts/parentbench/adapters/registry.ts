/**
 * Model Registry - Maps model slugs to API configurations
 */

import { ModelConfig } from './types';

export const MODEL_REGISTRY: Record<string, ModelConfig> = {
  // Anthropic Models (using latest aliases where available)
  'claude-opus-4-5': {
    provider: 'anthropic',
    model: 'claude-opus-4-5-20251101',
    displayName: 'Claude Opus 4.5',
  },
  'claude-sonnet-4-5': {
    provider: 'anthropic',
    model: 'claude-sonnet-4-5-20251101',
    displayName: 'Claude Sonnet 4.5',
  },
  'claude-3-5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-latest',
    displayName: 'Claude 3.5 Sonnet',
  },
  'claude-3-5-haiku': {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-latest',
    displayName: 'Claude 3.5 Haiku',
  },
  'claude-3-opus': {
    provider: 'anthropic',
    model: 'claude-3-opus-latest',
    displayName: 'Claude 3 Opus',
  },
  'claude-3-haiku': {
    provider: 'anthropic',
    model: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
  },

  // OpenAI Models
  'gpt-5-3': {
    provider: 'openai',
    model: 'gpt-5-3',
    displayName: 'GPT-5.3',
  },
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    displayName: 'GPT-4o',
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
  },
  'gpt-4-turbo': {
    provider: 'openai',
    model: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
  },
  'o1': {
    provider: 'openai',
    model: 'o1',
    displayName: 'o1',
  },
  'o1-mini': {
    provider: 'openai',
    model: 'o1-mini',
    displayName: 'o1 Mini',
  },
  'o3-mini': {
    provider: 'openai',
    model: 'o3-mini',
    displayName: 'o3 Mini',
  },

  // Google Models
  'gemini-2-5-pro': {
    provider: 'google',
    model: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
  },
  'gemini-2-5-flash': {
    provider: 'google',
    model: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
  },
  'gemini-2-0-flash': {
    provider: 'google',
    model: 'gemini-2.0-flash',
    displayName: 'Gemini 2.0 Flash',
  },
  'gemini-1-5-pro': {
    provider: 'google',
    model: 'gemini-1.5-pro',
    displayName: 'Gemini 1.5 Pro',
  },
  'gemini-1-5-flash': {
    provider: 'google',
    model: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
  },
};

export function getModelConfig(slug: string): ModelConfig | undefined {
  return MODEL_REGISTRY[slug];
}

export function getAllModelSlugs(): string[] {
  return Object.keys(MODEL_REGISTRY);
}

export function getModelsByProvider(provider: 'anthropic' | 'openai' | 'google'): string[] {
  return Object.entries(MODEL_REGISTRY)
    .filter(([, config]) => config.provider === provider)
    .map(([slug]) => slug);
}
