# GitHub Pages SPA Deployment Guide

## 🚨 Problem: 404 Errors on Refresh

When users refresh the page or navigate directly to routes like `/admin` or `/farmer-dashboard`, they get a 404 error because GitHub Pages doesn't know how to handle client-side routing.

## ✅ Solution: SPA Routing Support

### Files Added:

1. **`frontend/public/404.html`** - Redirects all 404s to the main app
2. **`frontend/public/.nojekyll`** - Disables Jekyll processing
3. **Updated `frontend/src/App.jsx`** - Handles GitHub Pages redirect format

### How It Works:

1. **404.html**: When GitHub Pages can't find a file, it serves `404.html`
2. **Redirect Script**: The 404.html contains JavaScript that redirects to the main app while preserving the original path
3. **React Router**: The app loads and React Router handles the routing
4. **Path Restoration**: The redirect preserves the original URL path

### Deployment Steps:

#### Option 1: Automatic (Recommended)
```bash
# Build and deploy
cd frontend
npm run build

# Copy SPA files to dist
cp public/404.html dist/
cp public/.nojekyll dist/

# Commit and push
git add .
git commit -m "fix: Add SPA routing support for GitHub Pages"
git push origin main
```

#### Option 2: Using Deployment Scripts
```bash
# Windows
cd frontend
deploy.bat

# Linux/Mac
cd frontend
./deploy.sh
```

### Testing the Fix:

1. **Deploy the changes** to GitHub Pages
2. **Navigate to** `https://ya-m-i.github.io/agri-chain/admin`
3. **Refresh the page** - should work without 404
4. **Navigate to** `https://ya-m-i.github.io/agri-chain/farmer-dashboard`
5. **Refresh the page** - should work without 404

### Technical Details:

#### 404.html Script:
```javascript
// Preserves the current path and redirects to index.html
var pathSegmentsToKeep = 1;
var l = window.location;
var redirectUrl = l.protocol + '//' + l.hostname + 
    l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
    l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
    (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
    l.hash;
window.location.replace(redirectUrl);
```

#### App.jsx Handler:
```javascript
// Handle GitHub Pages SPA redirect
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search)
  const redirectPath = urlParams.get('/')
  
  if (redirectPath) {
    const decodedPath = redirectPath.replace(/~and~/g, '&')
    window.history.replaceState(null, '', decodedPath)
  }
}, [])
```

### Troubleshooting:

#### Still Getting 404s?
1. **Check file locations**: Ensure `404.html` and `.nojekyll` are in the `dist` folder
2. **Clear cache**: Hard refresh the page (Ctrl+F5)
3. **Check GitHub Pages settings**: Ensure source is set to "GitHub Actions"

#### Routes Not Working?
1. **Check basename**: Ensure `BrowserRouter basename="/agri-chain"` is set
2. **Check vite.config.js**: Ensure `base: '/agri-chain/'` is set
3. **Check build output**: Ensure all files are in the correct paths

### File Structure After Deployment:
```
dist/
├── index.html
├── 404.html          ← SPA redirect
├── .nojekyll         ← Disable Jekyll
├── assets/
│   ├── [name]-[hash].js
│   └── [name]-[hash].css
└── ...
```

## 🎉 Result

After implementing this solution:
- ✅ Direct navigation to `/admin` works
- ✅ Direct navigation to `/farmer-dashboard` works  
- ✅ Page refresh works on any route
- ✅ No more 404 errors
- ✅ Seamless user experience

The app now works exactly like a traditional multi-page application, but with all the benefits of a Single Page Application!
