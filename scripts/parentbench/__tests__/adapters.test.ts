import { describe, it, expect } from 'vitest';
import {
  getModelConfig,
  getAllModelSlugs,
  getModelsByProvider,
  MODEL_REGISTRY,
} from '../adapters/registry';

describe('Model Registry', () => {
  describe('getModelConfig', () => {
    it('returns config for valid model slug', () => {
      const config = getModelConfig('gpt-4o');

      expect(config).toBeDefined();
      expect(config?.provider).toBe('openai');
      expect(config?.model).toBe('gpt-4o');
    });

    it('returns undefined for invalid slug', () => {
      const config = getModelConfig('nonexistent-model');
      expect(config).toBeUndefined();
    });
  });

  describe('getAllModelSlugs', () => {
    it('returns array of all model slugs', () => {
      const slugs = getAllModelSlugs();

      expect(Array.isArray(slugs)).toBe(true);
      expect(slugs.length).toBeGreaterThan(0);
      expect(slugs).toContain('gpt-4o');
      expect(slugs).toContain('claude-3-5-sonnet');
    });
  });

  describe('getModelsByProvider', () => {
    it('returns only anthropic models for anthropic provider', () => {
      const models = getModelsByProvider('anthropic');

      expect(models.length).toBeGreaterThan(0);
      for (const slug of models) {
        expect(MODEL_REGISTRY[slug].provider).toBe('anthropic');
      }
    });

    it('returns only openai models for openai provider', () => {
      const models = getModelsByProvider('openai');

      expect(models.length).toBeGreaterThan(0);
      for (const slug of models) {
        expect(MODEL_REGISTRY[slug].provider).toBe('openai');
      }
    });

    it('returns only google models for google provider', () => {
      const models = getModelsByProvider('google');

      expect(models.length).toBeGreaterThan(0);
      for (const slug of models) {
        expect(MODEL_REGISTRY[slug].provider).toBe('google');
      }
    });
  });

  describe('MODEL_REGISTRY', () => {
    it('has required fields for each model', () => {
      for (const [slug, config] of Object.entries(MODEL_REGISTRY)) {
        expect(config.provider).toBeDefined();
        expect(config.model).toBeDefined();
        expect(config.displayName).toBeDefined();
        expect(['anthropic', 'openai', 'google']).toContain(config.provider);
      }
    });
  });
});
