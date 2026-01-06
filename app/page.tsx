"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, TrendingUp, Database, ChevronRight, Loader2, Activity, Clock, BarChart3, ArrowRight } from "lucide-react";

interface Indication {
  id: number;
  name: string;
  slug: string;
  category: string;
  totalTrials: number;
  activeTrials: number;
  companiesCount: number;
  mostRecentYear?: number;
  yearRange?: string;
  trialCount?: number;
  hasMarketInsight?: boolean;
  hasDrugInsight?: boolean;
  hasEpidemInsight?: boolean;
}

interface TherapeuticArea {
  name: string;
  indicationCount: number;
  totalReports: number;
  mostRecentYear: number | null;
}

interface CategoryGroup {
  category: string;
  count: number;
  indications: Indication[];
}

// Insights Dashboard Component with Tabs
function InsightsDashboard({ 
  therapeuticAreas, 
  recentIndications 
}: { 
  therapeuticAreas: TherapeuticArea[];
  recentIndications: Indication[];
}) {
  const [activeTab, setActiveTab] = useState<'areas' | 'indications'>('areas');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-blue-600" />
        Intelligence Dashboard
      </h3>
      <p className="text-sm text-gray-600 mb-6">Top insights across therapeutic areas and indications</p>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('areas')}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
            activeTab === 'areas'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline-block mr-1.5" />
          Top Therapeutic Areas
        </button>
        <button
          onClick={() => setActiveTab('indications')}
          className={`px-4 py-2 font-semibold text-sm border-b-2 transition ${
            activeTab === 'indications'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 inline-block mr-1.5" />
          Recently Updated
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'areas' && (
        <div className="grid md:grid-cols-2 gap-4 max-h-[450px] overflow-y-auto pr-2">
          {therapeuticAreas.slice(0, 30).map((ta, idx) => (
            <Link
              key={ta.name}
              href={`/indications?category=${encodeURIComponent(ta.name)}`}
              className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-lg hover:shadow-md transition border border-purple-100 hover:border-purple-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center justify-center w-9 h-9 bg-purple-600 text-white rounded-full text-sm font-bold">
                  #{idx + 1}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" />
              </div>
              <p className="font-bold text-gray-900 group-hover:text-purple-700 transition mb-3 text-base">
                {ta.name}
              </p>
              <div className="space-y-1 text-sm text-gray-700">
                <p>{ta.indicationCount} indications</p>
                <p>{ta.totalReports} reports</p>
                {ta.mostRecentYear && (
                  <p className="text-gray-600">Latest: {ta.mostRecentYear}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {activeTab === 'indications' && (
        <div className="grid md:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-2">
          {recentIndications.slice(0, 50).map((indication, idx) => (
            <Link
              key={indication.id}
              href={`/indications/${indication.slug}`}
              className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg hover:shadow-md transition border border-green-100 hover:border-green-300 group"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded-full text-sm font-bold">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  {indication.mostRecentYear}
                </span>
              </div>
              <p className="font-semibold text-gray-900 group-hover:text-green-700 transition mb-2 line-clamp-2">
                {indication.name}
              </p>
              <p className="text-xs text-gray-500 mb-2">{indication.category}</p>
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {indication.hasMarketInsight && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Market</span>
                )}
                {indication.hasDrugInsight && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Drug</span>
                )}
                {indication.hasEpidemInsight && (
                  <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Epidem</span>
                )}
              </div>
              {indication.yearRange && (
                <p className="text-xs text-gray-500 mt-2">Range: {indication.yearRange}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedTA, setSelectedTA] = useState("");
  const [selectedIndication, setSelectedIndication] = useState("");
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [filteredIndications, setFilteredIndications] = useState<Indication[]>([]);
  const [popularIndications, setPopularIndications] = useState<Indication[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingIndications, setLoadingIndications] = useState(false);
  
  // New insights state
  const [recentIndications, setRecentIndications] = useState<Indication[]>([]);
  const [therapeuticAreas, setTherapeuticAreas] = useState<TherapeuticArea[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  // Fetch categories and insights on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch indications and categories
        const [indicationsRes, recentRes, taRes] = await Promise.all([
          fetch('/api/indications?limit=12&orderBy=name'),
          fetch('/api/insights/recent-indications?limit=50'),
          fetch('/api/insights/therapeutic-areas'),
        ]);
        
        const indicationsData = await indicationsRes.json();
        const recentData = await recentRes.json();
        const taData = await taRes.json();
        
        if (indicationsData.success) {
          setPopularIndications(indicationsData.indications || []);
          setCategories(indicationsData.categories || []);
        }
        
        if (recentData.success) {
          setRecentIndications(recentData.indications || []);
        }
        
        if (taData.success) {
          setTherapeuticAreas(taData.therapeuticAreas || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        setLoadingInsights(false);
      }
    };
    
    fetchData();
  }, []);

  // Fetch indications when TA is selected
  useEffect(() => {
    if (!selectedTA) {
      setFilteredIndications([]);
      setSelectedIndication("");
      return;
    }

    const fetchIndications = async () => {
      setLoadingIndications(true);
      try {
        const response = await fetch(`/api/indications?category=${encodeURIComponent(selectedTA)}&limit=1000&orderBy=name`);
        const data = await response.json();
        
        if (data.success) {
          setFilteredIndications(data.indications || []);
        }
      } catch (error) {
        console.error('Error fetching indications:', error);
      } finally {
        setLoadingIndications(false);
      }
    };
    
    fetchIndications();
  }, [selectedTA]);

  // Navigate when indication is selected
  useEffect(() => {
    if (selectedIndication && selectedTA) {
      const indication = filteredIndications.find(i => i.slug === selectedIndication);
      if (indication) {
        window.location.href = `/indications/${indication.slug}`;
      }
    }
  }, [selectedIndication, selectedTA, filteredIndications]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header (Matching Visily Design) */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                CompeteAI V2 Pharmaceutical Competitive Intelligence
              </h1>
            </div>
            <div className="flex gap-4">
              <Link href="/companies" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                Companies
              </Link>
              <Link href="/dashboard" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                All Trials
              </Link>
              <Link href="/news" className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                News
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Compact Hero Section - Top 1/3 */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold mb-3">
                Select Your <span className="text-blue-600">Indication</span>
              </h2>
              <p className="text-base text-gray-600">
                Deep dive into 5,600+ therapeutic areas with clinical trials, companies, and market intelligence
              </p>
            </div>
            
            {/* 2-Step Selection - Horizontal */}
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <label className="block text-left text-xs font-semibold text-gray-700 mb-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs mr-1.5">1</span>
                  Select Therapeutic Area
                </label>
                <select
                  value={selectedTA}
                  onChange={(e) => {
                    setSelectedTA(e.target.value);
                    setSelectedIndication("");
                  }}
                  className="w-full pl-3 pr-8 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition shadow-sm appearance-none bg-white cursor-pointer"
                >
                  <option value="">-- Choose a Therapeutic Area --</option>
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name} ({cat.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-left text-xs font-semibold text-gray-700 mb-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs mr-1.5">2</span>
                  Select Indication
                </label>
                <select
                  value={selectedIndication}
                  onChange={(e) => setSelectedIndication(e.target.value)}
                  disabled={!selectedTA || loadingIndications}
                  className="w-full pl-3 pr-8 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition shadow-sm appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {!selectedTA ? (
                    <option value="">Select TA first →</option>
                  ) : loadingIndications ? (
                    <option value="">Loading...</option>
                  ) : filteredIndications.length === 0 ? (
                    <option value="">No indications found</option>
                  ) : (
                    <>
                      <option value="">-- Choose an Indication --</option>
                      {filteredIndications.map((indication) => (
                        <option key={indication.id} value={indication.slug}>
                          {indication.name}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Stats - Inline with Colors (Matching Visily Design) */}
            <div className="flex items-center justify-center gap-6 py-4 border-t border-gray-100">
              <span className="text-lg font-bold text-blue-600">6,067 Indications</span>
              <span className="text-lg font-bold text-green-600">10,000+ Clinical Trials</span>
              <span className="text-lg font-bold text-gray-900">50+ Companies</span>
              <Link
                href="/indications"
                className="text-sm text-blue-600 hover:underline font-medium inline-flex items-center gap-1.5 ml-2"
              >
                <Search className="w-4 h-4" />
                Browse All
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom 2/3: Side-by-Side Panels */}
        {loadingInsights ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 mt-4">Loading insights...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Left Panel: Intelligence Dashboard */}
              <InsightsDashboard 
                therapeuticAreas={therapeuticAreas}
                recentIndications={recentIndications}
              />

              {/* Right Panel: Quick Browse (Matching Visily Design) */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Search className="w-6 h-6 text-blue-600" />
                  Quick Browse
                </h3>
                <p className="text-sm text-gray-600 mb-6">Choose your exploration path</p>
                
                <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
                  {/* Browse by Therapeutic Area */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                    <h4 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      Browse by Therapeutic Area
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">Explore {categories.length}+ therapeutic areas and their indications</p>
                    <Link
                      href="/indications"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm w-full justify-center text-sm"
                    >
                      View All Indications <ChevronRight className="w-4 h-4" />
                    </Link>
                    
                    {/* TOP AREAS List */}
                    <div className="mt-5">
                      <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">TOP AREAS:</p>
                      <div className="space-y-2">
                        {categories.slice(0, 6).map((cat, idx) => (
                          <Link
                            key={idx}
                            href={`/indications?category=${encodeURIComponent(cat.name)}`}
                            className="flex items-center justify-between p-2.5 bg-white rounded-lg hover:bg-blue-50 transition group"
                          >
                            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{cat.name}</span>
                            <span className="text-sm text-gray-600 font-medium">{cat.count}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
