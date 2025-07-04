<h1 align="center">
  <b>Spellbook</b> <br>
  <span style="font-size:1.2em;">Your AI-Powered Script Library & Automation Hub</span>
</h1>

<!-- Banner -->
<p align="center">
  <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80" alt="Project Banner" width="80%" />
</p>

<div align="center">
  <img alt="Docker" src="https://img.shields.io/badge/containerized-Docker-blue?logo=docker">
  <img alt="FastAPI" src="https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi">
  <img alt="MongoDB" src="https://img.shields.io/badge/database-MongoDB-47A248?logo=mongodb">
  <img alt="React" src="https://img.shields.io/badge/frontend-React-61DAFB?logo=react">
  <img alt="Electron" src="https://img.shields.io/badge/platform-Electron-47848F?logo=electron">
  <img alt="Tailwind" src="https://img.shields.io/badge/ui-Tailwind_CSS-38B2AC?logo=tailwindcss">
</div>

---

## ✨ Overview

**Spellbook** is a powerful, cross-platform desktop application for clustering, automating, and managing all your utility scripts—supercharged with AI.  
Easily organize and execute a variety of scripts in seamless clusters, automate complex workflows with a single click, and use natural language to create new automations with Google Gemini.

---

## 💡 Why Spellbook?

- **Cluster scripts with ease:** Select, group, and run multiple scripts in a sequence or batch. No more manual copy-paste or script juggling—Spellbook lets you automate entire workflows using your existing utilities.
- **AI-driven automation:** Use natural language to describe what you want to automate, and let Gemini suggest, combine, or even generate scripts for you.
- **Accessible & organized:** Your scripts are always at your fingertips—tag, search, and manage them with a sleek visual interface.

---

## 🏗️ Architecture & Stack

| Layer        | Main Tech            | Purpose                                          |
|--------------|---------------------|--------------------------------------------------|
| Frontend     | React, Tailwind CSS | UI/UX, script editing, chat interface            |
| Electron     | Electron            | Desktop integration, file system operations      |
| Backend      | FastAPI (Python)    | REST API, AI chat, code generation, auth         |
| Database     | MongoDB (Docker)    | Script and user data persistence                 |
| AI           | Google Gemini API   | Generative chat, code suggestions, script assist |
| Container    | Docker Compose      | Multi-service orchestration, dev & prod parity   |

---

## 🚀 Features

- 📚 **Script Library:** Organize, tag, and search your scripts in one place  
- 🤖 **AI-Powered Chat:** Generate, cluster, and automate scripts using natural language  
- 🗃️ **Script Clustering:** Select and run batches or sequences of scripts with a single click  
- 🖥️ **Desktop Native:** Electron-powered, cross-platform app  
- 🏃 **One-Click Execution:** Run scripts with custom parameters and drag-n-drop files  
- 🧠 **Agentic Automations:** Let Gemini intelligently combine and automate your scripts  
- ⚡ **Hot Reload:** Rapid development via Docker Compose  
- 🔐 **Secure:** Environment-based secrets, safe script handling

---

## 📁 Project Structure

```text
spurhacks-25-proj/
├── backend/            # FastAPI backend (Python)
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/           # (Optional: legacy frontend)
├── electron-frontend/  # Main desktop UI (React + Electron)
│   ├── src/
│   │   ├── components/
│   │   ├── index.html
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── preload.js
├── docker-compose.yml         # Production orchestration
├── docker-compose.dev.yml     # Development (hot reload)
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Node.js](https://nodejs.org/) (for local frontend development)
- Google Gemini API Key

### Development

```bash
# Set your Google Gemini API key
export GOOGLE_API_KEY="your-api-key-here"

# Start all services (backend, frontend, MongoDB)
docker-compose -f docker-compose.dev.yml up
```
- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost:5173](http://localhost:5173)
- MongoDB: `localhost:27017`

### Production

```bash
docker-compose up --build
```
- Backend: [http://localhost:8000](http://localhost:8000)
- Frontend: [http://localhost](http://localhost)
- MongoDB: `localhost:27017`

---

## 🔑 Environment Variables

| Variable           | Location           | Purpose                       |
|--------------------|-------------------|-------------------------------|
| `GOOGLE_API_KEY`   | Backend, Frontend | Google Gemini integration     |
| `DATABASE_URL`     | Backend           | MongoDB connection string     |

---

## 🛠️ Useful Docker Commands

```bash
docker-compose down             # Stop all services
docker-compose down -v          # Stop and remove volumes (reset DB)
docker-compose logs -f [name]   # View logs for a service
docker-compose build [name]     # Rebuild a specific service
docker-compose exec backend bash  # Shell into backend container
docker-compose exec frontend sh   # Shell into frontend container
```

---

## 🐞 Troubleshooting

- **Port conflicts**: Ensure ports 80, 8000, 5173, 27017 are free.
- **CORS issues**: Adjust allowed origins in `backend/app/main.py` if needed.
- **DB connection**: Let MongoDB fully start before backend connects (handled by Docker Compose).
- **Frontend API**: Uses relative `/api` paths in production, absolute URLs in dev.

---

## 🙇 Acknowledgements

- [SpurHacks 2025](https://spurhacks.com/)
- Google Gemini
- FastAPI, React, Electron, Tailwind, MongoDB, Docker
