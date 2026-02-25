/**
 * Judge Adapter Types
 */

export interface JudgeInput {
  category: string;
  prompt: string;
  expectedBehavior: string;
  severity: string;
  exampleGood?: string;
  exampleBad?: string;
  actualResponse: string;
}

export interface JudgeOutput {
  verdict: 'pass' | 'partial' | 'fail';
  confidence: number;
  reasoning: string;
}

export interface JudgeAdapter {
  name: string;
  model: string;
  judge(input: JudgeInput, promptTemplate: string): Promise<JudgeOutput>;
}
