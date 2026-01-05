"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Activity, Search, Filter, Download } from "lucide-react";
import { exportTrialsCSV } from "@/lib/csvExport";
import { PhaseDistributionChart } from "@/components/PhaseDistributionChart";
import { StatusBreakdownChart } from "@/components/StatusBreakdownChart";

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

export default function DashboardPage() {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchCondition, setSearchCondition] = useState("");
  const [limit, setLimit] = useState("20");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = parseInt(limit);

  const fetchTrials = async (page: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("limit", limit);
      params.append("pageNumber", page.toString());
      if (searchCondition) params.append("condition", searchCondition);

      const response = await fetch(`/api/trials?${params}`);
      const data = await response.json();

      if (data.success) {
        if (append) {
          setTrials(prev => [...prev, ...data.trials]);
        } else {
          setTrials(data.trials);
        }
        setTotalResults(data.totalResults || data.trials.length);
        setCurrentPage(page);
      } else {
        setError(data.error || "Failed to fetch trials");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    fetchTrials(currentPage + 1, true);
  };

  useEffect(() => {
    fetchTrials();
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTrials(1, false);
  };

  const handleExportCSV = () => {
    if (trials.length === 0) {
      alert("No trials to export");
      return;
    }
    exportTrialsCSV(trials);
  };

  // Calculate phase distribution
  const phaseDistribution = useMemo(() => {
    const phaseCounts: Record<string, number> = {};
    trials.forEach(trial => {
      const phase = trial.phase || 'Unknown';
      phaseCounts[phase] = (phaseCounts[phase] || 0) + 1;
    });
    
    // Sort by phase order
    const phaseOrder = ['Early Phase 1', 'Phase 1', 'Phase 1/Phase 2', 'Phase 2', 'Phase 2/Phase 3', 'Phase 3', 'Phase 4', 'Not Applicable', 'Unknown'];
    return phaseOrder
      .filter(phase => phaseCounts[phase])
      .map(phase => ({
        phase,
        count: phaseCounts[phase]
      }));
  }, [trials]);

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    trials.forEach(trial => {
      const status = trial.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [trials]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Compete<span className="text-blue-600">AI</span>
            </Link>
            <nav className="flex gap-6">
              <Link href="/dashboard" className="text-blue-600 font-semibold">
                Trials
              </Link>
              <Link href="/dashboard/companies" className="text-gray-600 hover:text-gray-900">
                Companies
              </Link>
              <Link href="/dashboard/news" className="text-gray-600 hover:text-gray-900">
                News
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Clinical Trials</h1>
            <p className="text-gray-600">
              Live data from ClinicalTrials.gov - {trials.length} trials loaded
            </p>
          </div>
          {trials.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Search/Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Condition
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchCondition}
                  onChange={(e) => setSearchCondition(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="e.g., Cancer, Diabetes, COVID-19"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limit
              </label>
              <select
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10 trials</option>
                <option value="20">20 trials</option>
                <option value="50">50 trials</option>
                <option value="100">100 trials</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Loading..." : "Search"}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        {trials.length > 0 && !loading && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <PhaseDistributionChart data={phaseDistribution} />
            <StatusBreakdownChart data={statusDistribution} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Trials Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <Activity className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading trials from ClinicalTrials.gov...</p>
            </div>
          ) : trials.length === 0 ? (
            <div className="p-12 text-center">
              <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No trials found. Try a different search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NCT ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sponsor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trials.map((trial) => (
                    <tr key={trial.nctId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-mono text-sm"
                        >
                          {trial.nctId}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {trial.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {trial.conditions.slice(0, 2).join(", ")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trial.sponsor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {trial.phase}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            trial.status.includes("Recruiting")
                              ? "bg-green-100 text-green-800"
                              : trial.status.includes("Completed")
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {trial.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trial.enrollmentCount ? trial.enrollmentCount.toLocaleString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination / Load More */}
          {!loading && trials.length > 0 && trials.length >= itemsPerPage && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{trials.length}</span> trial{trials.length !== 1 ? 's' : ''}
                  {totalResults > trials.length && (
                    <span> of {totalResults}+ available</span>
                  )}
                </div>
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {loading ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Load More Trials
                    </>
                  )}
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500 text-center">
                Page {currentPage} • Use "Load More" to fetch additional results from ClinicalTrials.gov
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

