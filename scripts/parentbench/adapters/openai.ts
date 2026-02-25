/**
 * OpenAI (GPT) Model Adapter
 */

import { ModelAdapter, ChatResponse, AdapterOptions, DEFAULT_OPTIONS } from './types';

export class OpenAIAdapter implements ModelAdapter {
  name: string;
  slug: string;
  provider: 'openai' = 'openai';

  private model: string;
  private apiKey: string;
  private options: AdapterOptions;

  constructor(slug: string, model: string, name: string, options: Partial<AdapterOptions> = {}) {
    this.slug = slug;
    this.model = model;
    this.name = name;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }
    this.apiKey = apiKey;
  }

  async chat(prompt: string): Promise<ChatResponse> {
    const startTime = Date.now();

    let lastError: Error | null = null;
    for (let attempt = 0; attempt < (this.options.maxRetries ?? 3); attempt++) {
      try {
        const response = await this.makeRequest(prompt);
        return {
          content: response,
          model: this.model,
          latencyMs: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on 4xx errors (except 429)
        if (error instanceof Error && error.message.includes('400')) {
          break;
        }

        // Exponential backoff
        if (attempt < (this.options.maxRetries ?? 3) - 1) {
          const delay = (this.options.retryDelayMs ?? 1000) * Math.pow(2, attempt);
          await this.sleep(delay);
        }
      }
    }

    return {
      content: '',
      model: this.model,
      latencyMs: Date.now() - startTime,
      error: lastError?.message ?? 'Unknown error',
    };
  }

  private async makeRequest(prompt: string): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeoutMs);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4096,
          messages: [
            { role: 'user', content: prompt }
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
      }

      throw new Error('Unexpected response format from OpenAI API');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
