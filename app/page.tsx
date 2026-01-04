import Link from "next/link";
import { ArrowRight, Database, Activity, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              Welcome to Compete<span className="text-blue-600">AI</span>
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Pharmaceutical Competitive Intelligence Dashboard
            </p>
            <p className="text-lg text-gray-500 mb-12">
              Track 10,000+ clinical trials, 50+ pharma companies, and real-time market intelligence
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
              >
                Clinical Trials <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/companies"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition"
              >
                Companies <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 transition"
              >
                News <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <Activity className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Clinical Trials</h3>
              <p className="text-gray-600">Real-time tracking from ClinicalTrials.gov</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <Database className="w-12 h-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Companies</h3>
              <p className="text-gray-600">50+ pharma & biotech profiles</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Intelligence</h3>
              <p className="text-gray-600">News, deals, and regulatory events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

