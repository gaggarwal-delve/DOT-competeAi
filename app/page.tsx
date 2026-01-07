"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, BarChart3, Database, ChevronRight, Loader2, ArrowRight } from "lucide-react";

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

// Intelligence Dashboard Component - Clean Visily Design
function IntelligenceDashboard({ 
  therapeuticAreas, 
  recentIndications 
}: { 
  therapeuticAreas: TherapeuticArea[];
  recentIndications: Indication[];
}) {
  const [activeTab, setActiveTab] = useState<'areas' | 'indications'>('areas');

  const getBadgeColor = (idx: number) => {
    if (idx === 0) return 'bg-blue-600 text-white';
    if (idx === 1) return 'bg-green-500 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  return (
    <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-gray-600" />
        <h3 className="text-xl font-bold text-gray-900">Intelligence Dashboard</h3>
      </div>
      <p className="text-sm text-gray-600 mb-6">Top insights across therapeutic areas and indications</p>
      
      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('areas')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'areas'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Top Therapeutic Areas
        </button>
        <button
          onClick={() => setActiveTab('indications')}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'indications'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <span className="text-gray-400">⏱</span>
          Recently Updated
        </button>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'areas' && (
        <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {therapeuticAreas.slice(0, 30).map((ta, idx) => (
            <Link
              key={ta.name}
              href={`/indications?category=${encodeURIComponent(ta.name)}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 group"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${getBadgeColor(idx)}`}>
                  #{idx + 1}
                </span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="font-bold text-gray-900 mb-3 text-base">{ta.name}</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{ta.indicationCount} indications</p>
                <p>{ta.totalReports} reports</p>
                {ta.mostRecentYear && <p>Latest: {ta.mostRecentYear}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {activeTab === 'indications' && (
        <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
          {recentIndications.slice(0, 50).map((indication, idx) => (
            <Link
              key={indication.id}
              href={`/indications/${indication.slug}`}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all duration-200 group"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 bg-gray-200 text-gray-700 rounded-full text-sm font-bold">
                  #{idx + 1}
                </span>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded">
                  {indication.mostRecentYear}
                </span>
              </div>
              <p className="font-bold text-gray-900 mb-2 text-base line-clamp-2">{indication.name}</p>
              <p className="text-xs text-gray-500">{indication.category}</p>
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
  const [loading, setLoading] = useState(true);
  const [loadingIndications, setLoadingIndications] = useState(false);
  
  const [recentIndications, setRecentIndications] = useState<Indication[]>([]);
  const [therapeuticAreas, setTherapeuticAreas] = useState<TherapeuticArea[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [indicationsRes, recentRes, taRes] = await Promise.all([
          fetch('/api/indications?limit=12&orderBy=name'),
          fetch('/api/insights/recent-indications?limit=50'),
          fetch('/api/insights/therapeutic-areas'),
        ]);
        
        const indicationsData = await indicationsRes.json();
        const recentData = await recentRes.json();
        const taData = await taRes.json();
        
        if (indicationsData.success) {
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

  useEffect(() => {
    if (selectedIndication && selectedTA) {
      const indication = filteredIndications.find(i => i.slug === selectedIndication);
      if (indication) {
        window.location.href = `/indications/${indication.slug}`;
      }
    }
  }, [selectedIndication, selectedTA, filteredIndications]);

  return (
    <div className="min-h-screen">
      <div className="p-6">
        {/* Select Your Indication Section - Clean Blue Background */}
        <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Select Your <span className="text-blue-600">Indication</span>
          </h2>
          <p className="text-base text-gray-600 mb-8">
            Deep dive into 5,600+ therapeutic areas with clinical trials, companies, and market intelligence
          </p>
          
          {/* 2-Step Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-xs mr-2 font-bold">1</span>
                Select Therapeutic Area
              </label>
              <select
                value={selectedTA}
                onChange={(e) => {
                  setSelectedTA(e.target.value);
                  setSelectedIndication("");
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all text-sm"
              >
                <option value="">-- Choose a Therapeutic Area --</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count} indications)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white rounded-full text-xs mr-2 font-bold">2</span>
                Select Indication
              </label>
              <select
                value={selectedIndication}
                onChange={(e) => setSelectedIndication(e.target.value)}
                disabled={!selectedTA || loadingIndications}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-sm"
              >
                {!selectedTA ? (
                  <option value="">Select TA first →</option>
                ) : loadingIndications ? (
                  <option value="">Loading indications...</option>
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

          {/* Metrics Row */}
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-blue-600 mb-1">6,067</span>
              <span className="text-sm text-gray-600">Indications</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-green-600 mb-1">10,000+</span>
              <span className="text-sm text-gray-600">Clinical Trials</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-gray-900 mb-1">50+</span>
              <span className="text-sm text-gray-600">Companies</span>
            </div>
            <Link
              href="/indications"
              className="text-sm text-blue-600 hover:underline font-medium inline-flex items-center gap-1.5 ml-auto"
            >
              <Search className="w-4 h-4" />
              Browse All
            </Link>
          </div>
        </div>

        {/* Bottom Section: No Gap Between Panels */}
        {loadingInsights ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 mt-4">Loading insights...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left: Intelligence Dashboard */}
            <IntelligenceDashboard 
              therapeuticAreas={therapeuticAreas}
              recentIndications={recentIndications}
            />

            {/* Right: Quick Browse */}
            <div className="bg-white rounded-lg p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Quick Browse</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6">Choose your exploration path</p>
              
              {/* Browse by Therapeutic Area */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Database className="w-5 h-5 text-blue-600" />
                  <h4 className="text-base font-bold text-gray-900">Browse by Therapeutic Area</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4">Explore {categories.length}+ therapeutic areas and their indications</p>
                <Link
                  href="/indications"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all w-full justify-center text-sm mb-5"
                  style={{ boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)' }}
                >
                  View All Indications <ChevronRight className="w-4 h-4" />
                </Link>
                
                {/* TOP AREAS List */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">TOP AREAS:</p>
                  <div className="space-y-2">
                    {categories.slice(0, 6).map((cat, idx) => (
                      <Link
                        key={idx}
                        href={`/indications?category=${encodeURIComponent(cat.name)}`}
                        className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-sm border border-gray-100"
                      >
                        <span className="font-medium text-gray-900">{cat.name}</span>
                        <span className="text-gray-600 font-medium">{cat.count}</span>
                      </Link>
                    ))}
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
