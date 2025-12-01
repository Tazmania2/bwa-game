@echo off
REM Vercel Deployment Script for Windows
REM This script commits all necessary files and pushes to GitHub to trigger Vercel deployment

echo.
echo 🚀 Preparing Vercel Deployment...
echo.

REM Check if we're in a git repository
if not exist .git (
    echo ❌ Error: Not a git repository
    exit /b 1
)

REM Show current status
echo 📋 Current Git Status:
git status --short
echo.

REM Add all necessary files
echo 📦 Adding files to Git...
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

echo ✅ Files added
echo.

REM Show what will be committed
echo 📝 Files to be committed:
git status --short
echo.

REM Commit
echo 💾 Committing changes...
git commit -m "fix: configure Vercel deployment with environment files" -m "- Remove environment.prod.ts from .gitignore" -m "- Update vercel.json to use rewrites instead of routes" -m "- Add environment files with process.env references" -m "- Configure proper build command" -m "- Add deployment documentation"

if %errorlevel% equ 0 (
    echo ✅ Commit successful
    echo.
    
    REM Push
    echo 🚀 Pushing to GitHub...
    git push origin main
    
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo 🎉 Vercel will now automatically deploy your application
        echo.
        echo 📊 Monitor deployment at: https://vercel.com/dashboard
        echo.
    ) else (
        echo ❌ Push failed. Please check your Git configuration.
        exit /b 1
    )
) else (
    echo ℹ️  Nothing to commit (already up to date)
)

echo ✨ Done!
pause
