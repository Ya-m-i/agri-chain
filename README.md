# 🌾 AGRI-CHAIN - Agricultural Management System

A comprehensive blockchain-inspired agricultural management system for farmers, insurance companies, and government assistance programs.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Development Setup](#-development-setup)
- [Environment Configuration](#-environment-configuration)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🚜 For Farmers
- **Farmer Registration & Management** - Complete profile management system
- **Crop Insurance Management** - Apply for and manage crop insurance policies
- **Claims Processing** - Submit and track insurance claims
- **Assistance Programs** - Apply for government assistance and subsidies
- **Real-time Dashboard** - Monitor farm statistics and application status
- **Weather Integration** - Real-time weather updates and forecasts

### 👨‍💼 For Administrators
- **Comprehensive Dashboard** - Overview of all system activities
- **Application Management** - Process farmer applications and claims
- **Inventory Management** - Track assistance program inventory
- **Analytics & Reporting** - Detailed insights and data visualization
- **User Role Management** - Manage access control and permissions

### 🔧 Technical Features
- **Progressive Web App (PWA)** - Offline functionality and mobile-first design
- **Real-time Communication** - WebSocket integration for live updates
- **Advanced State Management** - Zustand for efficient state handling
- **React Query Integration** - Optimized data fetching and caching
- **Responsive Design** - Tailwind CSS for modern UI/UX
- **Chart Visualizations** - Interactive charts and analytics

## 🚀 Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and state management
- **Zustand** - Lightweight state management
- **Socket.IO Client** - Real-time communication
- **Chart.js & Recharts** - Data visualization
- **React Router Dom** - Client-side routing

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database service
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **MongoDB Atlas Account** - [Sign up here](https://www.mongodb.com/atlas)
- **Git** - Version control system

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/agri-chain.git
   cd agri-chain
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## 🛠️ Development Setup

### Local Development

1. **Start the backend server**
   ```bash
   npm run server
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🚀 Deployment

### Backend Deployment (Render)

1. **Push your code to GitHub** (if not already done)

2. **Go to [Render](https://render.com)**
   - Sign up using your GitHub account
   - Click "New" → "Web Service"
   - Connect your GitHub repository

3. **Configure your service:**
   - Name: `agri-chain-backend`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables in Render:**
   - `NODE_ENV=production`
   - `MONGO_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_jwt_secret_key`
   - `FRONTEND_URL=https://ya-m-i.github.io`

5. **Deploy and get your backend URL** (e.g., `https://agri-chain-backend.onrender.com`)

## ⚙️ Environment Configuration

### Backend Environment Variables (.env)

```env
NODE_ENV=development
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# Socket.IO Configuration
SOCKET_CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend Environment Variables (frontend/.env)

```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=AGRI-CHAIN
VITE_APP_VERSION=1.0.0
```

### Production Environment Variables

For production deployment, ensure these additional variables are set:

```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
```

## 🚀 Deployment

### Frontend Deployment (GitHub Pages)

1. **Update frontend environment variables** with your Render backend URL
2. **Build and deploy** to GitHub Pages

### Complete Production Setup

- **Frontend**: GitHub Pages (`https://ya-m-i.github.io`)
- **Backend**: Render Web Service (`https://your-backend.onrender.com`)
- **Database**: MongoDB Atlas

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile

### Farmer Management
- `GET /api/farmers` - Get all farmers
- `POST /api/farmers` - Create new farmer
- `GET /api/farmers/:id` - Get farmer by ID
- `PUT /api/farmers/:id` - Update farmer
- `DELETE /api/farmers/:id` - Delete farmer

### Crop Insurance
- `GET /api/crop-insurance` - Get all crop insurance policies
- `POST /api/crop-insurance` - Create new policy
- `GET /api/crop-insurance/farmer/:farmerId` - Get farmer's policies
- `PUT /api/crop-insurance/:id` - Update policy
- `DELETE /api/crop-insurance/:id` - Delete policy

### Claims Management
- `GET /api/claims` - Get all claims
- `POST /api/claims` - Submit new claim
- `GET /api/claims/:id` - Get claim by ID
- `PATCH /api/claims/:id` - Update claim status

### Assistance Programs
- `GET /api/assistance` - Get all assistance programs
- `POST /api/assistance` - Create new program
- `POST /api/assistance/apply` - Apply for assistance
- `GET /api/assistance/applications/:farmerId` - Get farmer applications

## 🧪 Testing

### Run Backend Tests
```bash
npm run test
```

### Run Frontend Tests
```bash
cd frontend
npm run test
```

### End-to-End Testing
```bash
npm run test:e2e
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📋 Project Structure

```
agri-chain/
├── backend/                 # Backend Node.js application
│   ├── config/             # Database and app configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
├── frontend/               # Frontend React application
│   ├── public/             # Public assets
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # State management
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main App component
│   ├── package.json
│   └── vite.config.js      # Vite configuration
├── .github/                # GitHub workflows
├── docker-compose.yml      # Docker configuration
├── .gitignore
├── package.json
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

1. **Connection to MongoDB fails**
   - Verify your `MONGO_URI` in `.env`
   - Ensure your IP is whitelisted in MongoDB Atlas
   - Check your network connection

2. **Frontend can't connect to backend**
   - Verify `VITE_API_URL` points to your Render backend URL
   - Ensure backend service is running on Render
   - Check for CORS issues in Render logs

### Getting Help

If you encounter issues:
1. Check the [Issues](https://github.com/yourusername/agri-chain/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ashton Mark**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- MongoDB Atlas for database hosting
- Vercel/Netlify for frontend hosting solutions
- The open-source community for amazing tools and libraries

---

**Made with ❤️ for the agricultural community**