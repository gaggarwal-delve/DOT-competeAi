'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Globe, ArrowLeft, Activity, Newspaper, Calendar, Users, FlaskConical } from 'lucide-react';
import { useParams } from 'next/navigation';

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
  status: string;
  phase: string;
  sponsor: string;
  conditions: string[];
  startDate: string | null;
  enrollmentCount: number | null;
  companyId: number | null;
  companyName: string | null;
  companySlug: string | null;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch company details
        const companyRes = await fetch(`/api/companies?query=${slug}`);
        const companyData = await companyRes.json();
        
        const foundCompany = companyData.companies?.find(
          (c: Company) => c.slug === slug
        );
        
        if (!foundCompany) {
          setError('Company not found');
          setLoading(false);
          return;
        }
        
        setCompany(foundCompany);

        // Fetch company's trials
        const trialsRes = await fetch(`/api/trials?company=${slug}&limit=20`);
        const trialsData = await trialsRes.json();
        
        if (trialsData.success) {
          setTrials(trialsData.trials || []);
        }
      } catch (err) {
        console.error('Error fetching company data:', err);
        setError('Failed to load company data');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCompanyData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="container mx-auto p-8">
        <Link href="/companies" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Company Not Found</h2>
          <p className="text-red-600">{error || 'The company you\'re looking for doesn\'t exist.'}</p>
        </div>
      </div>
    );
  }

  const phaseDistribution = trials.reduce((acc: any, trial) => {
    const phase = trial.phase || 'Unknown';
    acc[phase] = (acc[phase] || 0) + 1;
    return acc;
  }, {});

  const statusDistribution = trials.reduce((acc: any, trial) => {
    const status = trial.status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-8">
      {/* Back Button */}
      <Link href="/companies" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Companies
      </Link>

      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <Building2 className="w-10 h-10 text-blue-600" />
              {company.name}
            </h1>
            
            <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
              {company.headquarters && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span>{company.headquarters}</span>
                </div>
              )}
              
              {company.website && (
                <Link 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Globe className="w-5 h-5" />
                  <span>Website</span>
                </Link>
              )}
            </div>

            {/* Therapy Areas */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Therapy Areas:</h3>
              <div className="flex flex-wrap gap-2">
                {company.therapyAreas.map((area, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Active Trials</p>
              <p className="text-2xl font-bold text-gray-900">{trials.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Phase 3 Trials</p>
              <p className="text-2xl font-bold text-gray-900">{phaseDistribution['Phase 3'] || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Recruiting</p>
              <p className="text-2xl font-bold text-gray-900">{statusDistribution['Recruiting'] || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">News Items</p>
              <p className="text-2xl font-bold text-gray-900">{company._count.newsItems}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trial Phase Distribution</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(phaseDistribution).map(([phase, count]) => (
            <div key={phase} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{count as number}</p>
              <p className="text-sm text-gray-600 mt-1">{phase}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Trials List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical Trials</h2>
        
        {trials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No trials found for this company</p>
            <p className="text-sm mt-2">Trials may not be linked yet or company uses a different sponsor name</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trials.map((trial) => (
              <div key={trial.nctId} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link 
                      href={`https://clinicaltrials.gov/study/${trial.nctId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {trial.nctId}
                    </Link>
                    <h3 className="text-sm text-gray-600 mt-1 line-clamp-2">{trial.title}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 items-center text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${
                    trial.phase.includes('3') ? 'bg-purple-100 text-purple-800' :
                    trial.phase.includes('2') ? 'bg-blue-100 text-blue-800' :
                    trial.phase.includes('1') ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trial.phase}
                  </span>

                  <span className={`px-3 py-1 rounded-full font-medium ${
                    trial.status === 'Recruiting' ? 'bg-green-100 text-green-800' :
                    trial.status === 'Active, not recruiting' ? 'bg-blue-100 text-blue-800' :
                    trial.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {trial.status}
                  </span>

                  {trial.startDate && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(trial.startDate).toLocaleDateString()}
                    </span>
                  )}

                  {trial.enrollmentCount && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <Users className="w-4 h-4" />
                      {trial.enrollmentCount} participants
                    </span>
                  )}
                </div>

                {trial.conditions.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Conditions:</span> {trial.conditions.slice(0, 3).join(', ')}
                    {trial.conditions.length > 3 && ` +${trial.conditions.length - 3} more`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

