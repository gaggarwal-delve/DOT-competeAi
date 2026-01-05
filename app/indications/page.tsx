"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, ChevronRight, Loader2, Home } from "lucide-react";

interface Indication {
  id: number;
  name: string;
  slug: string;
  category: string;
  totalTrials: number;
  activeTrials: number;
  companiesCount: number;
}

export default function IndicationsPage() {
  const [indications, setIndications] = useState<Indication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchIndications = async (reset = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '100',
        offset: reset ? '0' : indications.length.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      
      const response = await fetch(`/api/indications?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        if (reset) {
          setIndications(data.indications || []);
        } else {
          setIndications((prev) => [...prev, ...(data.indications || [])]);
        }
        setCategories(data.categories || []);
        setTotalCount(data.totalCount || 0);
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (error) {
      console.error('Error fetching indications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIndications(true);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-blue-600 transition">
                <Home className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Indications</h1>
                <p className="text-sm text-gray-600">{totalCount.toLocaleString()} therapeutic areas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Categories */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter by Category
              </h3>
              
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition ${
                  selectedCategory === "" ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                All Categories ({totalCount})
              </button>
              
              <div className="max-h-96 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition ${
                      selectedCategory === cat.name ? "bg-blue-100 text-blue-700 font-semibold" : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search indications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Results */}
            {loading && indications.length === 0 ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading indications...</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {indications.map((indication) => (
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

                {/* Load More */}
                {hasMore && (
                  <div className="text-center">
                    <button
                      onClick={() => fetchIndications(false)}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}

                {indications.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No indications found.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

