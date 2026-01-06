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
  hasMarketInsight: boolean;
  hasDrugInsight: boolean;
  hasEpidemInsight: boolean;
  mostRecentYear: number | null;
  yearRange: string | null;
  totalReports: number;
}

type TabType = "overview" | "trials" | "companies" | "news" | "analysis";

export default function IndicationDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const [indication, setIndication] = useState<Indication | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [error, setError] = useState<string | null>(null);
  
  // Real-time metrics
  const [liveMetrics, setLiveMetrics] = useState({
    totalTrials: 0,
    activeTrials: 0,
    companiesCount: 0,
    loadingMetrics: true
  });

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

  // Fetch live metrics when indication is loaded
  useEffect(() => {
    const fetchLiveMetrics = async () => {
      if (!indication?.name) return;
      
      setLiveMetrics(prev => ({ ...prev, loadingMetrics: true }));
      
      try {
        // Fetch trials data
        const trialsResponse = await fetch(`/api/trials?condition=${encodeURIComponent(indication.name)}`);
        const trialsData = await trialsResponse.json();
        
        const totalTrials = trialsData.success ? (trialsData.totalCount || trialsData.trials?.length || 0) : 0;
        const activeTrials = trialsData.success 
          ? trialsData.trials?.filter((t: any) => 
              t.status?.toLowerCase().includes('recruiting') || 
              t.status?.toLowerCase().includes('active')
            ).length || 0
          : 0;
        
        // Fetch companies data (unique sponsors)
        const companiesCount = trialsData.success
          ? new Set(trialsData.trials?.map((t: any) => t.sponsor).filter(Boolean)).size
          : 0;
        
        setLiveMetrics({
          totalTrials,
          activeTrials,
          companiesCount,
          loadingMetrics: false
        });
      } catch (err) {
        console.error('Error fetching live metrics:', err);
        setLiveMetrics(prev => ({ ...prev, loadingMetrics: false }));
      }
    };
    
    fetchLiveMetrics();
  }, [indication?.name]);

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
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  {indication.category}
                </span>
                
                {/* Insight Badges */}
                {indication.hasMarketInsight && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                    ✓ Market Insight
                  </span>
                )}
                {indication.hasDrugInsight && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    ✓ Drug Insight
                  </span>
                )}
                {indication.hasEpidemInsight && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                    ✓ Epidem Insight
                  </span>
                )}
                
                {/* Year Info */}
                {indication.mostRecentYear && (
                  <span className="text-gray-600 flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {indication.yearRange || indication.mostRecentYear}
                  </span>
                )}
                
                {indication.totalReports > 0 && (
                  <span className="text-gray-500 text-xs">
                    {indication.totalReports} {indication.totalReports === 1 ? 'report' : 'reports'}
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
              {liveMetrics.loadingMetrics ? (
                <p className="text-3xl font-bold text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin inline-block" />
                </p>
              ) : (
                <>
                  <p className="text-3xl font-bold">{liveMetrics.totalTrials}</p>
                  <p className="text-sm opacity-80">{liveMetrics.activeTrials} active</p>
                </>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-5 h-5 opacity-80" />
                <span className="text-sm opacity-90">Companies</span>
              </div>
              {liveMetrics.loadingMetrics ? (
                <p className="text-3xl font-bold text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin inline-block" />
                </p>
              ) : (
                <>
                  <p className="text-3xl font-bold">{liveMetrics.companiesCount}</p>
                  <p className="text-sm opacity-80">Unique sponsors</p>
                </>
              )}
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
        
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Available Insights</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {indication.hasMarketInsight ? (
                  <>
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-sm text-gray-700">Market Insight</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">○</span>
                    <span className="text-sm text-gray-400">Market Insight</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {indication.hasDrugInsight ? (
                  <>
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-sm text-gray-700">Drug/Pipeline Insight</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">○</span>
                    <span className="text-sm text-gray-400">Drug/Pipeline Insight</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {indication.hasEpidemInsight ? (
                  <>
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-sm text-gray-700">Epidemiology Insight</span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-400">○</span>
                    <span className="text-sm text-gray-400">Epidemiology Insight</span>
                  </>
                )}
              </div>
            </div>
            
            {indication.totalReports > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                {indication.totalReports} total {indication.totalReports === 1 ? 'report' : 'reports'}
              </p>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Clinical Trial Data</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><strong className="text-gray-900">{indication.totalTrials}</strong> Total Trials</li>
              <li><strong className="text-gray-900">{indication.activeTrials}</strong> Active Trials</li>
              <li><strong className="text-gray-900">{indication.companiesCount}</strong> Companies</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Publication Info</h3>
            {indication.mostRecentYear ? (
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Latest: <strong className="text-gray-900">{indication.mostRecentYear}</strong></li>
                {indication.yearRange && (
                  <li>Range: <strong className="text-gray-900">{indication.yearRange}</strong></li>
                )}
                <li>Category: <strong className="text-gray-900">{indication.category}</strong></li>
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">Year data not available</p>
            )}
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
  const [trials, setTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrials = async () => {
      setLoading(true);
      try {
        // Get indication name first
        const indResponse = await fetch(`/api/indications/${indicationSlug}`);
        const indData = await indResponse.json();
        
        if (indData.success) {
          const indicationName = indData.indication.name;
          
          // Fetch trials from ClinicalTrials.gov API filtered by indication name as condition
          const trialsResponse = await fetch(`/api/trials?condition=${encodeURIComponent(indicationName)}&limit=20`);
          const trialsData = await trialsResponse.json();
          
          if (trialsData.success) {
            setTrials(trialsData.trials || []);
          } else {
            setError(trialsData.message || 'Failed to load trials');
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load trials');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrials();
  }, [indicationSlug]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading trials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Clinical Trials ({trials.length})</h2>
        <Link
          href={`/dashboard?search=${indicationSlug}`}
          className="text-sm text-blue-600 hover:underline"
        >
          View all →
        </Link>
      </div>
      
      {trials.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No trials found for this indication.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {trials.slice(0, 10).map((trial: any) => (
            <div key={trial.nctId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg flex-1 pr-4">{trial.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  trial.status === 'Recruiting' ? 'bg-green-100 text-green-700' :
                  trial.status === 'Active, not recruiting' ? 'bg-blue-100 text-blue-700' :
                  trial.status === 'Completed' ? 'bg-gray-100 text-gray-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {trial.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                <div>
                  <span className="text-gray-500">Phase:</span>
                  <p className="font-medium text-gray-900">{trial.phase || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Sponsor:</span>
                  <p className="font-medium text-gray-900">{trial.sponsor || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Enrollment:</span>
                  <p className="font-medium text-gray-900">{trial.enrollmentCount || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Start Date:</span>
                  <p className="font-medium text-gray-900">{trial.startDate ? new Date(trial.startDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              {trial.conditions && trial.conditions.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-500">Conditions: </span>
                  <span className="text-xs text-gray-700">{trial.conditions.slice(0, 3).join(', ')}</span>
                </div>
              )}
              
              <a
                href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                View on ClinicalTrials.gov →
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompaniesTab({ indicationSlug }: { indicationSlug: string }) {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        // Get indication name first
        const indResponse = await fetch(`/api/indications/${indicationSlug}`);
        const indData = await indResponse.json();
        
        if (indData.success) {
          const indicationName = indData.indication.name;
          
          // Fetch trials for this indication
          const trialsResponse = await fetch(`/api/trials?condition=${encodeURIComponent(indicationName)}&limit=100`);
          const trialsData = await trialsResponse.json();
          
          if (trialsData.success && trialsData.trials) {
            // Extract unique sponsors and their trial counts
            const sponsorMap = new Map<string, { trials: number; phases: Set<string> }>();
            
            trialsData.trials.forEach((trial: any) => {
              const sponsor = trial.sponsor || 'Unknown';
              if (!sponsorMap.has(sponsor)) {
                sponsorMap.set(sponsor, { trials: 0, phases: new Set() });
              }
              const data = sponsorMap.get(sponsor)!;
              data.trials++;
              if (trial.phase) data.phases.add(trial.phase);
            });
            
            // Convert to array and sort by trial count
            const companiesData = Array.from(sponsorMap.entries())
              .map(([name, data]) => ({
                name,
                trialsCount: data.trials,
                phases: Array.from(data.phases).join(', '),
              }))
              .sort((a, b) => b.trialsCount - a.trialsCount);
            
            setCompanies(companiesData);
          }
        }
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, [indicationSlug]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading companies...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Companies Working on This Indication ({companies.length})</h2>
      
      {companies.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600">No companies found for this indication.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {companies.map((company, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{company.name}</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {company.trialsCount} {company.trialsCount === 1 ? 'trial' : 'trials'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>Phases:</strong> {company.phases || 'N/A'}</p>
              </div>
              
              <Link
                href={`/companies?search=${encodeURIComponent(company.name)}`}
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                View company profile →
              </Link>
            </div>
          ))}
        </div>
      )}
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

