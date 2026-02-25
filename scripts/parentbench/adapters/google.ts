/**
 * Google (Gemini) Model Adapter
 */

import { ModelAdapter, ChatResponse, AdapterOptions, DEFAULT_OPTIONS } from './types';

export class GoogleAdapter implements ModelAdapter {
  name: string;
  slug: string;
  provider: 'google' = 'google';

  private model: string;
  private apiKey: string;
  private options: AdapterOptions;

  constructor(slug: string, model: string, name: string, options: Partial<AdapterOptions> = {}) {
    this.slug = slug;
    this.model = model;
    this.name = name;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY environment variable is required');
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 4096,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Google AI API error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      }

      throw new Error('Unexpected response format from Google AI API');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
