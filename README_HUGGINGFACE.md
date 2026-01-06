# Hugging Face Embeddings Setup

## 🚀 Quick Start

### Step 1: Get Free API Key (2 minutes)

1. Sign up at https://huggingface.co/join (if you don't have an account)
2. Go to https://huggingface.co/settings/tokens
3. Click "New token"
4. Name it: `competeai-embeddings`
5. Select "Read" permission
6. Copy the token (starts with `hf_...`)

### Step 2: Add to Environment Variables

Add to `.env.local`:
```bash
HUGGINGFACE_API_KEY=hf_your_token_here
```

### Step 3: Test the API

```bash
npx tsx scripts/test-embeddings.ts
```

You should see:
```
✅ Success!
📊 Embedding dimensions: 768
🎉 Hugging Face API is working!
```

### Step 4: Generate All Embeddings

```bash
npx tsx scripts/generate-embeddings.ts
```

**Time:** ~2-3 hours for 6,000+ items (with rate limiting)
**Cost:** $0 (FREE!)

---

## 📊 Model Details

- **Model:** `sentence-transformers/all-mpnet-base-v2`
- **Dimensions:** 768
- **Quality:** Excellent (state-of-the-art)
- **Cost:** FREE (unlimited requests)
- **Rate Limit:** 
  - Without API key: ~30 requests/min
  - With API key: ~100 requests/min

---

## 🔧 Troubleshooting

### Error: "401 Unauthorized"
- Make sure `HUGGINGFACE_API_KEY` is set in `.env.local`
- Verify the token is correct (starts with `hf_`)

### Error: "Rate limit exceeded"
- The script automatically retries after 5 seconds
- With API key: ~100 req/min (faster)
- Without API key: ~30 req/min (slower)

### Error: "Model is loading"
- First request may take 10-20 seconds (model cold start)
- Subsequent requests are fast (~1-2 seconds)

---

## 💡 Tips

1. **Get the API key** - It's free and gives you 3x faster rate limits
2. **Run overnight** - For 6,000 items, it takes 2-3 hours
3. **Resume if interrupted** - Script skips already-generated embeddings
4. **Monitor progress** - Script shows progress every 10 items

---

## ✅ Success Criteria

After running the script, you should have:
- ✅ ~6,000 indication embeddings
- ✅ ~50 company embeddings  
- ✅ ~100 news embeddings
- ✅ Total: ~6,150 embeddings in database
- ✅ Ready for RAG search!

