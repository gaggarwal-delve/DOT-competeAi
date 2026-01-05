# CompeteAI - Phase 2 Setup Guide
**Started:** January 5, 2026  
**Goal:** Database + Live APIs working  
**Timeline:** 2 weeks

---

## ✅ STEP 1: Create Vercel Postgres Database (10 mins)

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to your Vercel Dashboard:**
   - URL: https://vercel.com/dot-c024952a/competeai
   - Or: https://vercel.com → Select "competeai" project

2. **Navigate to Storage Tab:**
   - Click on your project name
   - Click "Storage" tab at the top

3. **Create New Database:**
   - Click "Create Database"
   - Select "Postgres"
   - Database name: `competeai-db` (or any name you prefer)
   - Region: `iad1` (US East) - same as your deployment
   - Plan: **Hobby (Free)** - 256MB storage, 60 hours compute

4. **Confirm Creation:**
   - Click "Create"
   - Wait ~30 seconds for provisioning
   - You'll see "Database created successfully" ✅

5. **Environment Variables (Automatic):**
   - Vercel automatically adds these to your project:
     - `POSTGRES_URL`
     - `POSTGRES_PRISMA_URL`
     - `POSTGRES_URL_NON_POOLING`
     - `POSTGRES_USER`
     - `POSTGRES_HOST`
     - `POSTGRES_PASSWORD`
     - `POSTGRES_DATABASE`

6. **Verify Variables:**
   - Go to Settings → Environment Variables
   - You should see all 7 variables listed
   - These are now available to your deployed app

### Option B: Via Vercel CLI (Alternative)

```bash
# If you prefer CLI
vercel storage create postgres competeai-db
```

---

## ✅ STEP 2: Pull Environment Variables Locally (5 mins)

Now let's get these database credentials to your local development environment:

```bash
# Navigate to project directory
cd "/Users/gunjan.a/Documents/3. DELVE INSIGHT- D O T/1. DelveAI/1. Workspaces/3. CompeteAI/competeai"

# Pull environment variables from Vercel
vercel env pull .env.local

# This creates .env.local with all your database credentials
```

**What this does:**
- Downloads all environment variables from Vercel
- Creates `.env.local` file in your project root
- This file is already in `.gitignore` (won't be committed)

**Verify it worked:**
```bash
# Check if .env.local exists and has content
cat .env.local

# You should see:
# POSTGRES_URL="postgres://..."
# POSTGRES_PRISMA_URL="postgres://..."
# POSTGRES_URL_NON_POOLING="postgres://..."
# etc.
```

---

## ✅ STEP 3: Push Database Schema (2 mins)

Now let's create the actual tables in your database:

```bash
# Still in the competeai directory
npx prisma db push

# You should see:
# ✔ Generated Prisma Client
# ✔ Database schema in sync with Prisma schema
```

**What this does:**
- Reads your `prisma/schema.prisma` file
- Creates tables in your Vercel Postgres database:
  - `Company` table
  - `ClinicalTrial` table
  - `NewsItem` table
- Creates indexes for performance
- Generates Prisma Client for TypeScript

**Troubleshooting:**

If you see: `Error: P1001: Can't reach database server`
- Check your `.env.local` file exists
- Verify `POSTGRES_PRISMA_URL` is set
- Try running `vercel env pull .env.local` again

If you see: `Error: Schema is not valid`
- Run `npx prisma format` to fix schema formatting
- Check `prisma/schema.prisma` for syntax errors

---

## ✅ STEP 4: Seed the Database (3 mins)

Now let's populate the database with 50 pharmaceutical companies:

```bash
# Seed the database
npm run db:seed

# You should see:
# 🌱 Seeding database...
# ✅ Seeded Pfizer
# ✅ Seeded Roche
# ✅ Seeded Novartis
# ... (50 companies total)
# ✅ Seeding finished.
```

**What this does:**
- Runs `prisma/seed.ts`
- Inserts 50 companies with:
  - Name, slug, headquarters, website
  - Therapy areas (Oncology, Immunology, etc.)
- Uses `upsert` to avoid duplicates

**Verify seeding worked:**

```bash
# Open Prisma Studio to view your data
npx prisma studio

# This opens http://localhost:5555
# Click "Company" table
# You should see 50 companies listed
```

**Alternative: Query via CLI**

```bash
# Connect to database and run SQL
npx prisma db execute --stdin <<EOF
SELECT name, headquarters, array_length("therapyAreas", 1) as therapy_count 
FROM "Company" 
LIMIT 10;
EOF

# You should see a list of 10 companies with their therapy area counts
```

---

## ✅ STEP 5: Test Locally (5 mins)

Now let's test that your local app can read from the database:

```bash
# Start development server
npm run dev

# Server starts at http://localhost:3000
```

**Test the Companies page:**

1. Open http://localhost:3000/companies
2. You should now see **50 real companies** instead of mock data
3. Try searching for "Pfizer" - should show results
4. Try filtering by therapy area - should work
5. Check browser console - should see no errors

**Test the API directly:**

```bash
# In a new terminal, test the API
curl http://localhost:3000/api/companies | jq '.companies | length'

# Should return: 50
```

**Expected output:**
- Companies page loads with 50 companies
- Search and filters work
- Each company shows therapy areas
- Trial and news counts show (may be 0 for now)

---

## ✅ STEP 6: Deploy to Production (3 mins)

Now let's deploy to Vercel so the live site uses the database:

```bash
# Commit the changes (if any were made)
git add -A
git commit -m "feat: Database seeded with 50 companies"
git push origin main

# Deploy to production
npx vercel --prod --yes

# Wait for deployment (~60 seconds)
# You'll see:
# ✅ Production: https://competeai-five.vercel.app [1m]
```

**Test production:**

1. Visit https://competeai-five.vercel.app/companies
2. Should now show 50 real companies (not mock data)
3. All functionality should work

---

## ✅ STEP 7: Verify Everything Works (5 mins)

### Final Checklist:

**Local Development:**
- [ ] `.env.local` file exists with database credentials
- [ ] `npx prisma studio` shows 50 companies
- [ ] http://localhost:3000/companies shows real data
- [ ] Search and filters work
- [ ] No console errors

**Production:**
- [ ] https://competeai-five.vercel.app/companies shows real data
- [ ] All 50 companies visible
- [ ] Search by name works
- [ ] Filter by therapy area works
- [ ] Mobile responsive

**Database:**
- [ ] Vercel Postgres database created
- [ ] Environment variables set in Vercel
- [ ] Schema pushed successfully
- [ ] 50 companies seeded

---

## 🎉 SUCCESS CRITERIA

You'll know Step 1 is complete when:

✅ Companies page shows "Pfizer", "Roche", "Novartis", etc. (real data)  
✅ Search for "Pfizer" returns results  
✅ Filter by "Oncology" shows ~15 companies  
✅ No "Mock data" disclaimer at the bottom  
✅ Browser console has no errors  
✅ Production and local environments both work  

---

## 📊 What We Accomplished

**Before (Phase 1):**
- Companies page: Mock data (20 companies)
- Database: Not connected
- API: Fallback to hardcoded data

**After (Phase 2 - Day 1):**
- Companies page: Real data (50 companies)
- Database: Vercel Postgres connected ✅
- API: Reading from database ✅

---

## 🚀 NEXT STEPS (Day 2 - Tomorrow)

Once Step 1 is complete, we'll move to:

**Step 2: NewsAPI Setup (3 hours)**
1. Sign up for NewsAPI (free tier)
2. Add API key to Vercel environment variables
3. Test News Feed with live pharma news
4. Verify fallback still works (for rate limiting)

**Step 3: Company-Trial Linking (8 hours)**
1. Update `/api/trials` to match sponsors to companies
2. Add fuzzy matching for company names
3. Display company logos on trials
4. Test sponsor matching accuracy

---

## 🆘 TROUBLESHOOTING

### Issue: `prisma db push` fails

**Solution:**
```bash
# Regenerate Prisma Client
npx prisma generate

# Try push again
npx prisma db push
```

### Issue: Seeding fails with "unique constraint violation"

**Solution:**
```bash
# Database already seeded, clear it first
npx prisma db execute --stdin <<EOF
DELETE FROM "Company";
EOF

# Seed again
npm run db:seed
```

### Issue: Production shows mock data, local shows real data

**Solution:**
- Environment variables not set in Vercel
- Go to Vercel Dashboard → Settings → Environment Variables
- Verify all `POSTGRES_*` variables are present
- Redeploy: `npx vercel --prod --yes`

### Issue: Can't connect to database

**Solution:**
```bash
# Check environment variables
cat .env.local | grep POSTGRES

# Pull fresh variables from Vercel
vercel env pull .env.local --force

# Restart dev server
npm run dev
```

---

## 📞 NEED HELP?

If you get stuck:
1. Check browser console for errors
2. Check terminal output for error messages
3. Review `DELVEAI_INTERNAL_DEV_HANDBOOK.md` for troubleshooting
4. Check Vercel logs: https://vercel.com/dot-c024952a/competeai/logs

---

**Ready? Let's execute! 🚀**

Start with the Vercel Dashboard (Option A above) and work through each step.
I'll be here to help if you hit any issues!

