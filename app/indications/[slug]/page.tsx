"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Home, ChevronRight, Activity, Building2, Newspaper, 
  BarChart3, Loader2, ArrowLeft, TrendingUp, Users, FileText 
} from "lucide-react";

interface Indication {
  id: number;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  totalTrials: number;
  activeTrials: number;
  companiesCount: number;
  reportTypes: string[];
}

type TabType = "overview" | "trials" | "companies" | "news" | "analysis";

export default function IndicationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [indication, setIndication] = useState<Indication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIndication = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/indications/${slug}`);
        const data = await response.json();
        
        if (data.success) {
          setIndication(data.indication);
        } else {
          setError(data.message || 'Indication not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load indication');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchIndication();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading indication...</p>
        </div>
      </div>
    );
  }

  if (error || !indication) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl mb-4">❌ {error || 'Indication not found'}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "trials", label: "Clinical Trials", icon: Activity },
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "news", label: "News & Events", icon: Newspaper },
    { id: "analysis", label: "Competitive Analysis", icon: TrendingUp },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <Link href="/" className="hover:text-blue-600 transition">
              <Home className="w-4 h-4" />
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/indications" className="hover:text-blue-600 transition">
              Indications
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{indication.name}</span>
          </div>
          
          {/* Title */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{indication.name}</h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {indication.category}
                </span>
                {indication.reportTypes.length > 0 && (
                  <span className="text-gray-600 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {indication.reportTypes.join(', ')}
                  </span>
                )}
              </div>
            </div>
            
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-90">Clinical Trials</span>
              </div>
              <p className="text-3xl font-bold">{indication.totalTrials}</p>
              <p className="text-sm opacity-80">{indication.activeTrials} active</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-90">Companies</span>
              </div>
              <p className="text-3xl font-bold">{indication.companiesCount}</p>
              <p className="text-sm opacity-80">Working on this</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-90">Market Data</span>
              </div>
              <p className="text-3xl font-bold">Coming Soon</p>
              <p className="text-sm opacity-80">Pipeline value</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "overview" && <OverviewTab indication={indication} />}
        {activeTab === "trials" && <TrialsTab indicationSlug={indication.slug} />}
        {activeTab === "companies" && <CompaniesTab indicationSlug={indication.slug} />}
        {activeTab === "news" && <NewsTab indicationSlug={indication.slug} />}
        {activeTab === "analysis" && <AnalysisTab indicationSlug={indication.slug} />}
      </div>
    </div>
  );
}

// ===== Tab Components =====

function OverviewTab({ indication }: { indication: Indication }) {
  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
        <p className="text-gray-700 mb-4">
          {indication.description || `Comprehensive overview of ${indication.name} including clinical trials, competitive landscape, and market intelligence.`}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Report Types Available</h3>
            <ul className="space-y-1">
              {indication.reportTypes.length > 0 ? (
                indication.reportTypes.map((type) => (
                  <li key={type} className="text-sm text-gray-600">✓ {type}</li>
                ))
              ) : (
                <li className="text-sm text-gray-500 italic">No reports available yet</li>
              )}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>Total Trials: {indication.totalTrials}</li>
              <li>Active Trials: {indication.activeTrials}</li>
              <li>Companies: {indication.companiesCount}</li>
              <li>Therapeutic Area: {indication.category}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">🚧 V2 Feature: Charts & Visualizations</h3>
        <p className="text-sm text-blue-800">
          Coming soon: Phase distribution chart, Trial timeline, Company market share, and more data visualizations.
        </p>
      </div>
    </div>
  );
}

function TrialsTab({ indicationSlug }: { indicationSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical Trials</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium mb-2">🔗 Linking Trials to Indications</p>
        <p className="text-sm text-yellow-700">
          This feature requires linking clinical trial "conditions" to our indication database. Coming in next step.
        </p>
      </div>
    </div>
  );
}

function CompaniesTab({ indicationSlug }: { indicationSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Companies Working on This Indication</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium mb-2">🔗 Linking Companies to Indications</p>
        <p className="text-sm text-yellow-700">
          This feature requires analyzing which companies are working on trials for this indication. Coming in next step.
        </p>
      </div>
    </div>
  );
}

function NewsTab({ indicationSlug }: { indicationSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">News & Events</h2>
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800 font-medium mb-2">📰 Indication-Specific News</p>
        <p className="text-sm text-yellow-700">
          News filtering by indication requires semantic analysis or keyword matching. Coming in next step.
        </p>
      </div>
    </div>
  );
}

function AnalysisTab({ indicationSlug }: { indicationSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Competitive Analysis</h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 font-medium mb-2">📊 Market Intelligence</p>
        <p className="text-sm text-blue-700">
          Competitive positioning, market share, pipeline strength, and deal landscape analysis coming soon.
        </p>
      </div>
    </div>
  );
}

