# DrishtiMap

A strategic project planning and AI-powered research platform designed to help organizations and individuals develop comprehensive project strategies with intelligent insights.

## Overview

DrishtiMap guides users through a structured 5-level quest system to define, plan, and strategize projects. It leverages dual-AI architecture (Groq + Gemini) to provide intelligent suggestions and generate comprehensive research reports with visual diagrams.

## Features

### Core Functionality
- **5-Level Quest System**: Structured approach to project planning
  - Level 1: Context - Define the problem and stakeholders
  - Level 2: Vision - Set goals and success metrics
  - Level 3: Strategy - Plan approach and resources
  - Level 4: Execution - Timeline and milestones
  - Level 5: Impact - Measure outcomes and sustainability

- **AI-Powered Assistance**
  - Intelligent suggestions for each question
  - Context-aware recommendations
  - Dual-AI architecture for deep research

- **Research Report Generation**
  - Comprehensive strategic impact reports
  - 8+ Mermaid diagrams for visualization
  - PDF export functionality
  - Anti-hallucination safeguards

- **Project Management**
  - Auto-save functionality
  - Project persistence
  - Timeline visualization
  - Progress tracking

### Technical Features
- User authentication via Clerk
- MongoDB database for data persistence
- RESTful API architecture
- Responsive React frontend
- Performance-optimized bundle (code splitting)

## Tech Stack

### Frontend
- React 18
- Vite
- React Router v6
- Zustand (state management)
- Tailwind CSS
- Clerk (authentication)
- Mermaid.js (diagrams)
- html2pdf.js (PDF generation)

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- Clerk SDK (authentication)
- Google Gemini AI
- Groq AI
- Helmet (security)
- CORS

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)
- Google Cloud account (for Gemini API)
- Groq account (for Groq API)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd drishtimap
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend directory (use `.env.example` as template):
```bash
cp .env.example .env
```

Configure your `.env` file with:
- MongoDB connection string
- Clerk API keys
- Google Gemini API key
- Groq API key

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` file in frontend directory (use `.env.example` as template):
```bash
cp .env.example .env
```

Configure your `.env` file with:
- Backend API URL
- Clerk publishable key

## Running Locally

### Start Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
Production build will be in `frontend/dist/`

### Backend
```bash
cd backend
npm start
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development|production
PORT=5000
MONGODB_URI=your_mongodb_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
GOOGLE_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
ENABLE_AI=true
FRONTEND_URL=your_frontend_url
```

### Frontend (.env)
```
VITE_API_URL=your_backend_api_url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_ENV=development|production
```

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoints and usage.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step deployment instructions for various platforms.

## Project Structure

```
drishtimap/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic & AI services
│   │   └── index.js         # Entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── quest/           # Quest system components
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   └── main.jsx         # Entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## Key Features Explained

### Dual-AI Architecture
- **Phase 1 (Groq)**: Deep research and analysis
- **Phase 2 (Gemini)**: Visual synthesis and report generation
- Anti-hallucination rules for factual accuracy

### Quest System
- Structured 5-level approach
- Context-aware AI suggestions
- Progress tracking and auto-save
- Jump between levels

### Research Reports
- Comprehensive strategic analysis
- Multiple Mermaid diagram types
- Government sources and references
- PDF export with dynamic filenames

## Security

- Environment variables for sensitive data
- Clerk authentication
- Helmet.js security headers
- CORS configuration
- MongoDB connection encryption

## Performance Optimizations

- Code splitting for heavy libraries (Mermaid, html2pdf)
- Dynamic imports for AI libraries
- Manual chunking in Vite
- Optimized bundle size (~1.5MB)

## Known Limitations

- AI features require active API keys
- Research reports limited to last 90 days of data
- Mermaid diagrams have syntax constraints

## Contributing

This is a hackathon project. For contributions, please follow standard Git workflow.

## License

MIT License

## Support

For issues or questions, please open an issue in the repository.

## Acknowledgments

- Built with React and Express
- AI powered by Google Gemini and Groq
- Authentication by Clerk
- Diagrams by Mermaid.js
