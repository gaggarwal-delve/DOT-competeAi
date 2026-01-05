'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Zap, DollarSign } from 'lucide-react';

type AIProvider = 'openai' | 'deepseek';

interface SummaryResult {
  summary: string;
  provider: string;
  model: string;
  tokensUsed: { input: number; output: number };
  estimatedCost: number;
}

interface AISummaryProps {
  type: 'trial' | 'company' | 'news';
  data: any;
  compact?: boolean;
  enableABTest?: boolean; // New: enable A/B testing mode
}

export function AISummary({ type, data, compact = false, enableABTest = false }: AISummaryProps) {
  const [results, setResults] = useState<Record<AIProvider, SummaryResult | null>>({
    openai: null,
    deepseek: null,
  });
  const [loading, setLoading] = useState<Record<AIProvider, boolean>>({
    openai: false,
    deepseek: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');

  const generateSummary = async (provider: AIProvider) => {
    // If already generated for this provider, just toggle expand
    if (results[provider]) {
      setSelectedProvider(provider);
      setExpanded(!expanded);
      return;
    }

    setLoading(prev => ({ ...prev, [provider]: true }));
    setError(null);

    try {
      const response = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data, provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate summary');
      }

      const result = await response.json();
      setResults(prev => ({
        ...prev,
        [provider]: result,
      }));
      setSelectedProvider(provider);
      setExpanded(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI summary');
    } finally {
      setLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const generateBothSummaries = async () => {
    await Promise.all([
      generateSummary('openai'),
      generateSummary('deepseek'),
    ]);
  };

  if (compact && !enableABTest) {
    return (
      <button
        onClick={() => generateSummary(selectedProvider)}
        disabled={loading[selectedProvider]}
        className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
      >
        {loading[selectedProvider] ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="h-3 w-3" />
            <span>AI Summary</span>
          </>
        )}
      </button>
    );
  }

  const hasAnyResult = results.openai || results.deepseek;
  const isAnyLoading = loading.openai || loading.deepseek;

  return (
    <div className="mt-3 border-t pt-3">
      {/* A/B Test Mode: Generate Both */}
      {enableABTest ? (
        <div className="space-y-3">
          <button
            onClick={generateBothSummaries}
            disabled={isAnyLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-orange-700 disabled:opacity-50 transition-all"
          >
            {isAnyLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Generating Both Summaries...</span>
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                <span>🔬 A/B Test: Generate Both (OpenAI vs DeepSeek)</span>
              </>
            )}
          </button>

          {/* Side-by-side comparison */}
          {(results.openai || results.deepseek) && (
            <div className="grid md:grid-cols-2 gap-4">
              {/* OpenAI Result */}
              <div className={`p-4 rounded-lg border-2 ${results.openai ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-blue-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    OpenAI GPT-4o-mini
                  </h4>
                  {!results.openai && loading.openai && (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  )}
                </div>
                {results.openai ? (
                  <>
                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line mb-3">
                      {results.openai.summary}
                    </div>
                    <div className="text-xs space-y-1 text-gray-600 border-t pt-2">
                      <div className="flex justify-between">
                        <span>Tokens:</span>
                        <span>{results.openai.tokensUsed.input + results.openai.tokensUsed.output}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Cost:</span>
                        <span>${results.openai.estimatedCost.toFixed(6)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic">Waiting to generate...</p>
                )}
              </div>

              {/* DeepSeek Result */}
              <div className={`p-4 rounded-lg border-2 ${results.deepseek ? 'bg-purple-50 border-purple-300' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-purple-900 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    DeepSeek-V3
                  </h4>
                  {!results.deepseek && loading.deepseek && (
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  )}
                </div>
                {results.deepseek ? (
                  <>
                    <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line mb-3">
                      {results.deepseek.summary}
                    </div>
                    <div className="text-xs space-y-1 text-gray-600 border-t pt-2">
                      <div className="flex justify-between">
                        <span>Tokens:</span>
                        <span>{results.deepseek.tokensUsed.input + results.deepseek.tokensUsed.output}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-700">
                        <span>Cost:</span>
                        <span>${results.deepseek.estimatedCost.toFixed(6)}</span>
                      </div>
                      {results.openai && results.deepseek && (
                        <div className="flex justify-between font-bold text-green-800 pt-1">
                          <span>Savings:</span>
                          <span>
                            {(((results.openai.estimatedCost - results.deepseek.estimatedCost) / results.openai.estimatedCost) * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-sm italic">Waiting to generate...</p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Regular Mode: Single Provider
        <>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => generateSummary('openai')}
              disabled={loading.openai}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 transition-all"
            >
              {loading.openai ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : results.openai ? (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>{expanded && selectedProvider === 'openai' ? 'Hide' : 'Show'} OpenAI</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate with OpenAI</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {results[selectedProvider] && expanded && (
            <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    {results[selectedProvider]!.provider}
                  </h4>
                  <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
                    {results[selectedProvider]!.summary}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-2 border-t">
                <span>
                  {results[selectedProvider]!.model} • May contain inaccuracies
                </span>
                <span className="font-semibold">
                  ${results[selectedProvider]!.estimatedCost.toFixed(6)}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

