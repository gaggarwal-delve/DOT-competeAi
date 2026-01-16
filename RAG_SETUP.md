# RAG Q&A Setup Guide - Week 9

This guide walks you through setting up the RAG (Retrieval-Augmented Generation) Q&A feature for CompeteAI.

## Prerequisites

- ✅ Neon Postgres database configured
- ✅ OpenAI API key set in environment variables
- ✅ Prisma schema updated (already done)

## Step 1: Enable pgvector Extension

The pgvector extension must be enabled in your Neon database.

### Option A: Using Script (Recommended)

```bash
cd competeai
tsx scripts/enable-pgvector.ts
```

### Option B: Manual Setup (If script fails)

1. Go to [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Open SQL Editor
4. Run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## Step 2: Update Database Schema

Push the updated Prisma schema (includes Embedding model with 1536 dimensions):

```bash
npx prisma db push
```

This creates the `Embedding` table with vector support.

## Step 3: Generate Embeddings

Generate embeddings for your existing data. This process may take time depending on data volume.

### Generate for All Types

```bash
tsx scripts/generate-embeddings.ts
```

### Generate for Specific Type

```bash
# Trials only
tsx scripts/generate-embeddings.ts --type=trial

# Companies only
tsx scripts/generate-embeddings.ts --type=company

# News only
tsx scripts/generate-embeddings.ts --type=news

# Indications only
tsx scripts/generate-embeddings.ts --type=indication
```

### Options

- `--limit=N`: Limit number of items to process (useful for testing)
- `--no-skip`: Regenerate embeddings even if they exist

### Example: Test with 10 trials

```bash
tsx scripts/generate-embeddings.ts --type=trial --limit=10
```

## Step 4: Verify Setup

1. Check embeddings were created:
```bash
npx prisma studio
```
Navigate to `Embedding` table and verify records exist.

2. Test the API endpoint:
```bash
curl -X POST http://localhost:3000/api/ai/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What are Pfizer trials?"}'
```

## Step 5: Deploy to Production

1. **Enable pgvector in production database:**
   - Go to Neon dashboard → Production database
   - Run: `CREATE EXTENSION IF NOT EXISTS vector;`

2. **Push schema:**
```bash
npx prisma db push
```

3. **Generate embeddings in production:**
   - Option A: Run script locally pointing to production DB
   - Option B: Use Vercel CLI to run script:
```bash
vercel env pull .env.production.local
tsx scripts/generate-embeddings.ts
```

4. **Deploy:**
```bash
git add .
git commit -m "feat: Add RAG Q&A with pgvector"
git push
```

## Usage

Once set up, users can:

1. Open the sidebar in CompeteAI
2. Find "Ask CompeteAI" component
3. Enter natural language queries like:
   - "What are Pfizer's Phase 3 oncology trials?"
   - "Latest FDA approvals in immunology?"
   - "Compare Roche and Novartis in oncology"

## Cost Estimation

- **Embedding Generation:** ~$0.02 per 1M tokens
  - Average: ~500 tokens per item
  - 1,000 items = ~500K tokens = ~$0.01
- **Query Processing:** ~$0.15 per 1M input tokens + $0.60 per 1M output tokens
  - Average query: ~1,000 input tokens, ~200 output tokens
  - 1,000 queries = ~$0.15 + $0.12 = ~$0.27

**Estimated monthly cost:** $5-20 (depending on usage)

## Troubleshooting

### Error: "pgvector extension not found"
- Ensure extension is enabled in Neon dashboard
- Check database connection string is correct

### Error: "OPENAI_API_KEY not set"
- Add `OPENAI_API_KEY` to `.env.local` (development)
- Add to Vercel environment variables (production)

### No results returned
- Verify embeddings exist: `SELECT COUNT(*) FROM "Embedding";`
- Check content type filter is correct
- Ensure query embedding generation succeeded

### Slow query performance
- Add index on `contentType` (already in schema)
- Consider limiting results with `limit` parameter
- Monitor database query performance in Neon dashboard

## Architecture

```
User Query
    ↓
Generate Query Embedding (OpenAI)
    ↓
Vector Similarity Search (pgvector)
    ↓
Retrieve Top-K Similar Documents
    ↓
Build Context from Documents
    ↓
Generate Answer with OpenAI (RAG)
    ↓
Return Answer + Sources
```

## Next Steps

- [ ] Monitor embedding generation costs
- [ ] Add caching for frequent queries
- [ ] Implement incremental embedding updates
- [ ] Add query analytics
- [ ] Optimize vector search performance

---

**Status:** ✅ Ready for testing  
**Last Updated:** January 6, 2026
