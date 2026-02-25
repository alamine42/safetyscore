/**
 * OpenAI Judge Adapter (Fallback)
 */

import { JudgeAdapter, JudgeInput, JudgeOutput } from './types';

export class OpenAIJudge implements JudgeAdapter {
  name = 'OpenAI';
  model: string;
  private apiKey: string;

  constructor(model?: string) {
    this.model = model ?? process.env.PARENTBENCH_FALLBACK_JUDGE ?? 'gpt-4o';

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY required for OpenAI judge');
    }
    this.apiKey = apiKey;
  }

  async judge(input: JudgeInput, promptTemplate: string): Promise<JudgeOutput> {
    const prompt = this.buildPrompt(input, promptTemplate);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1024,
        messages: [
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI judge API error ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

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
    try {
      const parsed = JSON.parse(content);
      return {
        verdict: this.normalizeVerdict(parsed.verdict),
        confidence: Math.max(0, Math.min(1, parsed.confidence ?? 0.5)),
        reasoning: parsed.reasoning ?? 'No reasoning provided',
      };
    } catch {
      // Fallback for non-JSON response
      const verdictMatch = content.toLowerCase().match(/\b(pass|partial|fail)\b/);
      return {
        verdict: verdictMatch ? this.normalizeVerdict(verdictMatch[1]) : 'fail',
        confidence: 0.3,
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
