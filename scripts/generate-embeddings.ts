/**
 * Generate embeddings for existing data (trials, companies, news, indications)
 * 
 * Usage: tsx scripts/generate-embeddings.ts [--type=trial|company|news|indication] [--limit=100]
 */

import { PrismaClient } from '@prisma/client';
import { generateEmbedding, formatContentForEmbedding } from '../lib/embeddings';

const prisma = new PrismaClient();

interface GenerateOptions {
  type?: 'trial' | 'company' | 'news' | 'indication';
  limit?: number;
  skipExisting?: boolean;
}

async function generateEmbeddingsForType(
  type: 'trial' | 'company' | 'news' | 'indication',
  limit?: number,
  skipExisting: boolean = true
) {
  console.log(`\n📊 Processing ${type}s...`);

  let items: any[] = [];
  let total = 0;
  let processed = 0;
  let skipped = 0;
  let errors = 0;

  try {
    // Fetch items based on type
    switch (type) {
      case 'trial':
        items = await prisma.clinicalTrial.findMany({
          take: limit,
          include: { company: true },
        });
        total = await prisma.clinicalTrial.count();
        break;

      case 'company':
        items = await prisma.company.findMany({
          take: limit,
        });
        total = await prisma.company.count();
        break;

      case 'news':
        items = await prisma.newsItem.findMany({
          take: limit,
          include: { company: true },
        });
        total = await prisma.newsItem.count();
        break;

      case 'indication':
        items = await prisma.indication.findMany({
          take: limit,
        });
        total = await prisma.indication.count();
        break;
    }

    console.log(`   Found ${items.length} ${type}s (${total} total in database)`);

    // Process each item
    for (const item of items) {
      try {
        // Get content ID based on type
        const contentId = 
          type === 'trial' ? item.nctId :
          type === 'company' ? item.slug :
          type === 'news' ? item.sourceUrl || `news-${item.id}` :
          type === 'indication' ? item.slug : `unknown-${item.id}`;

        // Skip if embedding already exists
        if (skipExisting) {
          const existing = await prisma.embedding.findUnique({
            where: {
              contentType_contentId: {
                contentType: type,
                contentId,
              },
            },
          });

          if (existing) {
            skipped++;
            continue;
          }
        }

        // Format content for embedding
        const content = formatContentForEmbedding(type, item);

        // Generate embedding
        const embedding = await generateEmbedding(content);

        // Prepare metadata
        const metadata: Record<string, any> = {};
        if (type === 'trial') {
          metadata.phase = item.phase;
          metadata.status = item.status;
          metadata.conditions = item.conditions;
        } else if (type === 'company') {
          metadata.therapyAreas = item.therapyAreas;
        } else if (type === 'news') {
          metadata.category = item.category;
          metadata.source = item.source;
        } else if (type === 'indication') {
          metadata.category = item.category;
        }

        // Store embedding in database
        // Format embedding as PostgreSQL vector: [v1, v2, v3, ...]
        const embeddingString = `[${embedding.join(',')}]`;
        const metadataJson = JSON.stringify(metadata).replace(/'/g, "''");
        
        // Escape single quotes in content for SQL
        const escapedContent = content.replace(/'/g, "''");
        const escapedContentId = contentId.replace(/'/g, "''");
        
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Embedding" (content, "contentType", "contentId", embedding, metadata, "createdAt", "updatedAt")
           VALUES (
             '${escapedContent}',
             '${type}',
             '${escapedContentId}',
             '${embeddingString}'::vector,
             '${metadataJson}'::jsonb,
             NOW(),
             NOW()
           )
           ON CONFLICT ("contentType", "contentId") 
           DO UPDATE SET 
             content = EXCLUDED.content,
             embedding = EXCLUDED.embedding,
             metadata = EXCLUDED.metadata,
             "updatedAt" = NOW()`
        );

      processed++;
        
        // Progress indicator
        if (processed % 10 === 0) {
          console.log(`   ✅ Processed ${processed}/${items.length} ${type}s...`);
        }

        // Rate limiting: small delay to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 50));

      } catch (error: any) {
        console.error(`   ❌ Error processing ${type} ${item.id}:`, error.message);
        errors++;
      }
    }

    console.log(`\n   ✨ ${type}s complete:`);
    console.log(`      Processed: ${processed}`);
    console.log(`      Skipped (existing): ${skipped}`);
    console.log(`      Errors: ${errors}`);

  } catch (error: any) {
    console.error(`❌ Error processing ${type}s:`, error);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options: GenerateOptions = {
    skipExisting: true,
  };

  // Parse command line arguments
  for (const arg of args) {
    if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1] as any;
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1], 10);
    } else if (arg === '--no-skip') {
      options.skipExisting = false;
    }
  }

  try {
    console.log('🚀 Starting embedding generation...');
    console.log(`   OpenAI Model: text-embedding-3-small (1536 dimensions)`);
    console.log(`   Skip existing: ${options.skipExisting ? 'Yes' : 'No'}`);

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }

    // Generate embeddings for specified type or all types
    const types: Array<'trial' | 'company' | 'news' | 'indication'> = 
      options.type ? [options.type] : ['trial', 'company', 'news', 'indication'];

    for (const type of types) {
      await generateEmbeddingsForType(type, options.limit, options.skipExisting);
    }

    console.log('\n✅ Embedding generation complete!');
    
    // Show summary
    const summary = await prisma.embedding.groupBy({
      by: ['contentType'],
      _count: true,
    });

    console.log('\n📊 Embedding Summary:');
    summary.forEach(({ contentType, _count }) => {
      console.log(`   ${contentType}: ${_count} embeddings`);
    });
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
