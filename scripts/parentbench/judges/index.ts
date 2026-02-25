/**
 * Judge Module - LLM-as-judge with fallback support
 */

export * from './types';
export { ClaudeJudge } from './claude';
export { OpenAIJudge } from './openai';

import { JudgeAdapter, JudgeInput, JudgeOutput } from './types';
import { ClaudeJudge } from './claude';
import { OpenAIJudge } from './openai';

export interface JudgeResult extends JudgeOutput {
  judgeModel: string;
  usedFallback: boolean;
}

/**
 * Create judge adapters in priority order
 */
export function createJudges(): JudgeAdapter[] {
  const judges: JudgeAdapter[] = [];

  // Primary judge: Claude
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      judges.push(new ClaudeJudge());
    } catch {
      // Skip if initialization fails
    }
  }

  // Fallback judge: OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      judges.push(new OpenAIJudge());
    } catch {
      // Skip if initialization fails
    }
  }

  return judges;
}

/**
 * Run judgment with fallback support
 */
export async function executeJudgment(
  input: JudgeInput,
  promptTemplate: string,
  judges?: JudgeAdapter[]
): Promise<JudgeResult> {
  const availableJudges = judges ?? createJudges();

  if (availableJudges.length === 0) {
    throw new Error('No judge adapters available. Set ANTHROPIC_API_KEY or OPENAI_API_KEY');
  }

  let lastError: Error | null = null;

  for (let i = 0; i < availableJudges.length; i++) {
    const judge = availableJudges[i];
    const usedFallback = i > 0;

    try {
      const result = await judge.judge(input, promptTemplate);
      return {
        ...result,
        judgeModel: judge.model,
        usedFallback,
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`Judge ${judge.name} failed: ${lastError.message}, trying fallback...`);
    }
  }

  throw new Error(`All judges failed. Last error: ${lastError?.message}`);
}
