# CompeteAI - Pharmaceutical Competitive Intelligence Dashboard

Real-time competitive intelligence platform for pharmaceutical companies to monitor:
- 🧬 Clinical trials from ClinicalTrials.gov (10,000+ trials)
- 🏢 50+ pharma & biotech companies
- 📰 Real-time news and market intelligence
- 📊 Regulatory events and deal activity

## Tech Stack
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS
- **Database**: Vercel Postgres
- **APIs**: ClinicalTrials.gov, NewsAPI
- **Deployment**: Vercel

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Database
1. Deploy to Vercel (auto-creates Vercel Postgres)
2. Copy connection strings from Vercel dashboard to `.env.local`

### 3. Run Database Migrations
```bash
npm run db:push
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
CLINICALTRIALS_API_URL=https://clinicaltrials.gov/api/v2
NEWS_API_KEY=
```

## Features

### Phase 1 (MVP - Current)
- ✅ Clinical trials monitoring
- ✅ Company profiles
- ✅ News aggregation
- ✅ Real-time dashboard

### Phase 2 (Upcoming)
- AI-powered summaries
- Advanced competitive scoring
- Custom alerts
- Historical analysis

## Deployment
1. Push to GitHub
2. Import to Vercel
3. Add Vercel Postgres
4. Deploy!

Live at: [competeai.vercel.app](https://competeai.vercel.app) (after deployment)

---

Built with ❤️ by DelveInsight | 2026

