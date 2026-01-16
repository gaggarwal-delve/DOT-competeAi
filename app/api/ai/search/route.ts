/**
 * RAG (Retrieval-Augmented Generation) API Endpoint
 * Natural language Q&A with vector similarity search
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateEmbedding } from '@/lib/embeddings';
import { generateAICompletion } from '@/lib/aiProviders';

const prisma = new PrismaClient();

interface SearchRequest {
  query: string;
  contentType?: 'trial' | 'company' | 'news' | 'indication' | 'all';
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, contentType = 'all', limit = 5 } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Step 2: Vector similarity search in database
    // Format embedding as PostgreSQL vector string: [v1, v2, v3, ...]
    const embeddingString = `[${queryEmbedding.join(',')}]`;
    
    // Build query with proper parameter handling
    let similarityQuery: string;
    if (contentType === 'all') {
      similarityQuery = `
        SELECT 
          id,
          content,
          "contentType",
          "contentId",
          metadata,
          (embedding <=> $1::vector) as distance
        FROM "Embedding"
        WHERE embedding IS NOT NULL
        ORDER BY distance ASC
        LIMIT $2
      `;
    } else {
      similarityQuery = `
        SELECT 
          id,
          content,
          "contentType",
          "contentId",
          metadata,
          (embedding <=> $1::vector) as distance
        FROM "Embedding"
        WHERE embedding IS NOT NULL
          AND "contentType" = $3
        ORDER BY distance ASC
        LIMIT $2
      `;
    }

    // Execute query with proper vector parameter
    const similarDocs = await prisma.$queryRawUnsafe<Array<{
      id: number;
      content: string;
      contentType: string;
      contentId: string;
      metadata: any;
      distance: number;
    }>>(
      similarityQuery
        .replace('$1', `'${embeddingString}'::vector`)
        .replace('$2', String(limit))
        .replace('$3', contentType !== 'all' ? `'${contentType}'` : '')
    );

    if (similarDocs.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find any relevant information in the database. Try rephrasing your question or check if embeddings have been generated for the data.",
        sources: [],
        query,
      });
    }

    // Step 3: Build context from similar documents
    const context = similarDocs
      .map((doc, index) => {
        const metadataStr = doc.metadata 
          ? Object.entries(doc.metadata)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ')
          : '';
        
        return `[Document ${index + 1} - ${doc.contentType}]
${doc.content}
${metadataStr ? `Metadata: ${metadataStr}` : ''}
---`;
      })
      .join('\n\n');

    // Step 4: Generate answer using OpenAI with context
    const systemPrompt = `You are CompeteAI, an expert pharmaceutical competitive intelligence assistant. 
Your role is to answer questions about clinical trials, pharmaceutical companies, news, and therapeutic indications.

IMPORTANT RULES:
1. Answer questions using ONLY the context provided below
2. If the answer isn't in the context, say "I don't have enough information in the database to answer this question accurately."
3. Be specific and cite which documents you're using (e.g., "According to Document 1...")
4. For comparisons, use data from multiple documents
5. Focus on actionable insights for pharmaceutical industry professionals
6. Keep answers concise but informative (2-4 sentences for simple questions, up to 2 paragraphs for complex ones)`;

    const userPrompt = `Question: ${query}

Context from database:
${context}

Please provide a clear, accurate answer based on the context above. If you need to compare multiple items, reference the specific documents.`;

    const aiResponse = await generateAICompletion({
      provider: 'openai',
      systemPrompt,
      userPrompt,
      temperature: 0.2, // Lower temperature for more factual answers
      maxTokens: 500,
    });

    // Step 5: Format sources with metadata
    const sources = similarDocs.map((doc) => {
      // Build source URL based on content type
      let url = '';
      if (doc.contentType === 'trial') {
        url = `https://clinicaltrials.gov/study/${doc.contentId}`;
      } else if (doc.contentType === 'company') {
        url = `/companies/${doc.contentId}`;
      } else if (doc.contentType === 'indication') {
        url = `/indications/${doc.contentId}`;
      } else if (doc.contentType === 'news') {
        url = doc.metadata?.sourceUrl || '/news';
      }

      return {
        type: doc.contentType,
        id: doc.contentId,
        title: doc.content.split('\n')[0] || doc.content.substring(0, 100),
        url,
        metadata: doc.metadata,
        relevance: (1 - doc.distance).toFixed(3), // Convert distance to relevance score
      };
    });

    return NextResponse.json({
      answer: aiResponse.content,
      sources,
      query,
      model: aiResponse.model,
      tokensUsed: aiResponse.tokensUsed,
      estimatedCost: aiResponse.estimatedCost,
    });

  } catch (error: any) {
    console.error('RAG search error:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to process search query',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  // Use POST handler logic
  const requestBody = new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  return POST(requestBody as any);
}
