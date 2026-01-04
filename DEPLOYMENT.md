# 🚀 CompeteAI - Deployment Guide

## ✅ What You Have Now
- ✅ Fully functional Next.js 15 app
- ✅ ClinicalTrials.gov API integration working
- ✅ Clinical Trials dashboard
- ✅ Prisma schema ready
- ✅ Git repository initialized

## 🎯 Deploy to Vercel (5 minutes)

### Step 1: Create GitHub Repository
1. Go to: https://github.com/new
2. Repository name: `competeai`
3. Private (recommended)
4. **Do NOT** initialize with README (we already have one)
5. Click "Create repository"

### Step 2: Push Code to GitHub
```bash
cd "/Users/gunjan.a/Documents/3. DELVE INSIGHT- D O T/1. DelveAI/1. Workspaces/3. CompeteAI/competeai"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/competeai.git

# Rename branch to main
git branch -M main

# Push code
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to: https://vercel.com/
2. Click "Add New Project"
3. Import from GitHub → Select `competeai` repository
4. Vercel will auto-detect Next.js
5. Click "Deploy"
6. **Wait 2-3 minutes** for deployment

### Step 4: Add Vercel Postgres
1. In your Vercel project dashboard
2. Go to "Storage" tab
3. Click "Create Database" → Select "Postgres"
4. Name: `competeai-db`
5. Click "Create"
6. Vercel will automatically add these env vars to your project:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### Step 5: Push Database Schema
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Push Prisma schema to database
npm run db:push
```

### Step 6: Redeploy
In Vercel dashboard:
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
3. Wait 2 minutes

## 🎉 Done!

Your app is live at: `https://competeai-your-username.vercel.app`

### Test It
1. Visit homepage
2. Click "Launch Dashboard"
3. Search for "Cancer" trials
4. Should see real data from ClinicalTrials.gov

## 📝 Environment Variables Checklist

In Vercel dashboard → Settings → Environment Variables:

### Auto-Added by Vercel (✅ Done automatically)
- ✅ `POSTGRES_URL`
- ✅ `POSTGRES_PRISMA_URL`
- ✅ `POSTGRES_URL_NON_POOLING`

### Add Manually (Phase 2)
- ⏸️ `NEWS_API_KEY` (get from https://newsapi.org/)
- ⏸️ `CLINICALTRIALS_API_URL` = `https://clinicaltrials.gov/api/v2`

## 🐛 Troubleshooting

### Issue: "Database connection failed"
**Solution**: Run `npm run db:push` after pulling env vars

### Issue: "Failed to fetch trials"
**Solution**: Check browser console - might be CORS or network issue

### Issue: "Module not found"
**Solution**: Make sure all dependencies are in `package.json`, redeploy

## 📦 Current Features Working
✅ Homepage
✅ Clinical Trials Dashboard (live data from ClinicalTrials.gov)
✅ Search by condition
✅ Responsive design
✅ Direct links to trial pages

## 🚧 Next Steps (After Deployment)
1. Add News API integration
2. Build Company profiles
3. Add database seeding script
4. Create alerts system

---

**Need Help?** Check Vercel docs or ask me!

