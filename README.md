# HITL Jenga

HITL Jenga is a multiplayer workshop game about the value of people in AI-assisted software delivery. Teammates review an AI proposal, bring in human context, test the behavior that matters, and decide together when to Merge. Their decisions affect a shared 54-block 3D tower.

The current workshop configuration uses the **Launch Day Sprint** story: 11 fictional pull requests that follow a live team event from opening the lobby to announcing a winner. The separate **Classic Sprint** pack retains the original Salesforce scenarios. The optional two-minute **Gatekeeper** mode can be hidden and blocked with a configuration flag.

## Start here

| Reader | Document |
| --- | --- |
| Player | [Sprint Delivery player guide](docs/SPRINT_PLAYER_GUIDE.md) or the in-game Field Guide |
| Facilitator | [Current Launch Day stage answer key](docs/SPRINT_STAGE_REFERENCE.md) and the authenticated admin dashboard |
| Developer | [Setup guide](SETUP_GUIDE.md), [architecture](docs/ARCHITECTURE.md), and [low-level design](docs/LLD.md) |
| Deploying the app | [Docker runbook](DOCKER_RUN.md) and [enterprise hosting request](ENTERPRISE_DEPLOYMENT_REQUEST.md) |
| Evaluating the alternate pack | [Classic stage answer key](docs/CLASSIC_STAGE_REFERENCE.md) and [Launch Day design notes](docs/SPRINT_LAUNCH_DAY_DRAFT.md) |

## Sprint Delivery at a glance

- **11 tickets, one 30-minute team clock.** Time continues below zero. Every 90 seconds of overtime costs 5 tower health.
- **Four proposal paths.** Accept the current AI diff; spend one of two senior tokens and 3 minutes 30 seconds on Manual Override; select ticket-specific changes in Claude chat; or spend one of four guardrail review credits and 15 seconds on Enforce Guardrail. Guardrail also starts one selected first test.
- **People supply missing facts.** Each ticket has two secret notes from stakeholders or testers. A note reveals after 10 real seconds and syncs to the whole team. The shared Sprint has three hints.
- **Tests show evidence.** Every test takes 15 real seconds. Passing regression checks give 70% ticket coverage. The key targeted test gives the final 30% only if the current code passes it; limited checks give 10% each. A failed test gives no coverage. A code change resets current results and votes.
- **The team reviews the current diff.** Active teammates vote Ready to merge or Needs work in the cockpit. A strict Ready majority permits a normal Merge. The Merge confirmation allows an explicit override without a majority for one extra block pull. Incomplete tests or unread notes warn but do not hard-block Merge.
- **A working Merge clears the ticket.** A faulty Merge leaves the ticket open, creates a bug, adds debt, costs 15 health plus three block pulls, and locks the same diff until it changes. Every block costs 3 health. The tower topples only at 0 health, not after a fixed number of pulls.
- **Hotfix & Retry** returns to the same ticket with 35% health and a fresh proposal. Tests and votes reset; previously spent resources, bugs, pulls, and negative time remain.
- **Score reflects delivery and human review.** A working Merge earns 5 points, verified 100% coverage and a passing key test earn 3 more, and qualifying human review earns 2 more. A faulty Merge costs 10 points. The maximum before penalties is 110.

Players see their own score. Cross-team standings and sortable live squad controls live in the authenticated admin dashboard. The server puts every Sprint table in the **Bangalore** workshop; teammates use each table's four-character PIN, not a workshop code.

The scenarios, diffs, and test results are authored game content. Sprint does not execute those code excerpts against a real application, CI pipeline, or Salesforce org.

## Run locally

See the [setup guide](SETUP_GUIDE.md) for Windows, macOS, Linux, and multiplayer testing. In brief:

1. From the repository root, copy .env.example to .env. Set a development admin secret, ENVIRONMENT=development, and CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173.
2. Start the backend with Python 3.11 or newer:

       python3 -m venv .venv
       source .venv/bin/activate
       pip install -r backend/requirements.txt
       python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload

3. In another terminal, start the frontend with Node.js and npm:

       cd frontend
       npm install
       npm run dev

4. Open http://localhost:5173. API documentation is at http://127.0.0.1:8000/docs.

For containers, use the [Docker runbook](DOCKER_RUN.md). Docker Compose mounts a named volume for Sprint SQLite snapshots.

## Configuration and content packs

| Setting | Purpose |
| --- | --- |
| SPRINT_CONTENT_PACK=launch_day | Use the current fictional live-event story. The provided .env.example selects this pack. |
| SPRINT_CONTENT_PACK=classic | Restore the original Salesforce Sprint questions. Without this setting, the backend code defaults to Classic. |
| ENABLE_GATEKEEPER_MODE=false | Hide and block the two-minute Gatekeeper mode in the UI and backend. The provided .env.example uses false. |
| ADMIN_SECRET_KEY | Required for the facilitator dashboard and cross-team leaderboard. |
| HITL_STATE_DB | Optional path for the Sprint SQLite database. The Compose stack sets it to /app/data/hitl.sqlite3. |
| CORS_ORIGINS | Browser origins permitted by the backend. |
| ENVIRONMENT | Production or development backend behavior. |

Changing the content pack requires a backend restart. Classic and Launch Day use **separate room tables** in the same SQLite file, so switching packs does not overwrite the other pack's saved rooms. Create a fresh table when trying a different pack.

## Multiplayer state and admin controls

Each Sprint table has its own room ID, proposal token, clock, tower, notes, tests, votes, and activity log. Teammates in one room see the same state; independent tables do not share their game decisions. State changes are serialized under a backend room lock and saved to SQLite. If another teammate changes the proposal before an action is submitted, the server rejects the stale token and the browser refreshes the current state.

One note and one test can be in progress at the same time per room; two notes or two tests cannot. The countdowns use wall-clock time, survive a backend restart, and show who started them. The latest team action stays compact in the cockpit; the full non-vote log opens in a popup grouped by PR. Votes remain visible in the team review row.

The admin dashboard separates Sprint and Gatekeeper rooms, offers authenticated Sprint standings and telemetry, and lets the facilitator spectate, pause, resume, or intervene in tables. Global pauses and announcements are also available. Sprint snapshots are designed for the current **single backend process**; multiple backend workers or replicas require a shared transactional room store and coordination.

## Winner and report

Completed teams rank ahead of incomplete teams. Standings then compare tickets merged, score, tower health, blocks remaining, and total time including deductions. Exact ties share the rank. A winner is announced only after at least two tables exist, all registered tables have finished or collapsed, and the leader finished all 11 tickets. Until then, standings show a live leader.

A team's first completed run stays its official workshop entry if it replays the same room. The final Sprint report lists the score, time, coverage and test contributors, human notes and revisions, Merge overrides, and every bug introduced by a faulty Merge, including who merged and later fixed it.

## Code map

| Area | Source |
| --- | --- |
| Sprint APIs and serialized room actions | backend/sprint/sprint_router.py |
| Sprint state, Merge rules, and Hotfix | backend/sprint/session_manager.py |
| Clock and overtime | backend/sprint/clock_service.py |
| Content pack selection | backend/sprint/content_pack.py |
| Launch Day authoring | backend/sprint/launch_day.py |
| Score and ranking | backend/sprint/competition_scoring.py |
| SQLite room snapshots | backend/sprint/room_store.py |
| Sprint game screen and player guide | frontend/src/games/sprint_delivery/ |
| Facilitator dashboard | frontend/src/admin/AdminDashboard.jsx |
