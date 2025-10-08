#!/bin/bash

# AGRI-CHAIN GitHub Pages Deployment Script
# This script builds and deploys the React app to GitHub Pages

echo "🌾 Starting AGRI-CHAIN deployment to GitHub Pages..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Error: Build failed - dist directory not found"
    exit 1
fi

echo "✅ Build completed successfully!"

# Copy the 404.html and .nojekyll files to dist
echo "📋 Copying SPA routing files..."
cp public/404.html dist/
cp public/.nojekyll dist/

echo "🚀 Ready for deployment!"
echo ""
echo "To deploy to GitHub Pages:"
echo "1. Commit and push your changes:"
echo "   git add ."
echo "   git commit -m 'fix: Add SPA routing support for GitHub Pages'"
echo "   git push origin main"
echo ""
echo "2. The GitHub Actions will automatically deploy to GitHub Pages"
echo "   Your app will be available at: https://ya-m-i.github.io/agri-chain/"
echo ""
echo "✅ SPA routing files added:"
echo "   - 404.html (redirects 404s to index.html)"
echo "   - .nojekyll (disables Jekyll processing)"
echo ""
echo "🎉 Deployment preparation complete!"
