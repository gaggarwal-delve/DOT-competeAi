import OpenAI from 'openai';

// Provider types
export type AIProvider = 'openai' | 'deepseek';

// Provider configurations
const providers = {
  openai: {
    name: 'OpenAI GPT-4o-mini',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    cost: { input: 0.15, output: 0.60 }, // per 1M tokens
  },
  deepseek: {
    name: 'DeepSeek-V3',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
    cost: { input: 0.14, output: 0.28 }, // per 1M tokens
  },
};

interface GenerateOptions {
  provider: AIProvider;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export async function generateAICompletion({
  provider,
  systemPrompt,
  userPrompt,
  temperature = 0.3,
  maxTokens = 200,
}: GenerateOptions): Promise<{
  content: string;
  provider: string;
  model: string;
  tokensUsed: { input: number; output: number };
  estimatedCost: number;
}> {
  const config = providers[provider];

  if (!config.apiKey) {
    throw new Error(`${config.name} API key not configured`);
  }

  // Initialize client (both use OpenAI-compatible API)
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL,
  });

  const response = await client.chat.completions.create({
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  });

  const content = response.choices[0].message.content || 'Generation failed';
  const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0 };

  // Calculate estimated cost
  const inputCost = (usage.prompt_tokens / 1_000_000) * config.cost.input;
  const outputCost = (usage.completion_tokens / 1_000_000) * config.cost.output;
  const estimatedCost = inputCost + outputCost;

  return {
    content,
    provider: config.name,
    model: config.model,
    tokensUsed: {
      input: usage.prompt_tokens,
      output: usage.completion_tokens,
    },
    estimatedCost,
  };
}

export function getProviderInfo(provider: AIProvider) {
  return providers[provider];
}

export function getAllProviders() {
  return Object.entries(providers).map(([key, config]) => ({
    id: key as AIProvider,
    name: config.name,
    model: config.model,
    cost: config.cost,
    available: !!config.apiKey,
  }));
}

