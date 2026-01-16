/**
 * Enable pgvector extension in Neon database
 * Run this once to enable vector support
 * 
 * Usage: tsx scripts/enable-pgvector.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enablePgVector() {
  try {
    console.log('🔧 Enabling pgvector extension...');
    
    // Enable pgvector extension
    await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
    
    console.log('✅ pgvector extension enabled successfully!');
    
    // Verify extension is installed
    const result = await prisma.$queryRawUnsafe<Array<{ extname: string }>>(
      "SELECT extname FROM pg_extension WHERE extname = 'vector';"
    );
    
    if (result.length > 0) {
      console.log('✅ Verified: pgvector extension is active');
    } else {
      console.warn('⚠️  Warning: pgvector extension not found (may need manual setup)');
    }
    
  } catch (error: any) {
    console.error('❌ Error enabling pgvector:', error.message);
    
    if (error.message.includes('permission denied')) {
      console.error('\n💡 Tip: You may need to enable pgvector manually in Neon dashboard:');
      console.error('   1. Go to Neon dashboard → SQL Editor');
      console.error('   2. Run: CREATE EXTENSION IF NOT EXISTS vector;');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

enablePgVector()
  .then(() => {
    console.log('\n✨ Done! You can now generate embeddings.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed to enable pgvector:', error);
    process.exit(1);
  });
