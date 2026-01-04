import { NextResponse } from 'next/server';

// NewsAPI endpoint for pharmaceutical news
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '(pharmaceutical OR pharma OR biotech) AND (drug OR trial OR FDA OR approval OR clinical)';
  const pageSize = searchParams.get('pageSize') || '20';
  const sortBy = searchParams.get('sortBy') || 'publishedAt'; // publishedAt, relevancy, popularity

  // NewsAPI Free tier key (get from https://newsapi.org)
  const API_KEY = process.env.NEWS_API_KEY || 'demo'; // Replace with actual key

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=${pageSize}&sortBy=${sortBy}&language=en&apiKey=${API_KEY}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        // Cache for 5 minutes to avoid rate limits
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('NewsAPI error:', errorData);
      
      // Return mock data if API fails (for demo purposes)
      if (errorData.code === 'apiKeyInvalid' || errorData.code === 'rateLimited') {
        return NextResponse.json(getMockNews());
      }

      return NextResponse.json(
        { message: 'Failed to fetch news from NewsAPI', error: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Format news items
    const articles = data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      author: article.author || 'Unknown',
      publishedAt: article.publishedAt,
      urlToImage: article.urlToImage,
      content: article.content,
    }));

    return NextResponse.json({
      totalResults: data.totalResults,
      articles,
    });
  } catch (error) {
    console.error('Error fetching pharma news:', error);
    
    // Return mock data as fallback
    return NextResponse.json(getMockNews());
  }
}

// Mock news data for demo/fallback
function getMockNews() {
  return {
    totalResults: 5,
    articles: [
      {
        title: 'FDA Grants Accelerated Approval for First CRISPR Gene Therapy',
        description: 'The FDA has approved CRISPR Therapeutics\' gene-editing treatment for sickle cell disease, marking a historic milestone in genetic medicine.',
        url: 'https://www.fda.gov',
        source: 'FDA News',
        author: 'FDA Communications',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The FDA announced accelerated approval for Casgevy, the first CRISPR-based gene therapy...',
      },
      {
        title: 'Roche\'s Alzheimer\'s Drug Shows 27% Cognitive Decline Reduction in Phase 3',
        description: 'Roche reports positive topline results from Phase 3 trial of gantenerumab, showing significant slowing of cognitive decline in early Alzheimer\'s patients.',
        url: 'https://www.roche.com',
        source: 'BioPharma Dive',
        author: 'Sarah Johnson',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'Roche announced positive Phase 3 results showing 27% reduction in cognitive decline...',
      },
      {
        title: 'Moderna Advances mRNA Cancer Vaccine in Partnership with Merck',
        description: 'Moderna and Merck\'s personalized cancer vaccine shows 44% reduction in recurrence risk in melanoma patients, advancing to Phase 3 trials.',
        url: 'https://www.modernatx.com',
        source: 'FierceBiotech',
        author: 'Michael Chen',
        publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The mRNA-4157/V940 personalized cancer vaccine demonstrated significant efficacy...',
      },
      {
        title: 'Novo Nordisk\'s Obesity Drug Wegovy Approved for Heart Failure',
        description: 'FDA expands Wegovy label to include cardiovascular benefits after SELECT trial shows 20% reduction in major cardiac events.',
        url: 'https://www.novonordisk.com',
        source: 'Reuters Health',
        author: 'Emma Williams',
        publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'Novo Nordisk\'s blockbuster GLP-1 agonist receives expanded indication...',
      },
      {
        title: 'Pfizer Acquires Seagen for $43B to Boost Oncology Pipeline',
        description: 'Pfizer completes acquisition of Seagen, adding four approved antibody-drug conjugates and strengthening its oncology portfolio.',
        url: 'https://www.pfizer.com',
        source: 'Wall Street Journal',
        author: 'Robert Thompson',
        publishedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The acquisition brings Seagen\'s ADC technology platform and pipeline to Pfizer...',
      },
      {
        title: 'BioNTech Initiates First-in-Human Trial for mRNA HIV Vaccine',
        description: 'BioNTech announces dosing of first patient in Phase 1 trial of mRNA-based HIV vaccine, leveraging COVID-19 vaccine technology.',
        url: 'https://www.biontech.com',
        source: 'BioSpace',
        author: 'Jennifer Martinez',
        publishedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'BioNTech applies its mRNA platform to tackle HIV, one of medicine\'s greatest challenges...',
      },
      {
        title: 'FDA Issues Complete Response Letter to Biogen for Alzheimer\'s Drug',
        description: 'Biogen receives CRL for lecanemab, requesting additional safety data before potential approval for early Alzheimer\'s disease treatment.',
        url: 'https://www.biogen.com',
        source: 'Endpoints News',
        author: 'David Kim',
        publishedAt: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The FDA has delayed approval pending further analysis of ARIA cases...',
      },
      {
        title: 'AstraZeneca\'s Enhertu Gains FDA Approval for HER2-Low Breast Cancer',
        description: 'FDA approves Enhertu for previously untreatable HER2-low breast cancer subset, expanding treatment options for 60% of breast cancer patients.',
        url: 'https://www.astrazeneca.com',
        source: 'ASCO Post',
        author: 'Lisa Park',
        publishedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The approval represents a paradigm shift in HER2-low breast cancer treatment...',
      },
    ],
  };
}

