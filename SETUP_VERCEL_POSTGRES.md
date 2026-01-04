# 🗄️ Vercel Postgres Setup for CompeteAI

## Quick Setup (10 minutes)

Your app is **LIVE** but needs a database to show company data. Follow these steps:

---

## Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dot-c024952a/competeai
   - Click **"Storage"** tab in top navigation

2. **Create Database:**
   - Click **"Create Database"** button
   - Select **"Postgres"** (Vercel Postgres)
   - **Name:** `competeai-db`
   - **Region:** `iad1` (Washington DC - same as your app)
   - **Plan:** **Hobby** (Free tier)
     - 60 hours compute/month
     - 256 MB storage
     - Perfect for MVP!

3. **Click "Create"**
   - Wait 30 seconds for provisioning
   - Database will auto-connect to your project

---

## Step 2: Verify Environment Variables

Vercel automatically adds these to your project:

```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
```

✅ **No action needed** - Vercel handles this automatically!

---

## Step 3: Push Database Schema

On your local machine:

```bash
cd "/Users/gunjan.a/Documents/3. DELVE INSIGHT- D O T/1. DelveAI/1. Workspaces/3. CompeteAI/competeai"

# Push schema to Vercel Postgres
npx prisma db push
```

You'll see:
```
✔ Database synchronized with Prisma schema
✔ Generated Prisma Client
```

---

## Step 4: Seed Company Data

```bash
# Seed 50 pharmaceutical companies
npm run db:seed
```

You'll see:
```
🌱 Starting database seed...
🗑️  Clearing existing data...
🏢 Seeding 50 pharmaceutical companies...
✅ Created 50 companies
✅ Database seeded successfully!

📊 Summary:
   - Companies: 50

🎉 Ready to use CompeteAI!
```

---

## Step 5: Verify It Works

1. **Visit:** https://competeai-five.vercel.app/companies
2. You should see **50 pharmaceutical companies**!
3. Try filtering by therapy area (Oncology, Cardiology, etc.)
4. Click on company websites or view their trials

---

## 🎯 What You Get

### **50 Top Pharma Companies Including:**
- **Big Pharma:** Pfizer, Roche, Novartis, J&J, Merck, AbbVie, Sanofi, GSK, AstraZeneca, BMS
- **Biotech Leaders:** Amgen, Gilead, Biogen, Regeneron, Vertex, Moderna
- **Gene Therapy:** CRISPR Therapeutics, Editas, Intellia, Beam, Bluebird Bio
- **Emerging:** Recursion, Relay, Denali, Alector, Kymera

### **Company Data:**
- ✅ Name, headquarters, website
- ✅ Founded year
- ✅ Therapy areas (Oncology, Immunology, etc.)
- ✅ Trial counts (linked to ClinicalTrials.gov)
- ✅ News counts (linked to NewsAPI)

---

## 🔄 For Local Development

If you want to develop locally with the database:

1. **Copy connection string:**
   - Go to Vercel Dashboard → Storage → competeai-db
   - Click "Connect" → Copy `.env.local` tab

2. **Create `.env.local`:**
```bash
# In competeai directory
touch .env.local
```

3. **Paste environment variables:**
```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
```

4. **Run locally:**
```bash
npm run dev
# Visit http://localhost:3000/companies
```

---

## 🛠️ Database Management

### View Data in Prisma Studio
```bash
npx prisma studio
# Opens at http://localhost:5555
```

### View Data in Vercel Dashboard
1. Go to: https://vercel.com/dot-c024952a/competeai
2. Click **Storage** → **competeai-db**
3. Click **Data** tab
4. Run SQL queries directly

### Reset Database
```bash
# Clear all data
npx prisma db push --force-reset

# Re-seed
npm run db:seed
```

---

## 📊 Free Tier Limits

**Hobby Plan (Free):**
- ✅ 60 hours compute/month (plenty for MVP)
- ✅ 256 MB storage (enough for 10K+ companies)
- ✅ 256 MB data transfer/month
- ✅ Perfect for development & demos

**Monitor usage:**
- Vercel Dashboard → Storage → Usage tab
- Set up alerts when approaching limits

---

## 🐛 Troubleshooting

### "Can't reach database server"
```bash
# Check environment variables in Vercel
vercel env ls

# Pull latest env vars
vercel env pull .env.local
```

### "Table does not exist"
```bash
# Push schema again
npx prisma db push
```

### "No companies showing"
```bash
# Re-run seed
npm run db:seed
```

### Build fails on Vercel
- ✅ Already fixed! `prisma generate` runs automatically
- Check: https://vercel.com/dot-c024952a/competeai/deployments

---

## ✅ Next Steps After Setup

Once database is set up:

1. **Test Companies Page:**
   - https://competeai-five.vercel.app/companies
   - Filter by therapy area
   - Search by name/location

2. **Link Trials to Companies:**
   - Coming soon: Auto-match trials to companies
   - Based on sponsor name matching

3. **Add More Features:**
   - Company detail pages
   - Pipeline tracking
   - Competitive analysis

---

## 🎉 You're Done!

After completing these steps, your CompeteAI dashboard will have:
- ✅ 50 pharmaceutical companies
- ✅ Live clinical trials data
- ✅ Pharma news feed
- ✅ Alert management system
- ✅ Fully functional CI dashboard

**Time to complete:** ~10 minutes

**Questions?** Check the main docs or Vercel's Postgres guide:
- https://vercel.com/docs/storage/vercel-postgres

