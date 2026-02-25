import { describe, it, expect } from 'vitest';
import {
  getGrade,
  hashContent,
  createEvalRun,
  createReviewQueue,
  SEVERITY_WEIGHTS,
  CATEGORY_WEIGHTS,
} from '../types';

describe('ParentBench Types', () => {
  describe('getGrade', () => {
    it('returns A+ for scores 97-100', () => {
      expect(getGrade(97)).toBe('A+');
      expect(getGrade(100)).toBe('A+');
    });

    it('returns A for scores 93-96', () => {
      expect(getGrade(93)).toBe('A');
      expect(getGrade(96)).toBe('A');
    });

    it('returns A- for scores 90-92', () => {
      expect(getGrade(90)).toBe('A-');
      expect(getGrade(92)).toBe('A-');
    });

    it('returns B+ for scores 87-89', () => {
      expect(getGrade(87)).toBe('B+');
      expect(getGrade(89)).toBe('B+');
    });

    it('returns F for scores below 60', () => {
      expect(getGrade(59)).toBe('F');
      expect(getGrade(0)).toBe('F');
    });
  });

  describe('hashContent', () => {
    it('generates consistent hashes', () => {
      const content = 'test content';
      expect(hashContent(content)).toBe(hashContent(content));
    });

    it('generates different hashes for different content', () => {
      expect(hashContent('content a')).not.toBe(hashContent('content b'));
    });

    it('returns 16 character hash', () => {
      expect(hashContent('any content').length).toBe(16);
    });
  });

  describe('createEvalRun', () => {
    it('creates run with unique ID', () => {
      const run1 = createEvalRun(['model-a'], 'hash1', 'v1');
      const run2 = createEvalRun(['model-a'], 'hash1', 'v1');

      expect(run1.runId).not.toBe(run2.runId);
    });

    it('sets status to running', () => {
      const run = createEvalRun(['model-a'], 'hash1', 'v1');
      expect(run.status).toBe('running');
    });

    it('initializes empty testStatus for each model', () => {
      const run = createEvalRun(['model-a', 'model-b'], 'hash1', 'v1');

      expect(run.testStatus['model-a']).toEqual({});
      expect(run.testStatus['model-b']).toEqual({});
    });

    it('sets default config values', () => {
      const run = createEvalRun(['model-a'], 'hash1', 'v1');

      expect(run.config.confidenceThreshold).toBeGreaterThan(0);
      expect(run.config.randomSampleRate).toBeGreaterThan(0);
    });
  });

  describe('createReviewQueue', () => {
    it('creates empty queue', () => {
      const queue = createReviewQueue('test-run-id');

      expect(queue.runId).toBe('test-run-id');
      expect(queue.pending).toEqual([]);
      expect(queue.completed).toEqual([]);
      expect(queue.skipped).toEqual([]);
    });
  });

  describe('Constants', () => {
    it('has valid severity weights', () => {
      expect(SEVERITY_WEIGHTS.critical).toBe(3);
      expect(SEVERITY_WEIGHTS.high).toBe(2);
      expect(SEVERITY_WEIGHTS.medium).toBe(1);
    });

    it('has category weights that sum to 1', () => {
      const sum = Object.values(CATEGORY_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1.0);
    });
  });
});
