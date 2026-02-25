/**
 * ParentBench Utility Functions
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestCasesFile, EvalRun, TestResponse, Judgment, ReviewQueue, HumanReview, hashContent } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'parentbench');
const RUNS_DIR = path.join(DATA_DIR, 'runs');

// ============================================================================
// File System Helpers
// ============================================================================

export function ensureDir(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function readJson<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

export function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ============================================================================
// Test Cases
// ============================================================================

export function loadTestCases(): TestCasesFile {
  const filePath = path.join(DATA_DIR, 'test-cases.json');
  return readJson<TestCasesFile>(filePath);
}

export function getTestCaseHash(): string {
  const filePath = path.join(DATA_DIR, 'test-cases.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  return hashContent(content);
}

// ============================================================================
// Run Management
// ============================================================================

export function getRunDir(runId: string): string {
  return path.join(RUNS_DIR, runId);
}

export function saveRun(run: EvalRun): void {
  const runDir = getRunDir(run.runId);
  ensureDir(runDir);
  writeJson(path.join(runDir, 'manifest.json'), run);
}

export function loadRun(runId: string): EvalRun {
  const runDir = getRunDir(runId);
  return readJson<EvalRun>(path.join(runDir, 'manifest.json'));
}

export function listRuns(): string[] {
  if (!fs.existsSync(RUNS_DIR)) {
    return [];
  }
  return fs.readdirSync(RUNS_DIR).filter(name => {
    const manifestPath = path.join(RUNS_DIR, name, 'manifest.json');
    return fs.existsSync(manifestPath);
  });
}

export function getLatestRun(): EvalRun | null {
  const runs = listRuns();
  if (runs.length === 0) return null;

  let latestRun: EvalRun | null = null;
  let latestTime = 0;

  for (const runId of runs) {
    const run = loadRun(runId);
    const time = new Date(run.createdAt).getTime();
    if (time > latestTime) {
      latestTime = time;
      latestRun = run;
    }
  }

  return latestRun;
}

// ============================================================================
// Test Responses
// ============================================================================

export function getResponsePath(runId: string, modelSlug: string, testId: string): string {
  return path.join(getRunDir(runId), 'responses', modelSlug, `${testId}.json`);
}

export function saveResponse(response: TestResponse): void {
  const filePath = getResponsePath(response.runId, response.modelSlug, response.testId);
  writeJson(filePath, response);
}

export function loadResponse(runId: string, modelSlug: string, testId: string): TestResponse | null {
  const filePath = getResponsePath(runId, modelSlug, testId);
  if (!fs.existsSync(filePath)) return null;
  return readJson<TestResponse>(filePath);
}

export function listResponses(runId: string, modelSlug: string): string[] {
  const dir = path.join(getRunDir(runId), 'responses', modelSlug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

// ============================================================================
// Judgments
// ============================================================================

export function getJudgmentPath(runId: string, modelSlug: string, testId: string): string {
  return path.join(getRunDir(runId), 'judgments', modelSlug, `${testId}.json`);
}

export function saveJudgment(judgment: Judgment): void {
  const filePath = getJudgmentPath(judgment.runId, judgment.modelSlug, judgment.testId);
  writeJson(filePath, judgment);
}

export function loadJudgment(runId: string, modelSlug: string, testId: string): Judgment | null {
  const filePath = getJudgmentPath(runId, modelSlug, testId);
  if (!fs.existsSync(filePath)) return null;
  return readJson<Judgment>(filePath);
}

export function listJudgments(runId: string, modelSlug: string): string[] {
  const dir = path.join(getRunDir(runId), 'judgments', modelSlug);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));
}

// ============================================================================
// Review Queue
// ============================================================================

export function getReviewQueuePath(runId: string): string {
  return path.join(getRunDir(runId), 'review-queue.json');
}

export function saveReviewQueue(queue: ReviewQueue): void {
  writeJson(getReviewQueuePath(queue.runId), queue);
}

export function loadReviewQueue(runId: string): ReviewQueue | null {
  const filePath = getReviewQueuePath(runId);
  if (!fs.existsSync(filePath)) return null;
  return readJson<ReviewQueue>(filePath);
}

// ============================================================================
// Human Reviews
// ============================================================================

export function getReviewPath(runId: string, modelSlug: string, testId: string): string {
  return path.join(getRunDir(runId), 'reviews', modelSlug, `${testId}.json`);
}

export function saveReview(review: HumanReview): void {
  const filePath = getReviewPath(review.runId, review.modelSlug, review.testId);
  writeJson(filePath, review);
}

export function loadReview(runId: string, modelSlug: string, testId: string): HumanReview | null {
  const filePath = getReviewPath(runId, modelSlug, testId);
  if (!fs.existsSync(filePath)) return null;
  return readJson<HumanReview>(filePath);
}

// ============================================================================
// Judge Prompt
// ============================================================================

export function getJudgePromptVersion(): string {
  const promptsDir = path.join(process.cwd(), 'scripts', 'parentbench', 'prompts');
  if (!fs.existsSync(promptsDir)) return 'v1';

  const files = fs.readdirSync(promptsDir).filter(f => f.startsWith('judge-v') && f.endsWith('.txt'));
  if (files.length === 0) return 'v1';

  // Get the highest version
  const versions = files.map(f => parseInt(f.match(/judge-v(\d+)\.txt/)?.[1] ?? '1', 10));
  return `v${Math.max(...versions)}`;
}

export function loadJudgePrompt(version?: string): string {
  const ver = version ?? getJudgePromptVersion();
  const promptPath = path.join(process.cwd(), 'scripts', 'parentbench', 'prompts', `judge-${ver}.txt`);

  if (!fs.existsSync(promptPath)) {
    throw new Error(`Judge prompt not found: ${promptPath}`);
  }

  return fs.readFileSync(promptPath, 'utf-8');
}

// ============================================================================
// Console Output
// ============================================================================

export function log(message: string): void {
  console.log(message);
}

export function logSuccess(message: string): void {
  console.log(`✓ ${message}`);
}

export function logError(message: string): void {
  console.error(`✗ ${message}`);
}

export function logWarning(message: string): void {
  console.warn(`⚠ ${message}`);
}

export function logProgress(current: number, total: number, label: string): void {
  const percent = Math.round((current / total) * 100);
  process.stdout.write(`\r${label}: ${current}/${total} (${percent}%)`);
  if (current === total) {
    process.stdout.write('\n');
  }
}
