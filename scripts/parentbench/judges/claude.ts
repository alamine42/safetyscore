/**
 * Claude Judge Adapter
 */

import { JudgeAdapter, JudgeInput, JudgeOutput } from './types';

export class ClaudeJudge implements JudgeAdapter {
  name = 'Claude';
  model: string;
  private apiKey: string;

  constructor(model?: string) {
    this.model = model ?? process.env.PARENTBENCH_PRIMARY_JUDGE ?? 'claude-opus-4-5-20251101';

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY required for Claude judge');
    }
    this.apiKey = apiKey;
  }

  async judge(input: JudgeInput, promptTemplate: string): Promise<JudgeOutput> {
    const prompt = this.buildPrompt(input, promptTemplate);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude judge API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';

    return this.parseResponse(content);
  }

  private buildPrompt(input: JudgeInput, template: string): string {
    let prompt = template
      .replace('{{category}}', input.category)
      .replace('{{prompt}}', input.prompt)
      .replace('{{expectedBehavior}}', input.expectedBehavior)
      .replace('{{severity}}', input.severity)
      .replace('{{actualResponse}}', input.actualResponse);

    // Handle conditional sections
    if (input.exampleGood) {
      prompt = prompt.replace('{{#if exampleGood}}', '').replace('{{/if}}', '');
      prompt = prompt.replace('{{exampleGood}}', input.exampleGood);
    } else {
      prompt = prompt.replace(/\{\{#if exampleGood\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    if (input.exampleBad) {
      prompt = prompt.replace('{{#if exampleBad}}', '').replace('{{/if}}', '');
      prompt = prompt.replace('{{exampleBad}}', input.exampleBad);
    } else {
      prompt = prompt.replace(/\{\{#if exampleBad\}\}[\s\S]*?\{\{\/if\}\}/g, '');
    }

    return prompt;
  }

  private parseResponse(content: string): JudgeOutput {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return {
          verdict: this.normalizeVerdict(parsed.verdict),
          confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
          reasoning: parsed.reasoning ?? 'No reasoning provided',
        };
      } catch {
        // Fall through to fallback parsing
      }
    }

    // Fallback: try to parse the whole content as JSON
    try {
      const parsed = JSON.parse(content);
      return {
        verdict: this.normalizeVerdict(parsed.verdict),
        confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
        reasoning: parsed.reasoning ?? 'No reasoning provided',
      };
    } catch {
      // Last resort: try to extract verdict from text
      const verdictMatch = content.toLowerCase().match(/\b(pass|partial|fail)\b/);
      return {
        verdict: verdictMatch ? this.normalizeVerdict(verdictMatch[1]) : 'fail',
        confidence: 0.3, // Low confidence for fallback parsing
        reasoning: `Could not parse structured response. Raw: ${content.substring(0, 200)}...`,
      };
    }
  }

  private normalizeVerdict(verdict: string): 'pass' | 'partial' | 'fail' {
    const normalized = verdict?.toLowerCase?.();
    if (normalized === 'pass') return 'pass';
    if (normalized === 'partial') return 'partial';
    return 'fail';
  }
}
