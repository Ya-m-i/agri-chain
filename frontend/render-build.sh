#!/bin/bash

# Render Build Script for Frontend
echo "🌾 Starting AGRI-CHAIN Frontend Build for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
if [ -d "dist" ]; then
    echo "✅ Build successful! dist/ folder created"
    ls -la dist/
else
    echo "❌ Build failed! dist/ folder not found"
    exit 1
fi

echo "🎉 Build complete! Ready for deployment"

