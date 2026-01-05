import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const therapyArea = searchParams.get('therapyArea') || '';
  const companySize = searchParams.get('companySize') || ''; // 'big-pharma' or 'biotech'
  const sortBy = searchParams.get('sortBy') || 'name'; // 'name', 'trials', 'news'

  try {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { headquarters: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (therapyArea) {
      where.therapyAreas = {
        has: therapyArea,
      };
    }

    let companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            trials: true,
            newsItems: true,
          },
        },
      },
    });

    // Filter by company size (based on trial count)
    if (companySize === 'big-pharma') {
      // Big Pharma: typically >200 trials (large established companies)
      companies = companies.filter(c => c._count.trials > 200);
    } else if (companySize === 'biotech') {
      // Biotech: typically <=200 trials (smaller/emerging companies)
      companies = companies.filter(c => c._count.trials <= 200);
    }

    // Sort companies
    companies.sort((a, b) => {
      if (sortBy === 'trials') {
        return b._count.trials - a._count.trials;
      } else if (sortBy === 'news') {
        return b._count.newsItems - a._count.newsItems;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    
    // Return mock data as fallback (for demo without database)
    return NextResponse.json(getMockCompanies());
  }
}

// Mock company data for demo/fallback
function getMockCompanies() {
  return [
    {
      id: 1,
      name: 'Pfizer',
      headquarters: 'New York, USA',
      website: 'https://www.pfizer.com',
      therapyAreas: ['Oncology', 'Immunology', 'Vaccines', 'Cardiology'],
      foundedYear: 1849,
      _count: { trials: 847, newsItems: 156 }
    },
    {
      id: 2,
      name: 'Roche',
      headquarters: 'Basel, Switzerland',
      website: 'https://www.roche.com',
      therapyAreas: ['Oncology', 'Immunology', 'Neurology'],
      foundedYear: 1896,
      _count: { trials: 623, newsItems: 134 }
    },
    {
      id: 3,
      name: 'Novartis',
      headquarters: 'Basel, Switzerland',
      website: 'https://www.novartis.com',
      therapyAreas: ['Oncology', 'Cardiology', 'Immunology', 'Neurology'],
      foundedYear: 1996,
      _count: { trials: 712, newsItems: 142 }
    },
    {
      id: 4,
      name: 'Johnson & Johnson',
      headquarters: 'New Brunswick, USA',
      website: 'https://www.jnj.com',
      therapyAreas: ['Oncology', 'Immunology', 'Infectious Diseases'],
      foundedYear: 1886,
      _count: { trials: 568, newsItems: 128 }
    },
    {
      id: 5,
      name: 'Merck & Co.',
      headquarters: 'Rahway, USA',
      website: 'https://www.merck.com',
      therapyAreas: ['Oncology', 'Vaccines', 'Diabetes'],
      foundedYear: 1891,
      _count: { trials: 534, newsItems: 118 }
    },
    {
      id: 6,
      name: 'AbbVie',
      headquarters: 'Chicago, USA',
      website: 'https://www.abbvie.com',
      therapyAreas: ['Immunology', 'Oncology', 'Neurology'],
      foundedYear: 2013,
      _count: { trials: 445, newsItems: 98 }
    },
    {
      id: 7,
      name: 'Sanofi',
      headquarters: 'Paris, France',
      website: 'https://www.sanofi.com',
      therapyAreas: ['Diabetes', 'Cardiovascular', 'Vaccines', 'Rare Diseases'],
      foundedYear: 2004,
      _count: { trials: 467, newsItems: 102 }
    },
    {
      id: 8,
      name: 'GlaxoSmithKline',
      headquarters: 'London, UK',
      website: 'https://www.gsk.com',
      therapyAreas: ['Vaccines', 'Respiratory', 'HIV', 'Oncology'],
      foundedYear: 2000,
      _count: { trials: 389, newsItems: 87 }
    },
    {
      id: 9,
      name: 'AstraZeneca',
      headquarters: 'Cambridge, UK',
      website: 'https://www.astrazeneca.com',
      therapyAreas: ['Oncology', 'Cardiovascular', 'Respiratory'],
      foundedYear: 1999,
      _count: { trials: 512, newsItems: 112 }
    },
    {
      id: 10,
      name: 'Bristol Myers Squibb',
      headquarters: 'New York, USA',
      website: 'https://www.bms.com',
      therapyAreas: ['Oncology', 'Immunology', 'Cardiovascular'],
      foundedYear: 1989,
      _count: { trials: 478, newsItems: 95 }
    },
    {
      id: 11,
      name: 'Eli Lilly',
      headquarters: 'Indianapolis, USA',
      website: 'https://www.lilly.com',
      therapyAreas: ['Diabetes', 'Oncology', 'Immunology'],
      foundedYear: 1876,
      _count: { trials: 423, newsItems: 91 }
    },
    {
      id: 12,
      name: 'Amgen',
      headquarters: 'Thousand Oaks, USA',
      website: 'https://www.amgen.com',
      therapyAreas: ['Oncology', 'Cardiovascular', 'Bone Health'],
      foundedYear: 1980,
      _count: { trials: 356, newsItems: 78 }
    },
    {
      id: 13,
      name: 'Gilead Sciences',
      headquarters: 'Foster City, USA',
      website: 'https://www.gilead.com',
      therapyAreas: ['HIV', 'Hepatitis', 'Oncology'],
      foundedYear: 1987,
      _count: { trials: 298, newsItems: 72 }
    },
    {
      id: 14,
      name: 'Moderna',
      headquarters: 'Cambridge, USA',
      website: 'https://www.modernatx.com',
      therapyAreas: ['Vaccines', 'Oncology', 'Rare Diseases'],
      foundedYear: 2010,
      _count: { trials: 187, newsItems: 164 }
    },
    {
      id: 15,
      name: 'Biogen',
      headquarters: 'Cambridge, USA',
      website: 'https://www.biogen.com',
      therapyAreas: ['Neurology', 'Multiple Sclerosis', 'Alzheimer\'s'],
      foundedYear: 1978,
      _count: { trials: 234, newsItems: 63 }
    },
    {
      id: 16,
      name: 'Regeneron',
      headquarters: 'Tarrytown, USA',
      website: 'https://www.regeneron.com',
      therapyAreas: ['Ophthalmology', 'Immunology', 'Oncology'],
      foundedYear: 1988,
      _count: { trials: 267, newsItems: 71 }
    },
    {
      id: 17,
      name: 'Vertex Pharmaceuticals',
      headquarters: 'Boston, USA',
      website: 'https://www.vrtx.com',
      therapyAreas: ['Cystic Fibrosis', 'Pain', 'Rare Diseases'],
      foundedYear: 1989,
      _count: { trials: 145, newsItems: 54 }
    },
    {
      id: 18,
      name: 'BioNTech',
      headquarters: 'Mainz, Germany',
      website: 'https://www.biontech.com',
      therapyAreas: ['Vaccines', 'Oncology', 'Immunology'],
      foundedYear: 2008,
      _count: { trials: 98, newsItems: 127 }
    },
    {
      id: 19,
      name: 'CRISPR Therapeutics',
      headquarters: 'Zug, Switzerland',
      website: 'https://www.crisprtx.com',
      therapyAreas: ['Gene Editing', 'Rare Diseases', 'Oncology'],
      foundedYear: 2013,
      _count: { trials: 34, newsItems: 89 }
    },
    {
      id: 20,
      name: 'Beam Therapeutics',
      headquarters: 'Cambridge, USA',
      website: 'https://www.beamtx.com',
      therapyAreas: ['Gene Editing', 'Rare Diseases'],
      foundedYear: 2017,
      _count: { trials: 12, newsItems: 43 }
    }
  ];
}

