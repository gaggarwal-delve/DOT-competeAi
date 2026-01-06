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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Compete<span className="text-blue-600">AI</span> <span className="text-xl font-normal text-gray-500">V2</span>
            </h1>
              <p className="text-sm text-gray-600 mt-1">Pharmaceutical Competitive Intelligence</p>
            </div>
            <div className="flex gap-3">
              <Link href="/companies" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                Companies
              </Link>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                All Trials
              </Link>
              <Link href="/news" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition">
                News
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Select Your <span className="text-blue-600">Indication</span>
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Deep dive into 5,600+ therapeutic areas with clinical trials, companies, and market intelligence
          </p>
          
          {/* 2-Step Selection */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Step 1: Select Therapeutic Area */}
              <div className="relative">
                <label className="block text-left text-sm font-semibold text-gray-700 mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs mr-2">1</span>
                  Select Therapeutic Area
                </label>
                <div className="relative">
                  <select
                    value={selectedTA}
                    onChange={(e) => {
                      setSelectedTA(e.target.value);
                      setSelectedIndication("");
                    }}
                    className="w-full pl-4 pr-10 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition shadow-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="">-- Choose a Therapeutic Area --</option>
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name} ({cat.count} indications)
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              {/* Step 2: Select Indication */}
              <div className="relative">
                <label className="block text-left text-sm font-semibold text-gray-700 mb-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs mr-2">2</span>
                  Select Indication
                </label>
                <div className="relative">
                  <select
                    value={selectedIndication}
                    onChange={(e) => setSelectedIndication(e.target.value)}
                    disabled={!selectedTA || loadingIndications}
                    className="w-full pl-4 pr-10 py-4 text-base border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition shadow-sm appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400"
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
                  <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Search Link */}
            <div className="mt-6">
              <Link
                href="/indications"
                className="text-sm text-blue-600 hover:underline font-medium inline-flex items-center gap-1"
              >
                <Search className="w-4 h-4" />
                Or browse & search all 5,600+ indications
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Database className="w-10 h-10 text-blue-600 mb-3" />
            <p className="text-3xl font-bold text-gray-900">6,067</p>
            <p className="text-sm text-gray-600">Indications</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <TrendingUp className="w-10 h-10 text-green-600 mb-3" />
            <p className="text-3xl font-bold text-gray-900">10,000+</p>
            <p className="text-sm text-gray-600">Clinical Trials</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Database className="w-10 h-10 text-purple-600 mb-3" />
            <p className="text-3xl font-bold text-gray-900">50+</p>
            <p className="text-sm text-gray-600">Companies</p>
          </div>
        </div>

        {/* Insights Sections */}
        {loadingInsights ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 mt-4">Loading insights...</p>
          </div>
        ) : (
          <>
            {/* Most Active Therapeutic Areas */}
            <div className="max-w-6xl mx-auto mb-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  Most Active Therapeutic Areas
                </h3>
                <p className="text-sm text-gray-600 mb-6">Ranked by number of indications and research reports</p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {therapeuticAreas.slice(0, 30).map((ta, idx) => (
                    <Link
                      key={ta.name}
                      href={`/indications?category=${encodeURIComponent(ta.name)}`}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg hover:shadow-md transition border border-purple-100 hover:border-purple-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold">
                          #{idx + 1}
                        </span>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition" />
                      </div>
                      <p className="font-semibold text-gray-900 group-hover:text-purple-700 transition mb-2 line-clamp-2">
                        {ta.name}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{ta.indicationCount} indications</span>
                        <span>{ta.totalReports} reports</span>
                      </div>
                      {ta.mostRecentYear && (
                        <p className="text-xs text-gray-500 mt-1">Latest: {ta.mostRecentYear}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recently Updated Indications */}
            <div className="max-w-6xl mx-auto mb-12">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="w-6 h-6 text-green-600" />
                  Recently Updated Indications
                </h3>
                <p className="text-sm text-gray-600 mb-6">Latest published research and reports (2020-2035)</p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
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
                      <div className="flex items-center gap-2 text-xs">
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
              </div>
            </div>

            {/* Popular Indications */}
            <div className="max-w-6xl mx-auto mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                Browse Indications
              </h3>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {popularIndications.slice(0, 12).map((indication) => (
                  <Link
                    key={indication.id}
                    href={`/indications/${indication.slug}`}
                    className="bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 hover:border-blue-300 group"
                  >
                    <p className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition line-clamp-2">
                      {indication.name}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">{indication.category}</p>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{indication.totalTrials || 0} trials</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link
                  href="/indications"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Browse All 6,000+ Indications <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Categories */}
            <div className="max-w-6xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">By Therapeutic Area</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.slice(0, 12).map((cat, idx) => (
                  <Link
                    key={idx}
                    href={`/indications?category=${encodeURIComponent(cat.name)}`}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 hover:border-blue-300 group flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{cat.name}</p>
                      <p className="text-sm text-gray-500">{cat.count} indications</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
