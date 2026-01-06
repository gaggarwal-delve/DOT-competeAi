/**
 * Generate Embeddings Script (Hugging Face)
 * 
 * This script generates vector embeddings using Hugging Face Inference API:
 * - Indications (for natural language search)
 * - Companies (for company-related queries)
 * - News articles (for recent developments)
 * 
 * Model: sentence-transformers/all-mpnet-base-v2 (768 dimensions, FREE)
 * 
 * Run with: npx tsx scripts/generate-embeddings.ts
 */

import { PrismaClient } from '@prisma/client';
import { HfInference } from '@huggingface/inference';

const prisma = new PrismaClient();

// Hugging Face Inference API (FREE for public models)
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || ''; // Optional, but recommended for higher rate limits
const HF_MODEL = 'sentence-transformers/all-mpnet-base-v2';

// Initialize Hugging Face client
const hf = new HfInference(HF_API_KEY || undefined);

// Model specs: 768 dimensions, excellent quality, FREE
const EMBEDDING_DIMENSIONS = 768;
const BATCH_SIZE = 10; // Hugging Face allows batch processing

interface EmbeddingData {
  contentType: string;
  contentId: string;
  content: string;
  metadata: any;
}

async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Use the feature extraction endpoint
    const response = await hf.featureExtraction({
      model: HF_MODEL,
      inputs: text,
    });

    // Response is already an array of numbers
    if (Array.isArray(response)) {
      return response as number[];
    }
    
    // Handle nested arrays (batch response)
    if (Array.isArray(response) && Array.isArray(response[0])) {
      return (response[0] as number[]);
    }
    
    throw new Error('Unexpected response format from Hugging Face API');
  } catch (error: any) {
    console.error('Error generating embedding:', error.message);
    // Retry once after a delay if rate limited
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      console.log('  Rate limited, waiting 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      return generateEmbedding(text); // Retry
    }
    throw error;
  }
}

async function generateIndicationEmbeddings() {
  console.log('\n📊 Generating embeddings for indications...');
  
  const indications = await prisma.indication.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      description: true,
      hasMarketInsight: true,
      hasDrugInsight: true,
      hasEpidemInsight: true,
      mostRecentYear: true,
      totalReports: true,
    },
  });

  console.log(`Found ${indications.length} indications`);

  let processed = 0;
  let skipped = 0;

  for (const indication of indications) {
    try {
      // Check if embedding already exists
      const existing = await prisma.embedding.findUnique({
        where: {
          contentType_contentId: {
            contentType: 'indication',
            contentId: indication.slug,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create searchable content
      const insights = [];
      if (indication.hasMarketInsight) insights.push('Market Insight');
      if (indication.hasDrugInsight) insights.push('Drug Insight');
      if (indication.hasEpidemInsight) insights.push('Epidemiology Insight');

      const content = `
        Indication: ${indication.name}
        Therapeutic Area: ${indication.category}
        Description: ${indication.description || 'N/A'}
        Available Insights: ${insights.join(', ')}
        Total Reports: ${indication.totalReports}
        Most Recent Year: ${indication.mostRecentYear || 'N/A'}
      `.trim();

      // Generate embedding
      const embedding = await generateEmbedding(content);

      // Store in database using raw SQL (Prisma doesn't support vector type natively)
      await prisma.$executeRaw`
        INSERT INTO "Embedding" (
          content, "contentType", "contentId", embedding, metadata, "createdAt", "updatedAt"
        ) VALUES (
          ${content},
          'indication',
          ${indication.slug},
          ${JSON.stringify(embedding)}::vector,
          ${JSON.stringify({
            name: indication.name,
            category: indication.category,
            hasMarketInsight: indication.hasMarketInsight,
            hasDrugInsight: indication.hasDrugInsight,
            hasEpidemInsight: indication.hasEpidemInsight,
          })},
          NOW(),
          NOW()
        )
      `;

      processed++;
      if (processed % 10 === 0) {
        console.log(`  Processed ${processed}/${indications.length} indications...`);
      }

      // Rate limiting: Hugging Face free tier allows ~30 requests/min
      // With API key: ~100 requests/min
      const delay = HF_API_KEY ? 600 : 2000; // 1s with key, 2s without
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error: any) {
      console.error(`  Error processing indication ${indication.name}:`, error.message);
    }
  }

  console.log(`✅ Indication embeddings: ${processed} created, ${skipped} skipped`);
}

async function generateCompanyEmbeddings() {
  console.log('\n🏢 Generating embeddings for companies...');
  
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      headquarters: true,
      therapyAreas: true,
    },
  });

  console.log(`Found ${companies.length} companies`);

  let processed = 0;
  let skipped = 0;

  for (const company of companies) {
    try {
      // Check if embedding already exists
      const existing = await prisma.embedding.findUnique({
        where: {
          contentType_contentId: {
            contentType: 'company',
            contentId: company.slug,
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create searchable content
      const content = `
        Company: ${company.name}
        Headquarters: ${company.headquarters || 'Unknown'}
        Therapy Areas: ${company.therapyAreas.join(', ')}
      `.trim();

      // Generate embedding
      const embedding = await generateEmbedding(content);

      // Store in database
      await prisma.$executeRaw`
        INSERT INTO "Embedding" (
          content, "contentType", "contentId", embedding, metadata, "createdAt", "updatedAt"
        ) VALUES (
          ${content},
          'company',
          ${company.slug},
          ${JSON.stringify(embedding)}::vector,
          ${JSON.stringify({
            name: company.name,
            headquarters: company.headquarters,
            therapyAreas: company.therapyAreas,
          })},
          NOW(),
          NOW()
        )
      `;

      processed++;
      const delay = HF_API_KEY ? 600 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error: any) {
      console.error(`  Error processing company ${company.name}:`, error.message);
    }
  }

  console.log(`✅ Company embeddings: ${processed} created, ${skipped} skipped`);
}

async function generateNewsEmbeddings() {
  console.log('\n📰 Generating embeddings for news articles...');
  
  // Only embed recent news (last 100 articles)
  const newsItems = await prisma.newsItem.findMany({
    select: {
      id: true,
      title: true,
      summary: true,
      source: true,
      category: true,
      publishedDate: true,
    },
    orderBy: {
      publishedDate: 'desc',
    },
    take: 100,
  });

  console.log(`Found ${newsItems.length} news articles`);

  let processed = 0;
  let skipped = 0;

  for (const news of newsItems) {
    try {
      // Check if embedding already exists
      const existing = await prisma.embedding.findUnique({
        where: {
          contentType_contentId: {
            contentType: 'news',
            contentId: news.id.toString(),
          },
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Create searchable content
      const content = `
        News: ${news.title}
        Summary: ${news.summary || 'N/A'}
        Source: ${news.source}
        Category: ${news.category}
        Published: ${news.publishedDate.toISOString().split('T')[0]}
      `.trim();

      // Generate embedding
      const embedding = await generateEmbedding(content);

      // Store in database
      await prisma.$executeRaw`
        INSERT INTO "Embedding" (
          content, "contentType", "contentId", embedding, metadata, "createdAt", "updatedAt"
        ) VALUES (
          ${content},
          'news',
          ${news.id.toString()},
          ${JSON.stringify(embedding)}::vector,
          ${JSON.stringify({
            title: news.title,
            source: news.source,
            category: news.category,
            publishedDate: news.publishedDate,
          })},
          NOW(),
          NOW()
        )
      `;

      processed++;
      const delay = HF_API_KEY ? 600 : 2000;
      await new Promise(resolve => setTimeout(resolve, delay));

    } catch (error: any) {
      console.error(`  Error processing news ${news.id}:`, error.message);
    }
  }

  console.log(`✅ News embeddings: ${processed} created, ${skipped} skipped`);
}

async function main() {
  console.log('🚀 Starting embedding generation with Hugging Face...\n');
  console.log(`Model: sentence-transformers/all-mpnet-base-v2`);
  console.log(`Dimensions: ${EMBEDDING_DIMENSIONS}`);
  console.log(`Cost: FREE (Hugging Face Inference API)\n`);
  console.log(`API Key: ${HF_API_KEY ? '✅ Provided (higher rate limits)' : '⚠️  Not provided (using free tier)'}\n`);

  try {
    // Generate embeddings for each content type
    await generateIndicationEmbeddings();
    await generateCompanyEmbeddings();
    await generateNewsEmbeddings();

    // Get total count
    const totalEmbeddings = await prisma.embedding.count();
    console.log(`\n✅ Total embeddings in database: ${totalEmbeddings}`);
    console.log('\n🎉 Embedding generation complete!');
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

