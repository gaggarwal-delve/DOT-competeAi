/**
 * OpenAI Embeddings Utility
 * Generates vector embeddings using OpenAI text-embedding-3-small
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Embedding model configuration
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingOptions {
  content: string;
  contentType: 'trial' | 'company' | 'news' | 'indication';
  contentId: string;
  metadata?: Record<string, any>;
}

/**
 * Generate embedding for a single piece of content
 */
export async function generateEmbedding(
  content: string
): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: content,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data[0].embedding;
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple pieces of content (batch)
 */
export async function generateEmbeddingsBatch(
  contents: string[],
  batchSize: number = 100
): Promise<number[][]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const embeddings: number[][] = [];
  
  // Process in batches to avoid rate limits
  for (let i = 0; i < contents.length; i += batchSize) {
    const batch = contents.slice(i, i + batchSize);
    
    try {
      const response = await openai.embeddings.create({
        model: EMBEDDING_MODEL,
        input: batch,
        dimensions: EMBEDDING_DIMENSIONS,
      });

      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
      
      // Rate limiting: wait 100ms between batches
      if (i + batchSize < contents.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error: any) {
      console.error(`Error generating embeddings for batch ${i}-${i + batchSize}:`, error);
      throw new Error(`Failed to generate embeddings batch: ${error.message}`);
    }
  }

  return embeddings;
}

/**
 * Format content for embedding based on type
 */
export function formatContentForEmbedding(
  type: 'trial' | 'company' | 'news' | 'indication',
  data: any
): string {
  switch (type) {
    case 'trial':
      return `Clinical Trial: ${data.title || 'Untitled'}
Phase: ${data.phase || 'Not specified'}
Status: ${data.status || 'Unknown'}
Condition: ${data.conditions?.join(', ') || 'Not specified'}
Intervention: ${data.interventions?.join(', ') || 'Not specified'}
Sponsor: ${data.sponsorName || data.company?.name || 'Unknown'}
${data.briefSummary ? `Summary: ${data.briefSummary}` : ''}`;

    case 'company':
      return `Pharmaceutical Company: ${data.name}
Headquarters: ${data.headquarters || 'Unknown'}
Therapy Areas: ${data.therapyAreas?.join(', ') || 'Not specified'}
Website: ${data.website || 'N/A'}`;

    case 'news':
      return `News Article: ${data.title}
Source: ${data.source || 'Unknown'}
${data.summary ? `Summary: ${data.summary}` : ''}
${data.description ? `Description: ${data.description}` : ''}`;

    case 'indication':
      return `Indication: ${data.name}
Therapeutic Area: ${data.category || 'Unknown'}
${data.description ? `Description: ${data.description}` : ''}
Total Reports: ${data.totalReports || 0}
Total Trials: ${data.totalTrials || 0}`;

    default:
      return JSON.stringify(data);
  }
}

export { EMBEDDING_MODEL, EMBEDDING_DIMENSIONS };
