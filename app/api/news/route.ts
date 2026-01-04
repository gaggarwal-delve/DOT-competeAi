import { NextResponse } from 'next/server';

// NewsAPI endpoint for pharmaceutical news
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'pharmaceutical OR pharma OR drug OR biotech';
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
        title: 'FDA Approves New Cancer Immunotherapy Drug',
        description: 'The FDA has approved a groundbreaking immunotherapy treatment for advanced melanoma, offering new hope to patients.',
        url: 'https://clinicaltrials.gov',
        source: 'FDA News',
        author: 'FDA Communications',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The FDA announced today the approval of a novel cancer immunotherapy...',
      },
      {
        title: 'Pfizer Reports Positive Phase 3 Results for Alzheimer\'s Drug',
        description: 'Pfizer\'s experimental Alzheimer\'s drug shows significant cognitive improvement in late-stage trials.',
        url: 'https://clinicaltrials.gov',
        source: 'Pharma Times',
        author: 'Sarah Johnson',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'Pfizer announced promising Phase 3 results for their Alzheimer\'s drug candidate...',
      },
      {
        title: 'Biotech Startup Raises $200M for Gene Therapy Platform',
        description: 'A California-based biotech company secured significant funding to advance its gene therapy pipeline.',
        url: 'https://clinicaltrials.gov',
        source: 'BioTech Daily',
        author: 'Michael Chen',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The funding will support multiple gene therapy programs targeting rare diseases...',
      },
      {
        title: 'EMA Recommends Approval for New Diabetes Treatment',
        description: 'European Medicines Agency recommends approval for innovative Type 2 diabetes medication.',
        url: 'https://clinicaltrials.gov',
        source: 'European Pharma News',
        author: 'Emma Williams',
        publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The EMA\'s Committee for Medicinal Products for Human Use has issued a positive opinion...',
      },
      {
        title: 'Major Pharma Merger Announced: $50B Deal',
        description: 'Two pharmaceutical giants announce merger to create industry powerhouse with combined pipeline.',
        url: 'https://clinicaltrials.gov',
        source: 'Financial Times',
        author: 'Robert Thompson',
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        urlToImage: null,
        content: 'The merger will combine two of the largest pharmaceutical companies...',
      },
    ],
  };
}

