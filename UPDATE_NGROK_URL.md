# Steps to Update Ngrok URL

## 1. After starting ngrok, update frontend/.env.production:

Replace the URLs in `frontend/.env.production` with your new ngrok URL:

```
VITE_API_URL=https://YOUR_NEW_NGROK_URL.ngrok-free.app
VITE_SOCKET_URL=https://YOUR_NEW_NGROK_URL.ngrok-free.app
VITE_APP_NAME=AGRI-CHAIN
VITE_APP_VERSION=1.0.0
```

## 2. Build and Deploy:

```bash
cd frontend
npm run deploy
```

## 3. Wait 2-3 minutes for GitHub Pages to update

## 4. Test:
- Visit your GitHub Pages URL - should show login page (not 404)
- Login as admin and check if data loads from MongoDB Atlas