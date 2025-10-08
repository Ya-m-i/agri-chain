@echo off
REM AGRI-CHAIN GitHub Pages Deployment Script for Windows
REM This script builds and deploys the React app to GitHub Pages

echo 🌾 Starting AGRI-CHAIN deployment to GitHub Pages...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the frontend directory
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build the project
echo 🔨 Building the project...
call npm run build

REM Check if build was successful
if not exist "dist" (
    echo ❌ Error: Build failed - dist directory not found
    exit /b 1
)

echo ✅ Build completed successfully!

REM Copy the 404.html and .nojekyll files to dist
echo 📋 Copying SPA routing files...
copy "public\404.html" "dist\"
copy "public\.nojekyll" "dist\"

echo 🚀 Ready for deployment!
echo.
echo To deploy to GitHub Pages:
echo 1. Commit and push your changes:
echo    git add .
echo    git commit -m "fix: Add SPA routing support for GitHub Pages"
echo    git push origin main
echo.
echo 2. The GitHub Actions will automatically deploy to GitHub Pages
echo    Your app will be available at: https://ya-m-i.github.io/agri-chain/
echo.
echo ✅ SPA routing files added:
echo    - 404.html (redirects 404s to index.html)
echo    - .nojekyll (disables Jekyll processing)
echo.
echo 🎉 Deployment preparation complete!
pause
