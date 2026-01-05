"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, ArrowLeft } from "lucide-react";
import { AISummary } from "@/components/AISummary";

interface Trial {
  nctId: string;
  title: string;
  status: string;
  phase: string;
  sponsor: string;
  conditions: string[];
  startDate: string | null;
  enrollmentCount: number | null;
  studyType: string;
}

export default function AITestPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null);

  useEffect(() => {
    // Fetch a few sample trials for testing
    fetch('/api/trials?limit=5')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrials(data.trials);
          setSelectedTrial(data.trials[0] || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="h-6 w-6 text-orange-600" />
                AI A/B Test Lab
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-orange-50 to-purple-50 border-2 border-orange-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Zap className="h-5 w-5 text-orange-600" />
            Welcome to the AI Comparison Lab!
          </h2>
          <p className="text-gray-700 mb-4">
            Compare <strong>OpenAI GPT-4o-mini</strong> vs <strong>DeepSeek-V3</strong> side-by-side.
            Test quality, speed, and cost savings in real-time.
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-3 rounded border border-blue-200">
              <div className="font-semibold text-blue-900 mb-1">OpenAI GPT-4o-mini</div>
              <div className="text-gray-600">Input: $0.15/1M tokens • Output: $0.60/1M tokens</div>
            </div>
            <div className="bg-white p-3 rounded border border-purple-200">
              <div className="font-semibold text-purple-900 mb-1">DeepSeek-V3</div>
              <div className="text-gray-600">Input: $0.14/1M tokens • Output: $0.28/1M tokens</div>
              <div className="text-green-700 font-semibold mt-1">💰 53% cheaper output!</div>
            </div>
          </div>
        </div>

        {/* Trial Selector */}
        {!loading && trials.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select a trial to test:
            </label>
            <select
              value={selectedTrial?.nctId || ''}
              onChange={(e) => {
                const trial = trials.find(t => t.nctId === e.target.value);
                setSelectedTrial(trial || null);
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              {trials.map((trial) => (
                <option key={trial.nctId} value={trial.nctId}>
                  {trial.title.slice(0, 100)}... ({trial.phase || 'Unknown'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* A/B Test Component */}
        {selectedTrial ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">Selected Trial:</h3>
              <p className="text-sm text-gray-700">{selectedTrial.title}</p>
              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                <span>Phase: {selectedTrial.phase || 'Unknown'}</span>
                <span>Status: {selectedTrial.status}</span>
                <span>Sponsor: {selectedTrial.sponsor}</span>
              </div>
            </div>

            <AISummary
              type="trial"
              data={selectedTrial}
              enableABTest={true}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">
              {loading ? 'Loading trials...' : 'No trials available'}
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 How to Use This Lab:</h3>
          <ol className="space-y-2 text-sm text-gray-700">
            <li><strong>1.</strong> Select a trial from the dropdown above</li>
            <li><strong>2.</strong> Click "🔬 A/B Test: Generate Both" to run both providers</li>
            <li><strong>3.</strong> Compare quality, speed, and cost side-by-side</li>
            <li><strong>4.</strong> Note: DeepSeek requires account balance to work</li>
          </ol>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <strong>⚠️ Note:</strong> DeepSeek account currently has zero balance.
            Add $5-10 at <a href="https://platform.deepseek.com/" target="_blank" className="text-blue-600 underline">platform.deepseek.com</a> to test.
          </div>
        </div>
      </main>
    </div>
  );
}

