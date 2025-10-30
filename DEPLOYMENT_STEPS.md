# Deployment Steps for Farmer Dashboard Fix

## Prerequisites
- Git installed
- Node.js installed
- Access to your Render account (for backend and frontend)
- Terminal/Command Prompt access

## Option 1: Deploy to Render (Both Frontend & Backend)

### Backend Deployment (If backend changes were made)

1. **Commit your changes:**
   ```bash
   git add backend/
   git commit -m "fix: Add improved error handling and logging"
   git push origin main
   ```

2. **Render Auto-Deploy:**
   - If you have auto-deploy enabled on Render, it will automatically deploy
   - Watch the logs in Render dashboard: https://dashboard.render.com
   - Wait for "Build successful" and "Live" status

3. **Verify backend:**
   ```bash
   curl https://agri-chain.onrender.com/api/health
   ```
   Should return: `{"status":"OK","message":"AGRI-CHAIN API is running",...}`

### Frontend Deployment to Render

1. **Build frontend locally (test):**
   ```bash
   cd frontend
   npm run build
   ```

2. **Commit frontend changes:**
   ```bash
   git add frontend/
   git commit -m "fix: Resolve farmer dashboard blank page issue"
   git push origin main
   ```

3. **Render Auto-Deploy:**
   - Render will automatically build and deploy your frontend
   - Monitor deployment in Render dashboard
   - Note the frontend URL (e.g., `https://agri-chain-frontend.onrender.com`)

4. **Update environment variables (if needed):**
   - Go to Render Dashboard → Your Frontend Service → Environment
   - Ensure `VITE_API_URL` points to your backend URL
   - Ensure `VITE_SOCKET_URL` points to your backend URL

## Option 2: Deploy Frontend to GitHub Pages

### If your frontend is deployed to GitHub Pages:

1. **Update environment variables:**
   ```bash
   cd frontend
   # Edit .env.production or create it
   echo "VITE_API_URL=https://agri-chain.onrender.com" > .env.production
   echo "VITE_SOCKET_URL=https://agri-chain.onrender.com" >> .env.production
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Deploy (Windows):**
   ```batch
   deploy.bat
   ```

   **Or Deploy (Mac/Linux):**
   ```bash
   ./deploy.sh
   ```

4. **Commit and push:**
   ```bash
   git add .
   git commit -m "fix: Resolve farmer dashboard blank page issue"
   git push origin main
   ```

5. **GitHub Actions will auto-deploy:**
   - Go to your GitHub repository
   - Click "Actions" tab
   - Watch the deployment workflow
   - Once complete, visit: https://ya-m-i.github.io/agri-chain/

## Testing After Deployment

### 1. Clear Browser Cache
- Open your deployed app
- Open DevTools (F12)
- Right-click the refresh button → "Empty Cache and Hard Reload"

### 2. Test Farmer Login
```
1. Navigate to your deployed URL
2. Click "Switch to Farmer Login" (if on admin)
3. Enter valid farmer credentials
4. Click "Login"
```

### 3. Expected Behavior
```
✅ Loading overlay appears for 1 second
✅ Redirected to farmer dashboard
✅ Brief loading spinner (if user not fully loaded)
✅ Dashboard renders with all sections
✅ No blank page
✅ No React error #185
```

### 4. Check Console Logs
Open DevTools → Console tab, you should see:
```
Login: Backend response: { _id: "...", ... }
Farmer _id from backend: 6789abc...
Mapped userData.id: 6789abc...
Auth Store: Logging in user
Auth Store: userType: farmer
Auth Store: user.id: 6789abc...
FarmerDashboard: Loading farmer dashboard...
```

### 5. Verify API Connectivity
```bash
# Test backend health
curl https://agri-chain.onrender.com/api/health

# Test CORS
curl -H "Origin: https://your-frontend-url.com" \
     https://agri-chain.onrender.com/api/cors-test
```

## Troubleshooting

### Issue: Blank page still appears

**Solution:**
1. Clear all browser data (Application → Clear site data)
2. Check console for errors
3. Verify `user.id` is logged in console
4. Check Network tab for failed API requests

### Issue: CORS errors

**Solution:**
1. Check backend CORS configuration in `backend/server.js`
2. Ensure frontend URL is in allowed origins
3. Restart backend after CORS changes

### Issue: "Cannot connect to server"

**Solution:**
1. Verify backend is running: https://agri-chain.onrender.com/api/health
2. Check Render logs for backend errors
3. Verify environment variables in Render dashboard

### Issue: Login works but data doesn't load

**Solution:**
1. Check if MongoDB is accessible
2. Verify `MONGO_URI` environment variable in Render
3. Check backend logs for database connection errors

## Rollback Plan (If Issues Occur)

### Quick Rollback:
```bash
# Revert to previous commit
git log --oneline  # Find previous commit hash
git revert <commit-hash>
git push origin main
```

### Full Rollback:
```bash
# Reset to previous working state
git reset --hard <previous-commit-hash>
git push origin main --force  # Use with caution!
```

## Environment URLs

Update these with your actual URLs:

- **Backend API:** `https://agri-chain.onrender.com`
- **Frontend (Render):** `https://agri-chain-frontend.onrender.com`
- **Frontend (GitHub Pages):** `https://ya-m-i.github.io/agri-chain/`
- **Blockchain API:** `https://api.kapalongagrichain.site`

## Post-Deployment Checklist

- [ ] Backend health check passes
- [ ] Frontend loads without errors
- [ ] Admin login works
- [ ] Farmer login works
- [ ] Farmer dashboard displays data
- [ ] Claims can be submitted
- [ ] Assistance applications work
- [ ] Crop insurance displays
- [ ] Socket.IO connects successfully
- [ ] Real-time updates work
- [ ] No console errors
- [ ] Mobile responsive works

## Support

If issues persist:
1. Check all console logs
2. Review Render deployment logs
3. Verify all environment variables
4. Test with different browsers
5. Clear all browser caches and localStorage

## Success Criteria

✅ Farmer can login without errors
✅ Dashboard loads and displays all sections
✅ Data fetching works correctly
✅ No blank pages
✅ No React minified errors
✅ Console logs show proper user data flow

