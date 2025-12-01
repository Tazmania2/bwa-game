#!/bin/bash

# Vercel Deployment Script
# This script commits all necessary files and pushes to GitHub to trigger Vercel deployment

echo "🚀 Preparing Vercel Deployment..."
echo ""

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Show current status
echo "📋 Current Git Status:"
git status --short
echo ""

# Add all necessary files
echo "📦 Adding files to Git..."
git add .gitignore
git add vercel.json
git add .vercelignore
git add src/environments/environment.prod.ts
git add src/environments/environment.homol.ts
git add src/environments/environment.ts
git add docs/
git add *.md
git add package.json
git add angular.json

echo "✅ Files added"
echo ""

# Show what will be committed
echo "📝 Files to be committed:"
git status --short
echo ""

# Commit
echo "💾 Committing changes..."
git commit -m "fix: configure Vercel deployment with environment files

- Remove environment.prod.ts from .gitignore
- Update vercel.json to use rewrites instead of routes
- Add environment files with process.env references
- Configure proper build command
- Add deployment documentation"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful"
    echo ""
    
    # Push
    echo "🚀 Pushing to GitHub..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Successfully pushed to GitHub!"
        echo ""
        echo "🎉 Vercel will now automatically deploy your application"
        echo ""
        echo "📊 Monitor deployment at: https://vercel.com/dashboard"
        echo ""
    else
        echo "❌ Push failed. Please check your Git configuration."
        exit 1
    fi
else
    echo "ℹ️  Nothing to commit (already up to date)"
fi

echo "✨ Done!"
