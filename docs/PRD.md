# Product Requirements Document (PRD)
## Project: Voxel AIDLC — Dual-Mode Mission Control (Gatekeeper & Sprint Delivery)
**Version:** 2.0  
**Status:** Approved for Implementation  
**Target Environment:** 512MB RAM Cloud Server (Supporting 50–60 Concurrent Workshop Players)

---

## 1. Executive Summary
Voxel AIDLC is an interactive, gamified Human-in-the-Loop (HITL) developer workshop platform. It puts software engineering squads in the cockpit of an AI-augmented development lifecycle (AIDLC), where AI code proposals directly impact a 3D architectural twin (Jenga tower), system health, technical debt, and deployment velocity.

This PRD formalizes the evolution from a single game into a **Dual-Mode Platform**:
1. **Gatekeeper Mode (Game 1)**: Tactical PR-by-PR review with a per-stage 2-minute timer, fast triage, and tower survival.
2. **Sprint Delivery Mode (Game 2)**: Strategic sprint delivery under a **consolidated 25-minute master deadline**, featuring multi-turn human-AI prompt steering, dynamic candidate sampling with hidden risk, and strict must-clear stage gates.

Both games reuse the unified 3D voxel physics engine, theme system, responsive split-screen layouts, and multi-player consensus consoles without UI duplication.

---

## 2. Product Objectives & Target Audience
- **Target Audience:** Engineering managers, enterprise developers, DevOps architects, and workshop teams (up to 50–60 simultaneous attendees distributed across table rooms).
- **Core Educational Value:**
  - Learn when to trust automated AI proposals vs. when to enforce architectural guardrails.
  - Experience the real-world trade-off between **Velocity** (relying blindly on AI) and **Craftsmanship** (manual engineering or prompt iteration).
  - Understand compounding technical debt and governor/architectural failure patterns.

---

## 3. Game Mode Comparison

| Dimension | Mode 1: Gatekeeper | Mode 2: Sprint Delivery |
| :--- | :--- | :--- |
| **Pacing / Timer** | 2 minutes per stage (resets each stage) | **Single 25:00 consolidated countdown** for the entire 11-stage sprint |
| **Time Tracking** | Time left in current round | Live global sprint clock + **per-stage elapsed time breakdown** |
| **Stage Progression** | Bypass permitted via *Deny & Move On* | **Must-Clear Gate**: Stage must be resolved successfully to advance |
| **Accept As-Is** | Single fixed AI proposal with visible base risk | **Pool of 6 candidates with HIDDEN risk**; re-proposing possible on retries |
| **Human-AI Interaction** | Single-shot prompt submission | **Interactive Multi-Turn Prompt Steer** (iterative chat refinement) |
| **Manual Coding** | Not available (AI bypass only) | **Manual Override**: Guaranteed quality, heavy velocity cost (-3:30), limited tokens |
| **Win Condition** | Complete 11 stages without tower collapse | Clear all 11 stages before the 25-minute sprint deadline without tower collapse |
| **Loss Condition** | Health reaches 0% or tower collapses | Tower collapse OR sprint deadline runs out (or overtime health exhaustion) |

---

## 4. Sprint Delivery Mode: Detailed Mechanics

### 4.1 The 25-Minute Master Sprint Clock
- A single clock starts at `25:00` upon launching Stage 1.
- Ticks continuously across all stages. Does not pause between stages unless the Game Master issues an administrative freeze.
- **Sprint Urgency Tiers**:
  - `25:00 - 15:00`: 🟢 **On Track** (Normal cadence)
  - `15:00 - 05:00`: 🟡 **Sprint Crunch** (Yellow alert, prompts faster decisions)
  - `05:00 - 00:00`: 🔴 **Zero Hour / Critical Deadline** (Red pulsing alert)
  - `00:00`: ⚠️ **Overtime Crunch Mode** (Red negative clock `-00:01`, developers suffer 5% fatigue health loss every 30 seconds until completion or collapse)

### 4.2 The 4 Decision Choices

#### Slot 1: Accept AI As-Is (Autopilot)
- **Concept:** Instantly merge the currently presented AI proposal without human verification.
- **Time Cost:** `0s` (Instant commit).
- **Risk Mechanics:** Evaluates against the **hidden risk percentage** of the active candidate (from the 6-candidate pool).
  - Example: If candidate has 70% hidden risk, roll fails on 1–70.
  - Failure: -25% Health, 2–3 tower blocks pulled, +45s incident remediation penalty, stage remains uncleared.
  - Success: Stage cleared, +5% Health, 0 blocks.

#### Slot 2: Manual Override (Senior Dev Craftsmanship)
- **Concept:** Reject AI automation entirely; senior developer writes hardened production code from scratch.
- **Balancing Twists (Anti-OP):**
  1. **Heavy Velocity Burn:** Costs **3:30 minutes** deducted directly from the 25-minute sprint clock.
  2. **Token Limit:** The squad is allocated only **2 Senior Dev Override Tokens** for the entire sprint.
  3. **Fatigue Risk:** If used during Crunch Time (< 5m remaining), human error rate is 15% (not 100% immune).
- **Outcome:** +15% Health restored, 0 blocks pulled, repairs 1 point of Technical Debt.

#### Slot 3: Prompt Steer (Interactive Human-AI Dialogue)
- **Concept:** Multi-turn collaborative chat with the AI Copilot to refine implementation and minimize risk.
- **Flow:**
  1. Team enters prompt instruction in the chat drawer.
  2. Simulated AI engine matches domain keywords and responds conversationally.
  3. Git diff in the scenario viewer updates live to show the refactored code.
  4. Hidden risk drops progressively (e.g. 75% ➔ 35% ➔ 10%).
  5. Team can refine again or click **Commit & Deploy**.
- **Time Cost:** Consumes active real-world sprint time spent drafting and reading responses (~30s–60s).

#### Slot 4: Enforce Guardrail (Pre-Scanned Rules)
- **Concept:** Team selects from 3 pre-scanned architectural fixes with trade-off profiles.
- **Time Cost:** `+15s` automated review overhead.
- **Outcome:** Predictable quality adjustment (+5% to +10% Health, 0–1 block pulled).

---

### 4.3 Dynamic 6-Candidate Pool & Hidden Risk
- Each of the 11 stages contains 6 distinct AI code proposals:
  - Candidates 1–2: Flawed / Anti-Pattern (High Hidden Risk: 65%–85%)
  - Candidates 3–4: Moderate / Partial Workaround (Medium Hidden Risk: 35%–55%)
  - Candidates 5–6: Clean / Defensive Architecture (Low Hidden Risk: 5%–20%)
- **Hidden Metric:** The risk percentage is completely omitted from the UI. Players must inspect the git diff to identify architectural flaws.
- **Stochastic Sampling:** On stage start or retry, a candidate is selected randomly from the pool. Re-proposing a previously seen candidate is permitted.

---

### 4.4 Stage Time Tracking & Post-Sprint Telemetry
- The game tracks exact elapsed time per stage.
- **Sprint Delivery Report Card (End Screen):**
  - Total Time Taken vs. 25:00 Target (e.g. `Delivered in 21m 14s — 3m 46s Buffer`).
  - Sprint Burndown Chart (stage-by-stage pacing visualizer).
  - Automation Efficiency Index (% of stages cleared via AI vs. Manual).
  - Incidents & Remediation Penalties incurred.

---

## 5. Non-Functional & Operational Requirements
- **Memory Footprint:** The combined server footprint must remain under **45MB RAM** (leaving >450MB free on the 512MB hosting tier).
- **Disk Storage:** Rule dictionaries and code diff candidates must not exceed **150KB** total.
- **Concurrency:** Support 10–15 concurrent table rooms (50–60 active web clients) with sub-50ms endpoint latency.
- **UI Architecture:** Zero duplication of core display components (`StageArena`, `StageScenarioViewer`, `Virtual3DTower`, `StageDecisionConsole`, `Navbar`).
