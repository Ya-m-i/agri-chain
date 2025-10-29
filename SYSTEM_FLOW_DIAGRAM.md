# 🌾 AGRI-CHAIN System Flow Diagrams

## 1. Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGRI-CHAIN ECOSYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        CLIENT LAYER (Browser)                          │  │
│  ├───────────────────────────────────────────────────────────────────────┤  │
│  │                                                                         │  │
│  │  ┌──────────────────┐              ┌──────────────────┐              │  │
│  │  │  Farmer Client   │              │   Admin Client   │              │  │
│  │  │                  │              │                  │              │  │
│  │  │  • Dashboard     │              │  • Dashboard     │              │  │
│  │  │  • Claims        │              │  • Claims Mgmt   │              │  │
│  │  │  • Insurance     │              │  • Farmer Mgmt   │              │  │
│  │  │  • Assistance    │              │  • Assistance    │              │  │
│  │  │  • Profile       │              │  • Analytics     │              │  │
│  │  └────────┬─────────┘              └────────┬─────────┘              │  │
│  │           │                                  │                         │  │
│  └───────────┼──────────────────────────────────┼─────────────────────────┘  │
│              │                                  │                             │
│              │         HTTPS/WebSocket          │                             │
│              └──────────────────┬───────────────┘                             │
│                                 │                                             │
│  ┌──────────────────────────────▼─────────────────────────────────────────┐  │
│  │                    FRONTEND (React SPA)                                 │  │
│  │                  Hosted on: Render Static Site                          │  │
│  │              URL: https://agri-chain-frontend.onrender.com              │  │
│  ├─────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │  Components:                                                             │  │
│  │  • React 19 + Vite                                                       │  │
│  │  • Zustand (State Management)                                            │  │
│  │  • React Query (Data Fetching)                                           │  │
│  │  • Socket.IO Client (Real-time)                                          │  │
│  │  • Tailwind CSS (Styling)                                                │  │
│  │  • Service Worker (PWA)                                                  │  │
│  │                                                                          │  │
│  │  Features:                                                               │  │
│  │  ✓ Lazy Loading & Code Splitting                                        │  │
│  │  ✓ Offline Support                                                      │  │
│  │  ✓ Real-time Updates                                                    │  │
│  │  ✓ Responsive Design                                                    │  │
│  │                                                                          │  │
│  └──────────────────────────────┬───────────────────────────────────────────┘  │
│                                 │                                             │
│                    REST API + WebSocket                                       │
│                                 │                                             │
│  ┌──────────────────────────────▼─────────────────────────────────────────┐  │
│  │                  BACKEND (Node.js/Express)                              │  │
│  │                   Hosted on: Render Web Service                         │  │
│  │                URL: https://agri-chain.onrender.com                     │  │
│  ├─────────────────────────────────────────────────────────────────────────┤  │
│  │                                                                          │  │
│  │  API Endpoints:                    Middleware:                           │  │
│  │  • /api/farmers                    • CORS                                │  │
│  │  • /api/users                      • Auth (JWT)                          │  │
│  │  • /api/claims                     • Error Handler                       │  │
│  │  • /api/assistance                 • Rate Limiting                       │  │
│  │  • /api/crop-insurance                                                   │  │
│  │  • /api/crop-prices                Real-time:                            │  │
│  │  • /api/blockchain-claims          • Socket.IO Server                    │  │
│  │  • /api/distribution-records       • Room-based Broadcasting            │  │
│  │                                    • Event Emitting                      │  │
│  │                                                                          │  │
│  └──────────────┬───────────────────────────────────┬──────────────────────┘  │
│                 │                                   │                         │
│                 │                                   │                         │
│     ┌───────────▼───────────┐         ┌────────────▼──────────────┐          │
│     │  MongoDB Atlas        │         │ Hyperledger Fabric        │          │
│     │  (Cloud Database)     │         │ (Blockchain Service)      │          │
│     └───────────────────────┘         └───────────────────────────┘          │
│                                                                               │
│     Connection:                        Connection:                            │
│     mongodb+srv://...                  https://api.kapalongagrichain.site    │
│     • 5-10 connections pool            • Cloudflare Tunnel                   │
│     • Auto-retry logic                 • Immutable logs                      │
│     • Indexed queries                  • Claim tracking                      │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. User Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

User Opens App
      │
      ▼
┌─────────────────┐
│ Check Zustand   │
│ Persist Store   │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
    ▼          ▼
Authenticated  Not Authenticated
    │               │
    │               ▼
    │          ┌──────────────┐
    │          │  Login Page  │
    │          └──────┬───────┘
    │                 │
    │                 │ Enter Credentials
    │                 │
    │                 ▼
    │          ┌─────────────────────────┐
    │          │  POST /api/farmers/login│
    │          │  or                     │
    │          │  POST /api/users/login  │
    │          └──────────┬──────────────┘
    │                     │
    │                     ▼
    │          ┌─────────────────────────┐
    │          │  Backend Validates      │
    │          │  - Check credentials    │
    │          │  - Hash password match  │
    │          └──────────┬──────────────┘
    │                     │
    │              ┌──────┴──────┐
    │              │             │
    │          Invalid       Valid
    │              │             │
    │              ▼             ▼
    │         Error Msg    ┌────────────────┐
    │         Return       │ Generate JWT   │
    │                      │ Update DB      │
    │                      │ Return Token   │
    │                      └────────┬───────┘
    │                               │
    ▼                               ▼
┌──────────────────────────────────────────┐
│  Store in Zustand + LocalStorage         │
│  - isAuthenticated = true                │
│  - userType = "admin" | "farmer"         │
│  - user = { id, name, ... }              │
└──────────────────┬───────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │ Connect Socket.IO   │
         │ Join Room:          │
         │ - admin-room        │
         │ - farmer-{farmerId} │
         └──────────┬──────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Navigate to        │
         │  Dashboard          │
         └─────────────────────┘
```

---

## 3. Claim Submission & Processing Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CLAIM SUBMISSION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

Farmer Fills Claim Form
      │
      ├─ Name, Address, Phone
      ├─ Crop Type, Area Insured
      ├─ Planting Date, Variety
      ├─ Damage Type, Degree
      ├─ Damage Photos (Base64)
      ├─ Lot Boundaries (N,S,E,W)
      └─ Program Selection
      │
      ▼
Frontend Validation
      │
      ├─ Required fields
      ├─ Data format
      └─ Image size limits
      │
      ▼
POST /api/claims
      │
      ▼
┌──────────────────────────────────────┐
│  Backend Processing                  │
├──────────────────────────────────────┤
│  1. Validate Request                 │
│     - Check farmerId exists          │
│     - Validate required fields       │
│     - Check data types               │
│                                      │
│  2. Generate Claim Number            │
│     Format: CLM-YYYY-XXXXXX-XXX     │
│     - Retry if duplicate             │
│     - Max 10 attempts                │
│                                      │
│  3. Save to MongoDB                  │
│     - Create claim document          │
│     - Status: "pending"              │
│     - Store all details              │
│                                      │
│  4. Log to Blockchain                │
│     POST to Fabric Service           │
│     - claimId                        │
│     - farmerName                     │
│     - cropType                       │
│     - timestamp                      │
│     - status                         │
│                                      │
│  5. Emit Socket Events               │
│     io.to('admin-room')              │
│       .emit('claim-created', claim)  │
│     io.to(`farmer-${farmerId}`)      │
│       .emit('claim-created', claim)  │
│                                      │
│  6. Return Response                  │
│     - success: true                  │
│     - claimNumber                    │
│     - _id                            │
│     - Full claim object              │
└──────────────┬───────────────────────┘
               │
               ▼
        ┌──────────────────┐
        │  Frontend Update  │
        ├──────────────────┤
        │  • Show success   │
        │  • Display claim# │
        │  • Update list    │
        │  • Navigate away  │
        └──────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  Real-time Updates via Socket.IO       │
├────────────────────────────────────────┤
│                                        │
│  Admin Dashboard:                      │
│  ✓ Receives 'claim-created' event     │
│  ✓ Shows notification                 │
│  ✓ Updates claim list                 │
│  ✓ Plays notification sound (opt)     │
│                                        │
│  Farmer Dashboard (creator):           │
│  ✓ Receives 'claim-created' event     │
│  ✓ Shows confirmation                 │
│  ✓ Updates claim list                 │
│                                        │
└────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────┐
│  ADMIN REVIEWS CLAIM                   │
├────────────────────────────────────────┤
│  1. View claim details                 │
│  2. Review damage photos               │
│  3. Check farmer information           │
│  4. Assess damage degree               │
│  5. Calculate compensation             │
│     (automatic or manual)              │
│  6. Provide feedback                   │
│  7. Update status:                     │
│     - Approve                          │
│     - Reject                           │
│     - Request more info                │
└────────────────┬───────────────────────┘
                 │
                 ▼
        PATCH /api/claims/:id
                 │
                 ▼
┌────────────────────────────────────────┐
│  Backend Update Processing             │
├────────────────────────────────────────┤
│  1. Update claim status                │
│  2. Set adminFeedback                  │
│  3. Calculate compensation             │
│     - If approved                      │
│     - Based on area & damage           │
│  4. Set completion date                │
│  5. Save to MongoDB                    │
│  6. Log update to blockchain           │
│  7. Emit socket events                 │
│     - claim-updated                    │
│  8. Return updated claim               │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│  Real-time Status Update               │
├────────────────────────────────────────┤
│                                        │
│  Farmer Dashboard:                     │
│  ✓ Receives 'claim-updated' event     │
│  ✓ Shows notification                 │
│  ✓ Updates claim status                │
│  ✓ Displays feedback                   │
│  ✓ Shows compensation (if approved)    │
│                                        │
│  Admin Dashboard:                      │
│  ✓ Receives 'claim-updated' event     │
│  ✓ Updates claim list                 │
│  ✓ Updates statistics                 │
│                                        │
└────────────────────────────────────────┘
```

---

## 4. Real-time Communication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SOCKET.IO REAL-TIME FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐                          ┌──────────────────────┐
│   Farmer Client      │                          │   Admin Client       │
│   (User A)           │                          │   (Multiple Users)   │
└──────────┬───────────┘                          └──────────┬───────────┘
           │                                                 │
           │ Connect to Server                              │ Connect to Server
           │                                                 │
           ▼                                                 ▼
    ┌────────────────────────────────────────────────────────────────┐
    │              Socket.IO Server (Backend)                        │
    │                                                                │
    │  socket.on('connection', (socket) => {                         │
    │    console.log('Client connected:', socket.id)                 │
    │  })                                                            │
    └────────────────────────────────────────────────────────────────┘
           │                                                 │
           │ Join Room: farmer-{farmerId}                   │ Join Room: admin-room
           │                                                 │
           ▼                                                 ▼
    ┌─────────────────┐                            ┌─────────────────┐
    │  Room:          │                            │  Room:          │
    │  farmer-123     │                            │  admin-room     │
    │                 │                            │                 │
    │  Sockets:       │                            │  Sockets:       │
    │  • socket_abc   │                            │  • socket_xyz   │
    └─────────────────┘                            │  • socket_def   │
                                                   │  • socket_ghi   │
                                                   └─────────────────┘

    ──────────────────────────────────────────────────────────────────
                        CLAIM CREATED EVENT
    ──────────────────────────────────────────────────────────────────

    Farmer submits claim
           │
           ▼
    Backend creates claim
           │
           ├──────────────────────────┐
           │                          │
           ▼                          ▼
    io.to('admin-room')        io.to('farmer-123')
      .emit('claim-created')     .emit('claim-created')
           │                          │
           ▼                          ▼
    ┌─────────────────┐        ┌─────────────────┐
    │  All Admins     │        │  Farmer User    │
    │  Receive Event  │        │  Receives Event │
    │                 │        │                 │
    │  • Update UI    │        │  • Update UI    │
    │  • Show notif   │        │  • Show confirm │
    │  • Play sound   │        └─────────────────┘
    └─────────────────┘

    ──────────────────────────────────────────────────────────────────
                        CLAIM UPDATED EVENT
    ──────────────────────────────────────────────────────────────────

    Admin updates claim
           │
           ▼
    Backend updates claim
           │
           ├──────────────────────────┐
           │                          │
           ▼                          ▼
    io.to('admin-room')        io.to('farmer-123')
      .emit('claim-updated')     .emit('claim-updated')
           │                          │
           ▼                          ▼
    ┌─────────────────┐        ┌─────────────────┐
    │  All Admins     │        │  Farmer User    │
    │  Receive Event  │        │  Receives Event │
    │                 │        │                 │
    │  • Update list  │        │  • Update UI    │
    │  • Update stats │        │  • Show notif   │
    └─────────────────┘        │  • See feedback │
                               │  • See status   │
                               └─────────────────┘

    ──────────────────────────────────────────────────────────────────
                           DISCONNECT EVENT
    ──────────────────────────────────────────────────────────────────

    User logs out or closes browser
           │
           ▼
    authStore.logout()
           │
           ├─ Leave room (farmer-123 or admin-room)
           ├─ Disconnect socket
           └─ Clear auth state
           │
           ▼
    socket.on('disconnect', (reason) => {
      console.log('Client disconnected:', socket.id)
    })
```

---

## 5. Data Persistence Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DATA PERSISTENCE LAYERS                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  Frontend Layer      │
├──────────────────────┤
│                      │
│  1. Component State  │────▶ React useState, useReducer
│     (Ephemeral)      │      • Form data
│                      │      • UI state
│                      │      • Temporary values
│                      │
│  2. Zustand Store    │────▶ Global State Management
│     (Persistent)     │      • Auth state
│                      │      • User data
│                      │      • Persisted to LocalStorage
│                      │
│  3. React Query      │────▶ Server State Cache
│     (Cached)         │      • API responses
│                      │      • Stale/fresh management
│                      │      • Background refetch
│                      │
│  4. Service Worker   │────▶ Offline Cache
│     (Cached)         │      • Static assets
│                      │      • API responses
│                      │      • PWA storage
│                      │
└──────────┬───────────┘
           │
           │ HTTP/WebSocket
           │
┌──────────▼───────────┐
│  Backend Layer       │
├──────────────────────┤
│                      │
│  1. Express Memory   │────▶ Request-scoped
│     (Ephemeral)      │      • req, res objects
│                      │      • Middleware data
│                      │      • Session data
│                      │
│  2. Socket.IO Rooms  │────▶ Connection State
│     (Session)        │      • Connected clients
│                      │      • Room membership
│                      │      • Socket.id mapping
│                      │
└──────────┬───────────┘
           │
           │ MongoDB Protocol
           │
┌──────────▼───────────┐
│  Database Layer      │
├──────────────────────┤
│                      │
│  MongoDB Atlas       │────▶ Permanent Storage
│  (Persistent)        │      
│                      │      Collections:
│  • Farmers           │      ├─ farmers (profiles)
│  • Claims            │      ├─ claims (insurance)
│  • Assistance        │      ├─ assistances (programs)
│  • Applications      │      ├─ applications (requests)
│  • Crop Insurance    │      ├─ cropinsurances (policies)
│  • Crop Prices       │      └─ cropprices (market data)
│  • Users             │      
│                      │      Features:
│                      │      ├─ ACID transactions
│                      │      ├─ Indexes for performance
│                      │      ├─ Automatic backups
│                      │      └─ Replica sets
│                      │
└──────────┬───────────┘
           │
           │ HTTPS
           │
┌──────────▼───────────┐
│  Blockchain Layer    │
├──────────────────────┤
│                      │
│  Hyperledger Fabric  │────▶ Immutable Ledger
│  (Immutable)         │      
│                      │      • Claim logs
│                      │      • Distribution records
│                      │      • Audit trail
│                      │      • Cannot be modified
│                      │      • Distributed consensus
│                      │      
│  Hosted at:          │
│  api.kapalongagri... │
│  (Cloudflare Tunnel) │
│                      │
└──────────────────────┘

Data Lifecycle Example (Claim):

1. Farmer inputs data ──▶ Component State (React)
2. Form submitted ──────▶ API call via React Query
3. Backend receives ────▶ Express processes
4. Saves to MongoDB ────▶ Permanent storage
5. Logs to Fabric ──────▶ Immutable record
6. Emits Socket event ──▶ Real-time update
7. React Query cache ───▶ Frontend cache updates
8. UI re-renders ───────▶ User sees result
```

---

## 6. Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY LAYERS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Network Layer (HTTPS/TLS)                                       │
├──────────────────────────────────────────────────────────────────┤
│  ✓ TLS 1.2+ encryption                                           │
│  ✓ Automatic SSL certificates (Render)                          │
│  ✓ Secure WebSocket (WSS)                                        │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│  CORS Layer (Cross-Origin Protection)                            │
├──────────────────────────────────────────────────────────────────┤
│  ✓ Whitelist allowed origins                                     │
│  ✓ Credentials support                                           │
│  ✓ Preflight request handling                                    │
│  ✓ No wildcard (*) in production                                 │
│                                                                   │
│  Allowed Origins:                                                │
│  • https://agri-chain-frontend.onrender.com                      │
│  • https://ya-m-i.github.io                                      │
│  • Development: localhost:5173                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│  Authentication Layer (JWT)                                      │
├──────────────────────────────────────────────────────────────────┤
│  Login Flow:                                                      │
│  1. User sends credentials                                       │
│  2. Backend validates:                                           │
│     ├─ Check username exists                                     │
│     ├─ Compare hashed password (bcryptjs)                        │
│     └─ Verify account status                                     │
│  3. Generate JWT token                                           │
│     ├─ Payload: { id, username, userType }                       │
│     ├─ Sign with JWT_SECRET                                      │
│     └─ Expiration: 30d (configurable)                            │
│  4. Return token to client                                       │
│  5. Client stores in:                                            │
│     ├─ Zustand store (memory)                                    │
│     └─ LocalStorage (persistence)                                │
│                                                                   │
│  Protected Requests:                                             │
│  1. Client includes token in:                                    │
│     ├─ Authorization header                                      │
│     └─ Or query parameter                                        │
│  2. Backend middleware validates:                                │
│     ├─ Token exists                                              │
│     ├─ Token valid (signature)                                   │
│     ├─ Token not expired                                         │
│     └─ User still exists                                         │
│  3. Request proceeds if valid                                    │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│  Authorization Layer (Role-based)                                │
├──────────────────────────────────────────────────────────────────┤
│  User Types:                                                      │
│  • Admin   ──▶ Full access                                       │
│  • Farmer  ──▶ Own data only                                     │
│                                                                   │
│  Route Protection (Frontend):                                    │
│  <AuthRoute userType="admin">                                    │
│    <AdminDashboard />                                            │
│  </AuthRoute>                                                    │
│                                                                   │
│  API Protection (Backend):                                       │
│  if (userType !== 'admin') {                                     │
│    return res.status(403).json({ error: 'Forbidden' })          │
│  }                                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│  Data Layer Security                                             │
├──────────────────────────────────────────────────────────────────┤
│  Password Storage:                                               │
│  • Never store plain text                                        │
│  • Bcryptjs hashing (salt rounds: 10)                            │
│  • Hash on registration                                          │
│  • Compare hash on login                                         │
│                                                                   │
│  Database Security:                                              │
│  • MongoDB authentication required                               │
│  • TLS/SSL connection encryption                                 │
│  • IP whitelist (0.0.0.0/0 for Render)                          │
│  • Limited user permissions                                      │
│                                                                   │
│  Input Validation:                                               │
│  • Type checking                                                 │
│  • Required field validation                                     │
│  • Data sanitization                                             │
│  • XSS prevention                                                │
│                                                                   │
│  Error Handling:                                                 │
│  • No sensitive data in errors                                   │
│  • Generic error messages to users                               │
│  • Detailed logging server-side only                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 7. Deployment Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       DEPLOYMENT FLOW (Render)                               │
└─────────────────────────────────────────────────────────────────────────────┘

Developer's Machine
      │
      ├─ Edit code
      ├─ Test locally
      └─ Commit changes
      │
      ▼
git add .
git commit -m "message"
git push origin main
      │
      ▼
┌──────────────────────────────────────┐
│  GitHub Repository                    │
│  (ya-m-i/AGRI-CHAIN)                 │
└──────────────┬───────────────────────┘
               │
               │ Webhook trigger
               │
               ├────────────────────────────┐
               │                            │
               ▼                            ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│  Render - Frontend       │  │  Render - Backend        │
│  (Static Site)           │  │  (Web Service)           │
├──────────────────────────┤  ├──────────────────────────┤
│                          │  │                          │
│  1. Detect push          │  │  1. Detect push          │
│  2. Pull latest code     │  │  2. Pull latest code     │
│  3. Build frontend:      │  │  3. Install deps:        │
│     cd frontend          │  │     cd backend           │
│     npm install          │  │     npm install          │
│     npm run build        │  │  4. Start server:        │
│  4. Output: dist/        │  │     npm start            │
│  5. Deploy to CDN        │  │  5. Health check:        │
│  6. Update DNS           │  │     GET /api/health      │
│                          │  │  6. Go live if OK        │
│  Result:                 │  │                          │
│  ✓ New version live      │  │  Result:                 │
│  ✓ Old version replaced  │  │  ✓ New version live      │
│  ✓ Cache invalidated     │  │  ✓ Rolling deployment    │
│                          │  │  ✓ Zero downtime         │
└──────────────────────────┘  └──────────────────────────┘
               │                            │
               │                            │
               └────────────┬───────────────┘
                            │
                            ▼
                 ┌─────────────────────┐
                 │  Production Ready   │
                 │                     │
                 │  Frontend:          │
                 │  agri-chain-        │
                 │  frontend.render... │
                 │                     │
                 │  Backend:           │
                 │  agri-chain.        │
                 │  onrender.com       │
                 └─────────────────────┘

Timeline:
• Code push: Instant
• Render detection: ~10 seconds
• Build process: 2-5 minutes
• Deployment: 30 seconds
• Total: 3-6 minutes
```

---

**Last Updated**: October 29, 2025
**System Version**: 1.0.0
**Status**: ✅ Production Ready

