# ⚡ 5-MINUTE DEPLOYMENT GUIDE

## Step 1: Create GitHub Repo (2 minutes)

1. **Open**: https://github.com/new
2. **Repository name**: `competeai`
3. **Private**: ✅ (recommended)
4. **Do NOT check** "Initialize with README"
5. Click **"Create repository"**

You'll see a page with instructions - **ignore them**, follow below instead.

---

## Step 2: Push Code to GitHub (1 minute)

**Copy your GitHub username** from the page above, then run:

```bash
cd "/Users/gunjan.a/Documents/3. DELVE INSIGHT- D O T/1. DelveAI/1. Workspaces/3. CompeteAI/competeai"

# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/competeai.git

git branch -M main

git push -u origin main
```

**Enter your GitHub credentials** when prompted.

✅ **Done!** Code is on GitHub.

---

## Step 3: Deploy to Vercel (2 minutes)

1. **Open**: https://vercel.com/
2. **Sign in** with GitHub
3. Click **"Add New Project"**
4. Find **"competeai"** in your repos
5. Click **"Import"**
6. **No changes needed** - Vercel auto-detects Next.js
7. Click **"Deploy"**
8. **Wait 2-3 minutes** ⏱️

✅ **Your app is LIVE!** 🎉

You'll get a URL like: `https://competeai-yourname.vercel.app`

---

## Step 4: Add Database (Optional - for later)

**Only do this when you need database features:**

1. In Vercel project → **"Storage"** tab
2. Click **"Create Database"** → **"Postgres"**
3. Name: `competeai-db`
4. Click **"Create"**

Then locally:
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npm run db:push
```

Then **Redeploy** in Vercel dashboard.

---

## ✅ THAT'S IT!

**Test your live app:**
1. Visit your Vercel URL
2. Click "Launch Dashboard"
3. Search for "Cancer"
4. See real clinical trials! 🎉

---

## 🐛 Troubleshooting

**"git push" asks for password:**
- Use GitHub Personal Access Token (not password)
- Generate at: https://github.com/settings/tokens
- Select: repo, workflow
- Copy token and use as password

**"Failed to fetch trials" on deployed site:**
- Check browser console for errors
- ClinicalTrials.gov API might have rate limits
- Try again in a few seconds

**Vercel deployment failed:**
- Check build logs in Vercel dashboard
- Usually it's a TypeScript error or missing dependency
- Let me know and I'll fix it!

---

## 🎯 What Works Now (No Database Needed)

✅ Homepage  
✅ Clinical Trials Dashboard  
✅ Live ClinicalTrials.gov API  
✅ Search & filters  
✅ Beautiful UI  

**Everything is working without database!** 

Database is only needed later for:
- Saving companies
- Storing news
- Custom alerts
- Historical data

---

**Ready? Start with Step 1!** 🚀

