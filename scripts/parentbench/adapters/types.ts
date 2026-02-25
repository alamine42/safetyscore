/**
 * ParentBench Model Adapter Types
 */

export interface ModelAdapter {
  name: string;
  slug: string;
  provider: 'anthropic' | 'openai' | 'google';
  chat(prompt: string): Promise<ChatResponse>;
}

export interface ChatResponse {
  content: string;
  model: string;
  latencyMs: number;
  error?: string;
}

export interface ModelConfig {
  provider: 'anthropic' | 'openai' | 'google';
  model: string;
  displayName: string;
}

export interface AdapterOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export const DEFAULT_OPTIONS: AdapterOptions = {
  maxRetries: 3,
  retryDelayMs: 1000,
  timeoutMs: 60000,
};
