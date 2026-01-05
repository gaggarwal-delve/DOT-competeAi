# Phase 2 - Day 2: NewsAPI Setup
**Date:** January 5, 2026  
**Goal:** Get live pharmaceutical news from NewsAPI  
**Time:** ~20 minutes

---

## ✅ Step 1: Get NewsAPI Key (5 mins)

### Register for Free Tier:
1. Go to: https://newsapi.org/register
2. Fill in:
   - First Name
   - Email: gunjan@delveinsight.com
   - Country: India
   - Purpose: "I'm not a commercial organization"
3. Click "Submit"
4. Check email for API key
5. Copy API key (32-character string)

### Free Tier Limits:
- ✅ 100 requests per day
- ✅ Articles from last 30 days
- ✅ 100 sources
- ❌ No commercial use

**Perfect for MVP testing!**

---

## ✅ Step 2: Add to Vercel Environment Variables (2 mins)

### Option A: Via Vercel Dashboard
1. Go to: https://vercel.com/delveai/competeai
2. Click "Settings" → "Environment Variables"
3. Click "Add New"
4. Key: `NEWS_API_KEY`
5. Value: `your_api_key_here`
6. Environments: Check all (Production, Preview, Development)
7. Click "Save"

### Option B: Via CLI (Automated - I'll do this)
```bash
npx vercel env add NEWS_API_KEY production
npx vercel env add NEWS_API_KEY preview
npx vercel env add NEWS_API_KEY development
```

---

## ✅ Step 3: Pull to Local (1 min)

```bash
# Pull updated environment variables
npx vercel env pull .env.local

# Verify it exists
cat .env.local | grep NEWS_API_KEY
```

---

## ✅ Step 4: Test Locally (5 mins)

```bash
# Start dev server
npm run dev

# Test news endpoint
curl http://localhost:3001/api/news?query=pharma&pageSize=5

# Expected: Real news articles about pharma!
```

---

## ✅ Step 5: Deploy to Production (3 mins)

```bash
# Commit (if any code changes)
git add -A
git commit -m "feat: Add NewsAPI integration for live pharma news"
git push origin main

# Deploy
npx vercel --prod --yes

# Test production
curl https://competeai-five.vercel.app/api/news?query=pfizer
```

---

## 🎯 Success Criteria:

After Day 2 completion:
- [ ] NewsAPI key obtained
- [ ] Key added to Vercel (all environments)
- [ ] News Feed shows REAL pharma articles (not mock data)
- [ ] Search and filters work with live data
- [ ] Production deployed and tested
- [ ] "Mock data" disclaimer removed from News page

---

## 📊 Current NewsAPI Implementation:

Our `/api/news/route.ts` already has:
- ✅ NewsAPI integration built
- ✅ Mock data fallback (if key not present)
- ✅ Caching (5 min revalidation)
- ✅ Error handling
- ✅ Rate limit handling

**What happens when we add the key:**
1. API tries to fetch from NewsAPI
2. If successful → Returns real articles
3. If rate limited → Falls back to mock data
4. If error → Falls back to mock data

**This means zero downtime!** 🎉

---

## 🔍 Testing Queries:

Once NewsAPI is configured, test with:

```bash
# General pharma news
curl https://competeai-five.vercel.app/api/news?query=pharmaceutical

# Specific company
curl https://competeai-five.vercel.app/api/news?query=pfizer

# FDA news
curl https://competeai-five.vercel.app/api/news?query=FDA+approval

# Clinical trials
curl https://competeai-five.vercel.app/api/news?query=clinical+trial

# M&A news
curl https://competeai-five.vercel.app/api/news?query=pharmaceutical+acquisition
```

---

## 💡 NewsAPI Tips:

### Best Practices:
1. **Use specific queries:** "Pfizer FDA approval" > "pharma"
2. **Combine keywords:** "pharmaceutical AND clinical trial"
3. **Exclude noise:** "biotech NOT stock price"
4. **Sort by date:** `sortBy=publishedAt` for latest news
5. **Filter by source:** Target pharma-specific sources

### Free Tier Optimization:
- Cache aggressively (we already do this - 5 min)
- Batch queries (fetch once, display many times)
- Use mock fallback for development
- Only fetch when users request (not on every page load)

### Upgrade When:
- **$449/month** for unlimited requests
- Upgrade when: >100 daily users actively searching news
- Alternative: Scrape RSS feeds (legal, but more work)

---

## 🚀 After Day 2:

**What changes:**
- News Feed page: Real articles instead of 8 mock items
- Search: Actually queries NewsAPI
- Quick filters: Work with real data
- Sources: Real news outlets (Reuters, Bloomberg, etc.)

**What stays the same:**
- UI/UX
- Layout and design
- Fallback to mock if API fails
- All other pages (Trials, Companies, Alerts)

---

## 🎉 Day 2 Complete When:

You'll know it's working when:
1. Visit: https://competeai-five.vercel.app/news
2. See headlines from today/yesterday (not mock dates)
3. Click "Read full article" → Goes to real news site
4. Search "Pfizer" → Returns actual Pfizer news
5. Bottom disclaimer says: "Powered by NewsAPI" (not "Mock data")

---

**Ready? Once you have your NewsAPI key, paste it here and I'll automate everything else!** 🚀

