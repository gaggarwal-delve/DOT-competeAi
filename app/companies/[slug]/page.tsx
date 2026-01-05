'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  FaBuilding, 
  FaGlobe, 
  FaMapMarkerAlt, 
  FaFlask, 
  FaNewspaper, 
  FaArrowLeft,
  FaChartBar,
  FaCalendar,
  FaExternalLinkAlt
} from 'react-icons/fa';

interface Company {
  id: number;
  name: string;
  slug: string;
  headquarters: string | null;
  website: string | null;
  therapyAreas: string[];
  _count: {
    trials: number;
    newsItems: number;
  };
}

interface Trial {
  nctId: string;
  title: string;
  phase: string;
  status: string;
  conditions: string[];
  startDate?: string;
  enrollmentCount?: number;
  studyType?: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'trials' | 'news'>('overview');
  const [loading, setLoading] = useState(true);
  const [trialsLoading, setTrialsLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company details
  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/companies/${slug}`);
        if (!res.ok) {
          throw new Error('Company not found');
        }
        const data = await res.json();
        setCompany(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCompany();
    }
  }, [slug]);

  // Fetch trials when company is loaded or trials tab is active
  useEffect(() => {
    if (!company) return;

    const fetchTrials = async () => {
      setTrialsLoading(true);
      try {
        // Search ClinicalTrials.gov for this company's trials
        const res = await fetch(`/api/trials?company=${encodeURIComponent(company.name)}&pageSize=20`);
        if (res.ok) {
          const data = await res.json();
          setTrials(data.trials || []);
        }
      } catch (err) {
        console.error('Failed to fetch trials:', err);
      } finally {
        setTrialsLoading(false);
      }
    };

    if (activeTab === 'trials' && trials.length === 0) {
      fetchTrials();
    }
  }, [company, activeTab, trials.length]);

  // Fetch news when company is loaded or news tab is active
  useEffect(() => {
    if (!company) return;

    const fetchNews = async () => {
      setNewsLoading(true);
      try {
        // Search NewsAPI for this company
        const res = await fetch(`/api/news?q=${encodeURIComponent(company.name)}`);
        if (res.ok) {
          const data = await res.json();
          setNews(data.articles || []);
        }
      } catch (err) {
        console.error('Failed to fetch news:', err);
      } finally {
        setNewsLoading(false);
      }
    };

    if (activeTab === 'news' && news.length === 0) {
      fetchNews();
    }
  }, [company, activeTab, news.length]);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Company not found'}</p>
          <Link href="/companies" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  // Calculate phase distribution
  const phaseDistribution = trials.reduce((acc, trial) => {
    const phase = trial.phase || 'Unknown';
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate status distribution
  const statusDistribution = trials.reduce((acc, trial) => {
    const status = trial.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="container mx-auto py-8">
      {/* Back Button */}
      <Link 
        href="/companies"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
      >
        <FaArrowLeft className="mr-2" />
        Back to Companies
      </Link>

      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <FaBuilding className="text-5xl text-blue-600 mr-4" />
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{company.name}</h1>
                {company.headquarters && (
                  <div className="flex items-center text-gray-600 mt-2">
                    <FaMapMarkerAlt className="mr-2" />
                    {company.headquarters}
                  </div>
                )}
              </div>
            </div>

            {/* Therapy Areas */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Therapy Areas:</p>
              <div className="flex flex-wrap gap-2">
                {company.therapyAreas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-700">{trials.length || company._count.trials}</div>
                <div className="text-sm text-green-600 font-medium">Clinical Trials</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-700">{news.length || company._count.newsItems}</div>
                <div className="text-sm text-purple-600 font-medium">News Articles</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-700">{company.therapyAreas.length}</div>
                <div className="text-sm text-blue-600 font-medium">Therapy Areas</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-700">
                  {trials.filter(t => t.status?.toLowerCase().includes('recruiting')).length}
                </div>
                <div className="text-sm text-orange-600 font-medium">Recruiting</div>
              </div>
            </div>
          </div>

          {/* Website Button */}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors ml-6"
            >
              <FaGlobe className="mr-2" />
              Visit Website
              <FaExternalLinkAlt className="ml-2 text-sm" />
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <FaChartBar className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trials')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'trials'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <FaFlask className="inline mr-2" />
              Clinical Trials ({trials.length})
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'news'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              }`}
            >
              <FaNewspaper className="inline mr-2" />
              Recent News ({news.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pipeline Overview</h2>
                
                {trials.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Phase Distribution */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Trials by Phase</h3>
                      <div className="space-y-3">
                        {Object.entries(phaseDistribution)
                          .sort(([a], [b]) => a.localeCompare(b))
                          .map(([phase, count]) => (
                            <div key={phase} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{phase}</span>
                              <div className="flex items-center">
                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${(count / trials.length) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Status Distribution */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Trials by Status</h3>
                      <div className="space-y-3">
                        {Object.entries(statusDistribution)
                          .sort(([, a], [, b]) => b - a)
                          .map(([status, count]) => (
                            <div key={status} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{status}</span>
                              <div className="flex items-center">
                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${(count / trials.length) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No trial data available yet</p>
                    <p className="text-sm text-gray-500 mt-2">Switch to the Trials tab to load data</p>
                  </div>
                )}
              </div>

              {/* Quick Insights */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Quick Insights</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• {company.name} is active in {company.therapyAreas.length} therapy area{company.therapyAreas.length !== 1 ? 's' : ''}</li>
                  <li>• Based in {company.headquarters || 'location not specified'}</li>
                  {trials.length > 0 && (
                    <>
                      <li>• Currently running {trials.length} clinical trial{trials.length !== 1 ? 's' : ''}</li>
                      <li>
                        • {trials.filter(t => t.status?.toLowerCase().includes('recruiting')).length} trial{trials.filter(t => t.status?.toLowerCase().includes('recruiting')).length !== 1 ? 's are' : ' is'} actively recruiting patients
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Trials Tab */}
          {activeTab === 'trials' && (
            <div>
              {trialsLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading trials...</p>
                </div>
              ) : trials.length === 0 ? (
                <div className="text-center py-10">
                  <FaFlask className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">No trials found for {company.name}</p>
                  <p className="text-sm text-gray-500 mt-2">Check back later or try searching on ClinicalTrials.gov</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {trials.length} clinical trial{trials.length !== 1 ? 's' : ''} from ClinicalTrials.gov
                  </p>
                  {trials.map((trial) => (
                    <div
                      key={trial.nctId}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{trial.title}</h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              {trial.nctId}
                            </span>
                            {trial.phase && (
                              <span className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                {trial.phase}
                              </span>
                            )}
                            <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {trial.status}
                            </span>
                            {trial.studyType && (
                              <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                {trial.studyType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {trial.conditions && trial.conditions.length > 0 && (
                        <div className="mb-2">
                          <span className="text-sm font-medium text-gray-700">Conditions: </span>
                          <span className="text-sm text-gray-600">{trial.conditions.join(', ')}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                        {trial.enrollmentCount && (
                          <span>
                            <strong>Enrollment:</strong> {trial.enrollmentCount} participants
                          </span>
                        )}
                        {trial.startDate && (
                          <span className="flex items-center">
                            <FaCalendar className="mr-1" />
                            {new Date(trial.startDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <a
                        href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View on ClinicalTrials.gov
                        <FaExternalLinkAlt className="ml-1 text-xs" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* News Tab */}
          {activeTab === 'news' && (
            <div>
              {newsLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading news...</p>
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-10">
                  <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-lg text-gray-600">No recent news found for {company.name}</p>
                  <p className="text-sm text-gray-500 mt-2">Check back later for updates</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {news.length} recent news article{news.length !== 1 ? 's' : ''}
                  </p>
                  {news.map((article, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600 transition-colors"
                        >
                          {article.title}
                        </a>
                      </h3>
                      {article.description && (
                        <p className="text-sm text-gray-600 mb-3">{article.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="font-medium">{article.source}</span>
                        <span className="flex items-center">
                          <FaCalendar className="mr-1" />
                          {new Date(article.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Read full article
                        <FaExternalLinkAlt className="ml-1 text-xs" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

