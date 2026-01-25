# DrishtiMap

A strategic project planning platform that transforms your ideas into structured, actionable frameworks using the Logical Framework Approach (LFA). DrishtiMap combines an intuitive questionnaire flow with AI-powered suggestions and generates comprehensive research reports complete with visual diagrams.

---

## What It Does

DrishtiMap guides you through a five-level process to design development projects, social initiatives, or grant proposals:

1. **Context** – Define the problem and identify stakeholders.  
2. **Strategy** – Set your impact goals and desired outcomes.  
3. **Operation** – Plan activities and resource allocation.  
4. **Measure** – Establish KPIs and success indicators.  
5. **Logic Check** – Review assumptions and risks.

At each level, an AI co-pilot suggests ideas tailored to your inputs. Once the framework is complete, you can generate a visual research report with Mermaid diagrams, stakeholder maps, timelines, and more.

---

## Key Features

- **Guided LFA Workflow** – Step-by-step questionnaire that collects project details.
- **AI Suggestions** – Gemini-powered recommendations for goals, activities, and KPIs.
- **Document & URL Analysis** – Upload PDFs/images or paste article links to auto-extract project context.
- **Visual Research Reports** – Auto-generated markdown reports with 10+ Mermaid diagrams.
- **Project Dashboard** – Save, rename, and manage multiple projects.
- **Export Options** – Download your framework as JSON or PDF.

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Zustand           |
| Backend    | Node.js, Express, MongoDB (Mongoose)            |
| Auth       | Clerk                                           |
| AI         | Google Gemini (primary), Groq/Llama (research)  |

---

## Project Structure

```
drishtimap/
├── backend/
│   ├── src/
│   │   ├── config/         # Database & AI configuration
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, rate-limit, uploads
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   ├── services/ai/    # AI prompt logic & research
│   │   └── index.js        # Server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages (Dashboard, Quest, etc.)
│   │   ├── quest/          # LFA engine, levels config, UI
│   │   ├── services/       # API service wrappers
│   │   └── styles/         # CSS variables, typography, animations
│   └── package.json
│
└── README.md
```

---

## Quick Start

Detailed setup instructions are available in [`SETUP.md`](./SETUP.md). Here's the summary:

```bash
# Clone the repository
git clone https://github.com/yourusername/drishtimap.git
cd drishtimap

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment variables (see SETUP.md)

# Run development servers
# Terminal 1 (backend)
cd backend && npm run dev

# Terminal 2 (frontend)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

The application requires configuration for the database, authentication, and AI services. See the `.env.example` files in both `/backend` and `/frontend` directories, or refer to [`SETUP.md`](./SETUP.md) for a complete breakdown.

---

## License

This project is proprietary. All rights reserved.

---

## Contributing

Contributions are not currently accepted as this is a private project. If you have feedback or questions, please reach out directly.
