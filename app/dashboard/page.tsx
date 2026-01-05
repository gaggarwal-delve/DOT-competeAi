"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Activity, Search, Filter, Download } from "lucide-react";
import { exportTrialsCSV } from "@/lib/csvExport";
import { PhaseDistributionChart } from "@/components/PhaseDistributionChart";
import { StatusBreakdownChart } from "@/components/StatusBreakdownChart";
import { AISummary } from "@/components/AISummary";

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
  
  // New filters
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

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

  // Filter trials based on selected phases and date range
  const filteredTrials = useMemo(() => {
    let filtered = trials;
    
    // Filter by selected phases
    if (selectedPhases.length > 0) {
      filtered = filtered.filter(trial => 
        selectedPhases.includes(trial.phase || 'Unknown')
      );
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      filtered = filtered.filter(trial => {
        if (!trial.startDate) return false;
        const trialDate = new Date(trial.startDate);
        if (dateFrom && trialDate < new Date(dateFrom)) return false;
        if (dateTo && trialDate > new Date(dateTo)) return false;
        return true;
      });
    }
    
    return filtered;
  }, [trials, selectedPhases, dateFrom, dateTo]);

  // Calculate phase distribution from filtered trials
  const phaseDistribution = useMemo(() => {
    const phaseCounts: Record<string, number> = {};
    filteredTrials.forEach(trial => {
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
  }, [filteredTrials]);

  // Calculate status distribution from filtered trials
  const statusDistribution = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredTrials.forEach(trial => {
      const status = trial.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        status,
        count
      }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [filteredTrials]);

  // Available phases for multi-select
  const availablePhases = useMemo(() => {
    const phases = new Set<string>();
    trials.forEach(trial => {
      phases.add(trial.phase || 'Unknown');
    });
    return Array.from(phases).sort();
  }, [trials]);

  // Toggle phase selection
  const togglePhase = (phase: string) => {
    setSelectedPhases(prev =>
      prev.includes(phase)
        ? prev.filter(p => p !== phase)
        : [...prev, phase]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedPhases([]);
    setDateFrom("");
    setDateTo("");
  };

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
              Live data from ClinicalTrials.gov - {filteredTrials.length} of {trials.length} trials
              {(selectedPhases.length > 0 || dateFrom || dateTo) && ' (filtered)'}
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

        {/* Advanced Filters */}
        {trials.length > 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              {(selectedPhases.length > 0 || dateFrom || dateTo) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Multi-select Phases */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Filter by Phase ({selectedPhases.length} selected)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availablePhases.map((phase) => (
                    <label key={phase} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedPhases.includes(phase)}
                        onChange={() => togglePhase(phase)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{phase}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Start Date From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Start Date To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            {/* Active Filter Tags */}
            {(selectedPhases.length > 0 || dateFrom || dateTo) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {selectedPhases.map((phase) => (
                  <span
                    key={phase}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {phase}
                    <button
                      onClick={() => togglePhase(phase)}
                      className="hover:text-blue-900"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {dateFrom && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    From: {dateFrom}
                    <button
                      onClick={() => setDateFrom("")}
                      className="hover:text-green-900"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {dateTo && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    To: {dateTo}
                    <button
                      onClick={() => setDateTo("")}
                      className="hover:text-green-900"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AI Summary
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrials.map((trial) => (
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
                      <td className="px-6 py-4">
                        <AISummary type="trial" data={trial} compact />
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

