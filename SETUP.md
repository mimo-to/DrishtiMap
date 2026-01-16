# DrishtiMap - Quick Setup Guide for Collaborators

## Prerequisites

Before you start, make sure you have:
- Node.js 18+ installed ([Download here](https://nodejs.org/))
- Git installed
- A code editor (VS Code recommended)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd drishtimap
```

## Step 2: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Step 3: Set Up Environment Variables

### Backend Setup

1. Copy the example file:
```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` and fill in these values:

```env
# Get these from the team lead or project owner
MONGODB_URI=<ask_team_lead>
CLERK_SECRET_KEY=<ask_team_lead>
GOOGLE_API_KEY=<ask_team_lead>
GROQ_API_KEY=<ask_team_lead>

# These can stay as-is for development
NODE_ENV=development
PORT=5000
ENABLE_AI=true
FRONTEND_URL=http://localhost:5173
```

### Frontend Setup

1. Copy the example file:
```bash
cd frontend
cp .env.example .env
```

2. Edit `frontend/.env` and fill in:

```env
# Get this from team lead
VITE_CLERK_PUBLISHABLE_KEY=<ask_team_lead>

# These should work as-is
VITE_API_URL=http://localhost:5000/api
VITE_ENV=development
VITE_APP_NAME=drishtimap
```

## Step 4: Run the Application

Open **two terminal windows**:

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

You should see:
```
[AI Config] Success: Gemini initialized
[AI Config] Success: Groq initialized
Server running in development mode on port 5000
MongoDB Connected
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

## Step 5: Open the App

Open your browser and go to: **http://localhost:5173**

## Common Issues & Solutions

### Issue: "Port 5000 already in use"
**Solution:**
```bash
# Windows
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### Issue: "MongoDB connection failed"
**Solution:** Ask team lead for the correct `MONGODB_URI`

### Issue: "Clerk authentication not working"
**Solution:** Make sure you have the correct `CLERK_SECRET_KEY` and `VITE_CLERK_PUBLISHABLE_KEY`

### Issue: "AI features not working"
**Solution:** Verify `GOOGLE_API_KEY` and `GROQ_API_KEY` are set correctly

## Project Structure

```
drishtimap/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route handlers
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic & AI
│   │   └── index.js     # Entry point
│   └── package.json
│
├── frontend/            # React + Vite
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── quest/       # Quest system
│   │   └── services/    # API calls
│   └── package.json
│
└── README.md           # Full documentation
```

## Development Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Edit files
   - Test locally
   - Commit frequently

4. **Push your changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Go to GitHub
   - Create PR from your branch to main
   - Request review from team

## Testing Your Changes

### Test Backend
```bash
cd backend
npm run dev
# Check http://localhost:5000/health
```

### Test Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

### Test Full Flow
1. Sign in with Clerk
2. Create a new project
3. Fill in quest levels
4. Test AI suggestions
5. Generate research report
6. Download PDF

## Need Help?

- **Documentation:** See `README.md` for full details
- **API Reference:** See `API_DOCUMENTATION.md`
- **Deployment:** See `DEPLOYMENT.md`
- **Team Lead:** Contact for API keys and access

## Quick Commands Reference

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Important Notes

1. **Never commit `.env` files** - They contain secrets
2. **Always pull before starting work** - Avoid merge conflicts
3. **Test before pushing** - Make sure everything works
4. **Ask for help** - Don't struggle alone!

## What to Ask Team Lead For

When you join the project, ask for:
- [ ] MongoDB connection string
- [ ] Clerk API keys (secret + publishable)
- [ ] Google Gemini API key
- [ ] Groq API key
- [ ] Access to GitHub repository
- [ ] Access to project management tools

## You're All Set!

Once you see both servers running without errors, you're ready to start developing!

Happy coding! 🚀
