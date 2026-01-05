"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, TrendingUp, Database, ChevronRight, Loader2 } from "lucide-react";

interface Indication {
  id: number;
  name: string;
  slug: string;
  category: string;
  totalTrials: number;
  activeTrials: number;
  companiesCount: number;
}

interface CategoryGroup {
  category: string;
  count: number;
  indications: Indication[];
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Indication[]>([]);
  const [searching, setSearching] = useState(false);
  const [popularIndications, setPopularIndications] = useState<Indication[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch popular indications and categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/indications?limit=12&orderBy=name');
        const data = await response.json();
        
        if (data.success) {
          setPopularIndications(data.indications || []);
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Error fetching indications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Search indications
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const searchDebounced = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/indications?search=${encodeURIComponent(searchQuery)}&limit=10`);
        const data = await response.json();
        
        if (data.success) {
          setSearchResults(data.indications || []);
        }
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [searchQuery]);

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
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Select Your <span className="text-blue-600">Indication</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Deep dive into 6,000+ therapeutic areas with clinical trials, companies, and market intelligence
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search indications (e.g., Breast Cancer, Diabetes, Alzheimer's)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition shadow-sm"
              />
              {searching && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 w-5 h-5 animate-spin" />
              )}
            </div>
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                {searchResults.map((indication) => (
                  <Link
                    key={indication.id}
                    href={`/indications/${indication.slug}`}
                    className="block px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{indication.name}</p>
                        <p className="text-sm text-gray-500">{indication.category}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {searchQuery.length >= 2 && searchResults.length === 0 && !searching && (
              <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 text-center text-gray-500">
                No indications found for "{searchQuery}"
              </div>
            )}
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

        {/* Popular Indications */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <p className="text-gray-600 mt-4">Loading indications...</p>
          </div>
        ) : (
          <>
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
