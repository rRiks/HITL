# System Architecture Document (ARCHITECTURE.md)
## Project: Voxel AIDLC — Multi-Game Platform Architecture (SoC Modular Edition)
**Target Environment:** 512MB RAM Linux VM / Container  
**Concurrency Target:** 50–60 Concurrent Users Across 10–15 Workshop Rooms  
**Languages/Frameworks:** Python (FastAPI), React 19 (Vite), Three.js (WebGL)  
**Core Architectural Standard:** Strict Separation of Concerns (SoC) & High Cohesion

---

## 1. High-Level Architecture & Separation of Concerns (SoC)

The Voxel AIDLC platform is designed with clear architectural boundaries. Instead of concentrating timers, scoring, AI chat, candidates, and HTTP endpoints into monolithic "god classes," the architecture segregates responsibilities across isolated domain services on the backend and dedicated controller hooks on the frontend.

```
                               ┌────────────────────────────────────────────────────────┐
                               │                  Web Browser Clients                   │
                               │         (50–60 Workshop Attendees across Rooms)        │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ HTTP REST / Polling (2s)
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │                 FastAPI App Server                     │
                               │                (Single-Worker Uvicorn)                 │
                               └─────────────┬────────────────────────────┬─────────────┘
                                             │                            │
                                             ▼                            ▼
                 ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
                 │       Game 1: Gatekeeper API         │     │     Game 2: Sprint Delivery API      │
                 │        (/api/game/{room_id}/*)       │     │       (/api/sprint/{room_id}/*)      │
                 └──────────────────┬───────────────────┘     └──────────────────┬───────────────────┘
                                    │                                            │
                                    ▼                                            ▼
                 ┌──────────────────────────────────────┐     ┌──────────────────────────────────────┐
                 │        Legacy GameStateManager       │     │     Sprint Modular Domain Services   │
                 │        (Monolithic Compatibility)    │     │     (Strict Separation of Concerns)  │
                 └──────────────────────────────────────┘     └──────────────────┬───────────────────┘
                                                                                 │
                            ┌─────────────────────────┬──────────────────────────┼─────────────────────────┬─────────────────────────┐
                            ▼                         ▼                          ▼                         ▼                         ▼
                 ┌─────────────────────┐   ┌─────────────────────┐    ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐
                 │    ClockService     │   │   CandidateRepo     │    │   CopilotEngine     │   │   RulesEvaluator    │   │   ScoringService    │
                 │ (25m Countdown,     │   │ (6 Candidates,      │    │ (Multi-Turn Chat,   │   │ (Domain Tokens,     │   │ (Health, Debt,      │
                 │  Penalties, Overtime│   │  Hidden Risk Pool)  │    │  Dialogue States)   │   │  Keyword Matching)  │   │  Dice Rolls, Pulls) │
                 └─────────────────────┘   └─────────────────────┘    └─────────────────────┘   └─────────────────────┘   └─────────────────────┘
```

---

## 2. Backend SoC Modular Architecture (`backend/sprint/`)

Each backend file has exactly **one responsibility**, preventing code sprawl and simplifying testing:

```
backend/
├── main.py                         <-- Application Root (Registers routers & middleware)
├── models.py                       <-- Pydantic Data Contracts & Shared Schemas
├── game_state.py                   <-- Game 1 Legacy Manager (Preserved for compatibility)
│
└── sprint/                         <-- Game 2 Isolated Domain Package
    ├── __init__.py                 <-- Exports domain services
    ├── clock_service.py            <-- 1. Master 25-minute sprint clock, overtime math & penalties
    ├── candidate_repo.py           <-- 2. 6-candidate pool storage & stochastic sampling
    ├── rules_evaluator.py          <-- 3. Token extraction, regex keyword matching
    ├── copilot_engine.py           <-- 4. Multi-turn dialogue state machine & reply generation
    ├── scoring_service.py          <-- 5. Health calculations, technical debt, and dice roll results
    ├── session_manager.py          <-- 6. Pure Orchestrator facade tying the domain services together
    └── sprint_router.py            <-- 7. Pure Controller: HTTP endpoints, validation & serialization
```

### 2.1 Backend Domain Service Responsibilities

| Service | File | Responsibility Boundary |
| :--- | :--- | :--- |
| **`SprintClockService`** | `clock_service.py` | Tracks master sprint timestamp, remaining seconds, deductions (-210s for manual override, -45s for failed incidents), and overtime health penalties. Knows nothing about code diffs or tower blocks. |
| **`CandidateRepository`** | `candidate_repo.py` | Pure data repository. Manages the 6 pre-scripted candidates per stage, stochastic sampling (with replacement), and holds hidden risk probabilities. |
| **`RulesEvaluator`** | `rules_evaluator.py` | Pure functional string evaluator. Normalizes user prompts, scans domain keywords, and returns score weights. |
| **`CopilotEngine`** | `copilot_engine.py` | Manages the conversation state machine. Uses `RulesEvaluator` to compute risk reductions and formats human-like responses with live code diff revisions. |
| **`ScoringService`** | `scoring_service.py` | Calculates dice rolls based on hidden candidate risk, updates health deltas, tracks Jenga block mining counts, and verifies must-clear conditions. |
| **`SprintSessionManager`** | `session_manager.py` | Orchestrator facade. Maintains room session state and delegates actions to the specialized services without containing business logic directly. |
| **`SprintRouter`** | `sprint_router.py` | FastAPI router. Strictly handles HTTP request parsing, Pydantic validation, status codes, and JSON response formatting. |

---

## 3. Frontend SoC Modular Architecture (`frontend/src/games/sprint_delivery/`)

The frontend strictly decouples **presentation** from **state management** and **network effects**:

```
frontend/src/
├── components/                            <-- 100% Shared UI Kit (Zero Code Duplication)
│   ├── StageArena.jsx                     <-- 7-col/5-col Responsive Orchestrator
│   ├── StageScenarioViewer.jsx            <-- Scenario Briefing & Code Diff Viewer
│   ├── Virtual3DTower.jsx                 <-- Three.js WebGL Jenga Twin & Physics
│   ├── StageDecisionConsole.jsx           <-- 4-Slot Voting & Consensus Console
│   ├── Navbar.jsx                         <-- Top Mission Control HUD
│   ├── ActionModals.jsx                   <-- Generic Result Modal & Dialogs
│   ├── GameOverModal.jsx                  <-- Incident Debrief & Collapse Screen
│   ├── VictoryScreen.jsx                  <-- Final Audit & Sprint Delivery Report
│   └── WelcomeScreen.jsx                  <-- Mode Selector (Gatekeeper vs. Sprint Delivery)
│
└── games/
    └── sprint_delivery/                   <-- Game 2 Isolated Domain Package
        ├── config/
        │   ├── sprintActions.js           <-- 4 Decision Actions (Labels, Icons, Themes)
        │   └── sprintStages.js            <-- Stage Titles, Phases, and Scenario Briefs
        │
        ├── hooks/
        │   ├── useSprintClock.js          <-- Manages 25:00 countdown, status badge, ticking
        │   ├── useSprintDialogue.js       <-- Manages multi-turn chat messages & typewriter effect
        │   ├── useSprintActions.js        <-- Dispatches Accept As-Is, Manual, Guardrails, Tokens
        │   └── useSprintSession.js        <-- Top-level facade composing hooks into unified state
        │
        ├── components/
        │   ├── SprintNavbarHUD.jsx        <-- Specialized 25:00 Sprint Clock & Urgency Badge
        │   ├── SprintChatDrawer.jsx       <-- Interactive Copilot Chat Drawer
        │   ├── ManualOverrideModal.jsx    <-- Senior Dev Confirmation Dialog (-3:30, token burn)
        │   └── SprintReportCard.jsx       <-- Sprint Burndown & Delivery Metrics
        │
        └── SprintDeliveryScreen.jsx       <-- Pure Presentation Orchestrator (Wires hooks to StageArena)
```

### 3.1 Frontend Hook Responsibilities

- **`useSprintClock`**: Runs the 25-minute countdown interval. Returns human-readable formats (`24:15`, `-01:10`) and urgency tiers (`on_track` | `crunch` | `zero_hour` | `overtime`).
- **`useSprintDialogue`**: Maintains the multi-turn chat array, optimistic user message appending, and simulated streaming typewriter effect (`isTyping: boolean`).
- **`useSprintActions`**: Encapsulates API mutations (`acceptAsIs`, `steerTurn`, `manualOverride`, `enforceGuardrail`), tracks remaining Senior Dev Tokens (starts at 2), and manages loading states.
- **`SprintDeliveryScreen.jsx`**: Contains **zero state machines or business logic**. It consumes `useSprintSession` and renders [`StageArena.jsx`](file:///c:/Users/saubh/Documents/GenAI/AI/HITL/frontend/src/components/StageArena.jsx).

---

## 4. Deterministic Simulated Copilot Dialogue Flow

```
[ User types in SprintChatDrawer ]
               │
               ▼
   [ useSprintDialogue Hook ] (Optimistic UI: Appends user message)
               │
               ▼ HTTP POST /api/sprint/{room_id}/steer-turn
   [ SprintRouter ] (Pydantic validation)
               │
               ▼
   [ SprintSessionManager ]
               │
               ▼
   [ RulesEvaluator ] (Scans architectural tokens: 'batchable', 'chunk', 'stateful')
               │
               ▼
   [ CopilotEngine ] (Computes risk degradation, updates live code diff, builds reply)
               │
               ▼
[ Response: reply_text, updated_code_diff, is_hardened ]
               │
               ▼
   [ useSprintDialogue Hook ] (Streams typewriter animation into Chat Drawer)
               │
               ▼
   [ StageScenarioViewer ] (Live re-renders syntax-highlighted refactored diff!)
```

---

## 5. Memory, CPU & Storage Budget Verification (512MB Hosting)

| Resource | Monolithic Game 1 | SoC Modular Game 2 | Total Platform Footprint | 512MB Headroom |
| :--- | :--- | :--- | :--- | :--- |
| **RAM (Memory)** | ~35 MB (FastAPI runtime) | ~5 MB (Domain services & rooms) | **~40 MB** | **~472 MB Free (92%)** |
| **Disk Storage** | ~25 MB (Base code) | ~120 KB (Domain packages) | **~25.2 MB** | **Hundreds of MB Free** |
| **CPU Time per Action** | < 1 ms | < 1 ms (Pure token search) | **Negligible** | **< 5% load on 1 vCPU** |

The modular SoC design introduces **zero runtime memory penalty** over a monolith, while radically improving maintainability, testability, and code readability.
