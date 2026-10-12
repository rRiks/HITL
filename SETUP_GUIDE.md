# 🚀 HITL Jenga: Developer Setup & Local Run Guide

Welcome to the **Human-in-the-Loop (HITL) Jenga: Salesforce SDLC War-Room** project!

This guide walks a new engineer through cloning the repository, setting up both backend and frontend environments, and running the simulation locally on **Windows (PowerShell)** or **macOS / Linux (Bash)**.

---

## 📋 System Prerequisites

Before starting, ensure you have the following installed:

| Tool | Minimum Version | Check Command |
|---|---|---|
| **Git** | 2.x+ | `git --version` |
| **Python** | 3.10+ | `python --version` (or `python3 --version`) |
| **Node.js** | 18.x or 20.x+ | `node --version` |
| **npm** | 9.x+ | `npm --version` |

---

## ⚡ 5-Minute Quickstart

### 1. Clone the Repository
```bash
git clone <REPO_URL>
cd HITL
```

---

### 2. Backend Setup (FastAPI Python)

Open a terminal in the project directory:

#### On Windows (PowerShell):
```powershell
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1
# (Note: If script execution is restricted, run: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass)

# Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Start backend server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### On macOS / Linux (Bash / Zsh):
```bash
cd backend

# Create virtual environment
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate

# Install dependencies
python3 -m pip install --upgrade pip
pip install -r requirements.txt

# Start backend server
python3 -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

> **Backend is running at:** `http://127.0.0.1:8000`  
> **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup (React 19 + Vite + Three.js)

Open a **second terminal** in the `HITL` root directory:

```bash
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

> **Frontend application is running at:** `http://localhost:5173`

---

## ✅ Verifying Your Local Setup

1. Open **[http://localhost:5173](http://localhost:5173)** in your browser.
2. You will see the **Salesforce HITL Jenga SDLC Challenge** Welcome Screen.
3. Select a table preset (e.g. `Table 1`), enter your name (e.g. `Alice`), and click **"Start Mission & Initialize Tower"**.
4. The 3D Cockpit Arena will load with:
   - The interactive **3D Virtual Architecture Tower** (rendered via Three.js with full 360° mouse drag orbit and zoom).
   - Stage 1: **"The Governor Limit Trap"** scenario with code diff and 4 decision buttons.
   - The **120-second countdown timer** ticking in the top bar.
   - The **Lobby** button in the top right navbar to return to the table selector at any time.

---

## 👥 How to Test Multi-Player Co-Op Locally (Single Laptop)

The platform supports live co-op gameplay where multiple teammates at the same table vote together in real time. You can easily test this on a single machine:

1. **Player 1 (Host):**
   - Open [http://localhost:5173](http://localhost:5173) in a standard browser tab (e.g. Chrome).
   - Enter Player Name: `Alice`, select `Table 1`, and click **Start Mission**.

2. **Player 2 (Teammate):**
   - Open [http://localhost:5173](http://localhost:5173) in an **Incognito / Private Window** (or a different browser like Edge / Firefox).
   - The Welcome Screen will detect that `Table 1` is already live.
   - Enter Player Name: `Bob`, select `Table 1`, and click **"Join Live Session as Bob"**.

3. **Democratic Voting & Co-Op Features to Test:**
   - **Roster Presence:** Both `Alice` and `Bob` appear in the Active Team Roster in the center console.
   - **Voting:** When `Alice` clicks an option, `Bob` immediately sees Alice's vote indicator update.
   - **Consensus:** Once all connected active players submit their vote, consensus resolves immediately without waiting for the timer!
   - **Collaborative Drafting:** If either player clicks **"Discuss & Custom Prompt"** or **"Suggest Change"**, the draft is shared in real time with the teammate.
   - **50/50 Tie-Breaker:** If Alice votes for Option 1 and Bob votes for Option 2, the backend executes an automatic 50/50 toss-up when all votes are in.

---

## 🛠️ Useful Developer URLs & Flags

| URL | Purpose |
|---|---|
| `http://localhost:5173` | Main app (auto-resumes your active in-game session) |
| `http://localhost:5173/?lobby=true` | Forces navigation directly to the Welcome Screen / Lobby |
| `http://localhost:5173/?room=table-2` | Deep-links directly to Table 2 |
| `http://127.0.0.1:8000/docs` | FastAPI Swagger documentation for all backend endpoints |
| `http://127.0.0.1:8000/api/health` | Backend healthcheck (`status: healthy`) |
| `http://127.0.0.1:8000/api/leaderboard` | Live cross-table scores and status |

---

## 📂 Project Architecture Overview

```
HITL/
├── backend/
│   ├── main.py              # FastAPI application, route handlers & CORS
│   ├── game_state.py        # Multi-room state machine, voting consensus, tie-breakers
│   ├── models.py            # Pydantic data schemas & request/response contracts
│   ├── stages_data.py       # 11 Salesforce crisis stages, code diffs & risks
│   └── requirements.txt     # Python dependencies (fastapi, uvicorn, pydantic)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main coordinator, session state & modal triggers
│   │   ├── services/
│   │   │   └── api.js               # REST client & player/room session persistence
│   │   ├── components/
│   │   │   ├── Virtual3DTower.jsx   # Three.js 18-layer 3D tower & top-down physics
│   │   │   ├── StageArena.jsx       # Decision consoles, voting roster & collaborative drafting
│   │   │   ├── WelcomeScreen.jsx    # Table lobby, player name input & room joiner
│   │   │   ├── Navbar.jsx           # Cockpit bar, stage pipeline, timer & Lobby button
│   │   │   ├── ActionModals.jsx     # Prompt drawer, Guardrails selector & Result popup
│   │   │   ├── GameOverModal.jsx    # 3D collapse viewer, post-mortem debrief & restart
│   │   │   └── VictoryScreen.jsx    # Release certificate, confetti & retrospective
│   │   └── hooks/
│   │       └── useSound.js          # Procedural Web Audio API sound synthesizer
│   ├── vite.config.js               # Dev server configuration & /api proxy to port 8000
│   └── package.json                 # Node dependencies (React 19, Three.js, Tailwind v4)
```

---

## ❓ Troubleshooting & FAQs

### 1. `Port 8000` or `Port 5173` already in use
- **Windows:** Check and kill the process:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process -Force
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
  ```
- **macOS / Linux:**
  ```bash
  lsof -ti:8000 | xargs kill -9
  lsof -ti:5173 | xargs kill -9
  ```

### 2. PowerShell execution policy error when activating `.venv`
Run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

### 3. Frontend cannot connect to Backend
- Confirm backend is running at `http://127.0.0.1:8000/api/health`.
- `frontend/vite.config.js` proxies `/api` requests to `http://127.0.0.1:8000`. If you change the backend port, update the proxy target in `vite.config.js`.

### 4. How to reset a table to Stage 1
- Click the **Reset SDLC** icon (counter-clockwise arrow) in the top navigation bar.
- Or visit the Welcome Screen (`?lobby=true`) and select another table (`table-1` through `table-5`).
