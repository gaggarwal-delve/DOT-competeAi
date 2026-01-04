'use client';

import { useState, useEffect } from 'react';
import { FaNewspaper, FaExternalLinkAlt, FaClock, FaUser, FaFilter } from 'react-icons/fa';

interface Article {
  title: string;
  description: string;
  url: string;
  source: string;
  author: string;
  publishedAt: string;
  urlToImage: string | null;
  content: string;
}

interface NewsResponse {
  totalResults: number;
  articles: Article[];
}

export default function NewsPage() {
  const [news, setNews] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('(pharmaceutical OR pharma OR biotech) AND (drug OR trial OR FDA OR approval OR clinical)');
  const [currentQuery, setCurrentQuery] = useState('(pharmaceutical OR pharma OR biotech) AND (drug OR trial OR FDA OR approval OR clinical)');
  const [sortBy, setSortBy] = useState('publishedAt');
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/news?query=${encodeURIComponent(currentQuery)}&pageSize=20&sortBy=${sortBy}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch news');
        }
        const data: NewsResponse = await res.json();
        setNews(data.articles);
        setTotalResults(data.totalResults);
      } catch (err) {
        setError((err as Error).message);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [currentQuery, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentQuery(searchQuery);
  };

  const handleQuickFilter = (query: string) => {
    setSearchQuery(query);
    setCurrentQuery(query);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <FaNewspaper className="text-4xl text-blue-600 mr-4" />
        <h1 className="text-4xl font-bold text-gray-900">Pharma News Feed</h1>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharma news (e.g., 'Pfizer FDA approval')"
              className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick Filters */}
        <div className="flex items-center space-x-2 mb-4">
          <FaFilter className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
          <button
            onClick={() => handleQuickFilter('(FDA OR EMA) AND (approval OR breakthrough)')}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            Regulatory
          </button>
          <button
            onClick={() => handleQuickFilter('(phase 3 OR phase 2) AND (clinical trial OR trial results)')}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
          >
            Trials
          </button>
          <button
            onClick={() => handleQuickFilter('(merger OR acquisition OR partnership) AND (pharma OR biotech)')}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
          >
            M&A
          </button>
          <button
            onClick={() => handleQuickFilter('(gene therapy OR CRISPR OR mRNA OR CAR-T)')}
            className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
          >
            Gene Therapy
          </button>
          <button
            onClick={() => handleQuickFilter('(Pfizer OR Roche OR Moderna OR BioNTech OR Novartis)')}
            className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-full hover:bg-indigo-200 transition-colors"
          >
            Top Companies
          </button>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="publishedAt">Most Recent</option>
            <option value="relevancy">Most Relevant</option>
            <option value="popularity">Most Popular</option>
          </select>
          {totalResults > 0 && (
            <span className="text-sm text-gray-600">
              {totalResults.toLocaleString()} results found
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">Loading pharma news...</p>
          <div className="mt-4 animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && news.length === 0 && (
        <div className="text-center py-10">
          <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No news found for &quot;{currentQuery}&quot;</p>
          <p className="text-sm text-gray-500 mt-2">Try a different search term or filter</p>
        </div>
      )}

      {/* News Articles Grid */}
      {!loading && !error && news.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {news.map((article, index) => (
            <article
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Article Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        {article.title}
                        <FaExternalLinkAlt className="ml-2 text-sm text-blue-500" />
                      </a>
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <span className="font-semibold text-blue-600">{article.source}</span>
                      {article.author && article.author !== 'Unknown' && (
                        <span className="flex items-center">
                          <FaUser className="mr-1" />
                          {article.author}
                        </span>
                      )}
                      <span className="flex items-center">
                        <FaClock className="mr-1" />
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Article Description */}
                <p className="text-gray-700 text-base mb-4 leading-relaxed">
                  {article.description || article.content?.substring(0, 200) + '...' || 'No description available.'}
                </p>

                {/* Read More Link */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                >
                  Read full article
                  <FaExternalLinkAlt className="ml-2 text-xs" />
                </a>
              </div>

              {/* Article Image (if available) */}
              {article.urlToImage && (
                <div className="h-48 bg-gray-200">
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* API Key Notice */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>💡 Note:</strong> Add your NewsAPI key to <code className="bg-yellow-100 px-2 py-1 rounded">NEWS_API_KEY</code> in environment variables for live news.
          Get a free key at <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">newsapi.org</a>.
          Currently showing demo data.
        </p>
      </div>
    </div>
  );
}

