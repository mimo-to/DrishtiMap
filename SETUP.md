# DrishtiMap – Setup Guide

This guide walks you through setting up DrishtiMap for local development. By the end, you'll have both the backend API and frontend application running on your machine.

---

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v18 or higher  
- **npm** v9 or higher  
- **MongoDB** – Either a local instance or a cloud cluster (MongoDB Atlas recommended)  
- **Git**

You'll also need accounts for:

- [Clerk](https://clerk.com) – Authentication  
- [Google AI Studio](https://makersuite.google.com/app/apikey) – Gemini API key  
- [Groq](https://console.groq.com) (optional) – For enhanced research reports  

---

## 1. Clone the Repository

```bash
git clone https://github.com/yourusername/drishtimap.git
cd drishtimap
```

---

## 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file based on the example:

```bash
cp .env.example .env
```

Open `.env` and fill in the values:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/drishtimap

# AI Services
GOOGLE_API_KEY=your_gemini_api_key
ENABLE_AI=true
GEMINI_MODEL=gemini-2.5-flash

GROQ_API_KEY=your_groq_api_key
ENABLE_GROQ=true
GROQ_MODEL=llama-3.3-70b-versatile

# CORS
FRONTEND_URL=http://localhost:5173

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Where to get the keys:**

| Variable               | Source                                                |
|------------------------|-------------------------------------------------------|
| `MONGODB_URI`          | MongoDB Atlas → Database → Connect → Drivers          |
| `GOOGLE_API_KEY`       | Google AI Studio → Get API Key                        |
| `GROQ_API_KEY`         | Groq Console → API Keys                               |
| `CLERK_PUBLISHABLE_KEY`| Clerk Dashboard → Your App → API Keys                 |
| `CLERK_SECRET_KEY`     | Clerk Dashboard → Your App → API Keys                 |

### Seed Default Templates (Optional)

If you want pre-built LFA templates:

```bash
node src/scripts/seed.js
```

### Start the Backend

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory:

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

Fill in the values:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_ENV=development
VITE_AI_ENABLED=true
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

> **Note:** `VITE_CLERK_PUBLISHABLE_KEY` should match `CLERK_PUBLISHABLE_KEY` from the backend.

### Start the Frontend

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 4. Verify the Setup

1. Open [http://localhost:5173](http://localhost:5173) in your browser.  
2. Sign up or sign in using Clerk.  
3. Create a new project from the dashboard.  
4. Fill in the questionnaire and click **Get Suggestion** to test AI integration.  
5. Complete all levels and click **Finalize & Research** to generate a visual report.

If everything works, you're all set!

---

## Common Issues

### "AI Error: userId is not defined"
The authentication middleware may not be correctly passing the user ID. Ensure `CLERK_SECRET_KEY` is correctly set in the backend `.env`.

### "MongoDB connection failed"
Double-check your `MONGODB_URI`. If using Atlas, ensure your IP address is whitelisted in **Network Access**.

### "Gemini API quota exceeded"
The free tier has rate limits. Wait a minute before retrying, or upgrade your plan.

### Frontend shows blank page
Check the browser console for errors. Usually this means `VITE_API_URL` is misconfigured or the backend isn't running.

---

## Production Deployment

### Backend (Render / Railway / Fly.io)

1. Push your code to GitHub.  
2. Create a new Web Service on your platform.  
3. Set the build command to `npm install` and start command to `npm start`.  
4. Add all environment variables from `.env`.  

### Frontend (Vercel)

1. Import the `frontend` folder as a new Vercel project.  
2. Set the root directory to `frontend`.  
3. Add environment variables (`VITE_API_URL`, `VITE_CLERK_PUBLISHABLE_KEY`).  
4. Deploy.

> Update `VITE_API_URL` to point to your deployed backend URL (e.g., `https://your-backend.onrender.com/api/v1`).

