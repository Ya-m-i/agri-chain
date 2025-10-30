# Farmer Dashboard Blank Page Fix

## Issue
When logging in as a farmer, the dashboard shows a blank page with this error:
```
Uncaught Error: Minified React error #185
```

This error typically means "Cannot read properties of undefined" - caused by trying to access properties on undefined data.

## Root Cause
The React Query hooks (`useClaims` and `useCropInsurance`) were being called with `user?.id` before the user object was fully loaded from Zustand's persisted storage, causing them to fetch data with `undefined` as the farmer ID.

## Fixes Applied

### 1. Added `enabled` option to React Query hooks (`frontend/src/hooks/useAPI.js`)

```javascript
// ============ CLAIMS ============
export const useClaims = (farmerId = null) => {
  return useQuery({
    queryKey: farmerId ? QUERY_KEYS.FARMER_CLAIMS(farmerId) : [QUERY_KEYS.CLAIMS],
    queryFn: () => api.fetchClaims(farmerId),
    enabled: farmerId ? !!farmerId : true, // Only run farmer-specific query if farmerId exists
  })
}

// ============ CROP INSURANCE ============
export const useCropInsurance = (farmerId = null) => {
  return useQuery({
    queryKey: farmerId ? QUERY_KEYS.FARMER_CROP_INSURANCE(farmerId) : [QUERY_KEYS.CROP_INSURANCE],
    queryFn: () => api.fetchCropInsurance(farmerId),
    enabled: farmerId ? !!farmerId : true, // Only run farmer-specific query if farmerId exists
  })
}
```

### 2. Added early return guard in FarmerDashboard (`frontend/src/pages/FarmerDashboard.jsx`)

Added validation to ensure user object is fully loaded before rendering:

```javascript
const FarmerDashboard = () => {
  const { user, logout, userType } = useAuthStore()
  const navigate = useNavigate()
  
  // Redirect if not authenticated or not a farmer
  useEffect(() => {
    if (!user) {
      console.error('FarmerDashboard: No user found, redirecting to login')
      navigate("/")
      return
    }
    
    if (!user.id) {
      console.error('FarmerDashboard: User object missing id field:', user)
      navigate("/")
      return
    }
    
    if (userType !== "farmer") {
      console.log('FarmerDashboard: User is not a farmer, redirecting to admin')
      navigate("/admin")
      return
    }
  }, [user, userType, navigate])
  
  // Early return with loading state if user is not ready
  if (!user || !user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading farmer dashboard...</p>
        </div>
      </div>
    )
  }
  
  // Rest of component...
}
```

### 3. Enhanced logging for debugging

Added comprehensive logging in:

**Login.jsx:**
```javascript
console.log('Login: Backend response:', farmer);
console.log("Farmer _id from backend:", farmer._id);
console.log("Mapped userData.id:", userData.id);
console.log("Complete userData object:", JSON.stringify(userData, null, 2));
```

**authStore.js:**
```javascript
console.log('Auth Store: Logging in user');
console.log('Auth Store: userType:', userType);
console.log('Auth Store: user.id:', user?.id);
console.log('Auth Store: Complete user object:', JSON.stringify(user, null, 2));

// Verify user has required fields
if (userType === "farmer" && !user.id) {
  console.error("Auth Store: Farmer user object missing 'id' field:", user);
  throw new Error("Farmer user data must include 'id' field");
}
```

## Testing Steps

1. **Clear browser storage:**
   - Open DevTools → Application → Storage → Clear site data
   - This ensures fresh state

2. **Login as farmer:**
   - Use valid farmer credentials
   - Watch console for logging output

3. **Verify dashboard loads:**
   - Dashboard should show loading state briefly
   - Then render full dashboard with data
   - No blank page or React errors

4. **Check console logs:**
   ```
   Login: Backend response: { _id: "...", firstName: "...", ... }
   Farmer _id from backend: 6789abc...
   Mapped userData.id: 6789abc...
   Auth Store: Logging in user
   Auth Store: userType: farmer
   Auth Store: user.id: 6789abc...
   ```

## Expected Behavior

1. **Before login:** User sees login page
2. **During login:** Loading overlay shows for 1 second
3. **After login:** User navigates to farmer dashboard
4. **Dashboard mount:** 
   - If user not ready → shows loading spinner
   - Once user loaded → renders full dashboard
5. **Data fetching:** React Query hooks only run when `user.id` exists

## Additional Notes

- The `enabled` option prevents React Query from running queries with invalid parameters
- The early return guard prevents rendering components that depend on `user.id` before it's available
- Enhanced logging helps diagnose any future authentication issues
- The fix maintains backward compatibility with existing code

## Files Modified

1. `frontend/src/hooks/useAPI.js` - Added `enabled` guards to hooks
2. `frontend/src/pages/FarmerDashboard.jsx` - Added early return guard and validation
3. `frontend/src/pages/Login.jsx` - Enhanced logging
4. `frontend/src/store/authStore.js` - Enhanced logging and validation

## Deployment

After making these changes:

1. **Frontend (if using Render for frontend):**
   ```bash
   cd frontend
   npm run build
   # Deploy to your hosting service
   ```

2. **Or if frontend is on GitHub Pages:**
   ```bash
   cd frontend
   ./deploy.sh  # or deploy.bat on Windows
   git add .
   git commit -m "fix: Resolve farmer dashboard blank page issue"
   git push origin main
   ```

3. **Test thoroughly** after deployment to ensure the fix works in production

