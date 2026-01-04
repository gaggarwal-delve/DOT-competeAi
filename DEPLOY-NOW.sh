#!/bin/bash

# CompeteAI Deployment Script
# Run this after creating GitHub repo

echo "🚀 CompeteAI Deployment Script"
echo "================================"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

# Get repo name (default: competeai)
read -p "Enter repository name (default: competeai): " REPO_NAME
REPO_NAME=${REPO_NAME:-competeai}

echo ""
echo "📦 Adding GitHub remote..."
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git" 2>/dev/null || \
  git remote set-url origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

echo "✅ Remote added: https://github.com/$GITHUB_USERNAME/$REPO_NAME"

echo ""
echo "🔄 Renaming branch to main..."
git branch -M main

echo ""
echo "⬆️  Pushing code to GitHub..."
git push -u origin main

echo ""
echo "✅ Code pushed successfully!"
echo ""
echo "================================"
echo "📝 NEXT STEPS:"
echo "================================"
echo ""
echo "1. Go to: https://vercel.com/"
echo "2. Click 'Add New Project'"
echo "3. Import from GitHub: $REPO_NAME"
echo "4. Click 'Deploy' (takes 2-3 mins)"
echo ""
echo "5. After deployment:"
echo "   - Go to 'Storage' tab"
echo "   - Click 'Create Database' → 'Postgres'"
echo "   - Name: competeai-db"
echo "   - Click 'Create'"
echo ""
echo "6. Pull environment variables:"
echo "   vercel env pull .env.local"
echo ""
echo "7. Push database schema:"
echo "   npm run db:push"
echo ""
echo "8. Redeploy in Vercel dashboard"
echo ""
echo "🎉 Your app will be live at:"
echo "   https://$REPO_NAME-$GITHUB_USERNAME.vercel.app"
echo ""

