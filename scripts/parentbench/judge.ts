/**
 * ParentBench Judge Module
 *
 * Orchestrates LLM judging and review queue management
 */

import {
  TestCase,
  TestResponse,
  Judgment,
  EvalRun,
  ReviewQueue,
  ReviewItem,
  FlagReason,
} from './types';
import { executeJudgment, JudgeInput } from './judges';
import { loadJudgePrompt, saveJudgment, getJudgePromptVersion } from './utils';

/**
 * Run judge on a test response and update review queue
 */
export async function runJudge(
  run: EvalRun,
  testCase: TestCase,
  response: TestResponse,
  reviewQueue: ReviewQueue
): Promise<Judgment | null> {
  const promptTemplate = loadJudgePrompt(run.judgePromptVersion);

  const input: JudgeInput = {
    category: testCase.category,
    prompt: testCase.prompt,
    expectedBehavior: testCase.expectedBehavior,
    severity: testCase.severity,
    exampleGood: testCase.examples?.good?.response,
    exampleBad: testCase.examples?.bad?.response,
    actualResponse: response.response,
  };

  const result = await executeJudgment(input, promptTemplate);

  const judgment: Judgment = {
    runId: run.runId,
    testId: testCase.id,
    modelSlug: response.modelSlug,
    verdict: result.verdict,
    confidence: result.confidence,
    reasoning: result.reasoning,
    judgeModel: result.judgeModel,
    judgePromptVersion: run.judgePromptVersion,
    usedFallback: result.usedFallback,
    timestamp: new Date().toISOString(),
  };

  saveJudgment(judgment);

  // Determine if this needs human review
  const flagReasons = checkReviewFlags(judgment, testCase, run);

  if (flagReasons.length > 0) {
    const reviewItem: ReviewItem = {
      testId: testCase.id,
      modelSlug: response.modelSlug,
      flagReason: flagReasons[0], // Primary reason
      status: 'pending',
    };

    // Avoid duplicates
    const exists = reviewQueue.pending.some(
      item => item.testId === reviewItem.testId && item.modelSlug === reviewItem.modelSlug
    );

    if (!exists) {
      reviewQueue.pending.push(reviewItem);
    }
  }

  return judgment;
}

/**
 * Check if a judgment needs human review
 */
function checkReviewFlags(
  judgment: Judgment,
  testCase: TestCase,
  run: EvalRun
): FlagReason[] {
  const flags: FlagReason[] = [];
  const { confidenceThreshold, randomSampleRate } = run.config;

  // Low confidence
  if (judgment.confidence < confidenceThreshold) {
    flags.push('low_confidence');
  }

  // Partial verdict
  if (judgment.verdict === 'partial') {
    flags.push('partial');
  }

  // Critical severity failure
  if (testCase.severity === 'critical' && judgment.verdict === 'fail') {
    flags.push('critical_fail');
  }

  // Used fallback judge
  if (judgment.usedFallback) {
    flags.push('fallback_judge');
  }

  // Random sample (only for high-confidence pass/fail)
  if (
    flags.length === 0 &&
    judgment.confidence >= confidenceThreshold &&
    (judgment.verdict === 'pass' || judgment.verdict === 'fail')
  ) {
    if (Math.random() < randomSampleRate) {
      flags.push('random_sample');
    }
  }

  return flags;
}

/**
 * Get flag reason description
 */
export function getFlagReasonDescription(reason: FlagReason): string {
  switch (reason) {
    case 'low_confidence':
      return 'Low confidence judgment (requires verification)';
    case 'partial':
      return 'Partial verdict (ambiguous case)';
    case 'critical_fail':
      return 'Critical severity test failed';
    case 'fallback_judge':
      return 'Fallback judge used (primary failed)';
    case 'random_sample':
      return 'Random quality sample';
    default:
      return 'Unknown reason';
  }
}
