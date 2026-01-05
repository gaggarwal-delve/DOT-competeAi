'use client';

import { useState, useEffect } from 'react';
import { FaBuilding, FaGlobe, FaMapMarkerAlt, FaFlask, FaNewspaper, FaCalendar, FaFilter, FaDownload } from 'react-icons/fa';
import Link from 'next/link';
import { exportCompaniesCSV } from '@/lib/csvExport';

interface Company {
  id: number;
  name: string;
  headquarters: string | null;
  website: string | null;
  therapyAreas: string[];
  foundedYear: number | null;
  _count: {
    trials: number;
    newsItems: number;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTherapyArea, setSelectedTherapyArea] = useState('');

  // Extract all unique therapy areas
  const allTherapyAreas = Array.from(
    new Set(companies.flatMap((c) => c.therapyAreas))
  ).sort();

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedTherapyArea) params.append('therapyArea', selectedTherapyArea);

        const res = await fetch(`/api/companies?${params.toString()}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch companies');
        }
        const data: Company[] = await res.json();
        setCompanies(data);
      } catch (err) {
        setError((err as Error).message);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [searchTerm, selectedTherapyArea]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleExportCSV = () => {
    if (companies.length === 0) {
      alert('No companies to export');
      return;
    }
    
    // Transform data for CSV export
    const exportData = companies.map(company => ({
      name: company.name,
      headquarters: company.headquarters,
      website: company.website,
      focusAreas: company.therapyAreas.join(', '),
      pipelineCount: company._count.trials,
      newsCount: company._count.newsItems,
      foundedYear: company.foundedYear
    }));
    
    exportCompaniesCSV(exportData);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-8">
        <FaBuilding className="text-4xl text-blue-600 mr-4" />
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Pharmaceutical Companies</h1>
          <p className="text-gray-600 mt-1">Top 50 pharma & biotech companies worldwide</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by company name or location..."
              className="flex-grow p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Therapy Area Filter & Export */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by Therapy Area:</span>
            <select
              value={selectedTherapyArea}
              onChange={(e) => setSelectedTherapyArea(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Areas</option>
              {allTherapyAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            {companies.length > 0 && (
              <span className="text-sm text-gray-600">{companies.length} companies found</span>
            )}
          </div>
          
          {/* Export Button */}
          {companies.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-600">Loading companies...</p>
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
      {!loading && !error && companies.length === 0 && (
        <div className="text-center py-10">
          <FaBuilding className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No companies found</p>
          <p className="text-sm text-gray-500 mt-2">
            {searchTerm || selectedTherapyArea
              ? 'Try adjusting your search or filters'
              : 'Database is empty. Run seed script to populate companies.'}
          </p>
        </div>
      )}

      {/* Companies Grid */}
      {!loading && !error && companies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <div
              key={company.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <div className="p-6">
                {/* Company Header */}
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{company.name}</h2>
                  {company.headquarters && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      {company.headquarters}
                    </div>
                  )}
                  {company.foundedYear && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendar className="mr-2 text-blue-500" />
                      Founded {company.foundedYear}
                    </div>
                  )}
                </div>

                {/* Therapy Areas */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Therapy Areas:</p>
                  <div className="flex flex-wrap gap-2">
                    {company.therapyAreas.map((area) => (
                      <span
                        key={area}
                        className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{company._count.trials}</div>
                    <div className="text-xs text-gray-600">Trials</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{company._count.newsItems}</div>
                    <div className="text-xs text-gray-600">News</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaGlobe className="mr-2" />
                      Website
                    </a>
                  )}
                  <Link
                    href={`/dashboard?company=${encodeURIComponent(company.name)}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaFlask className="mr-2" />
                    Trials
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Demo Data Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Demo Mode:</strong> Currently showing {companies.length} sample companies.
          For full database with 50+ companies, set up Vercel Postgres and run <code className="bg-blue-100 px-2 py-1 rounded">npm run db:seed</code>.
          See <code className="bg-blue-100 px-2 py-1 rounded">SETUP_VERCEL_POSTGRES.md</code> for instructions.
        </p>
      </div>
    </div>
  );
}

