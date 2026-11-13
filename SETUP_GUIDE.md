# HITL Jenga developer setup

This guide starts the current **Launch Day Sprint** locally and shows how to test a team with two browsers. The game consists of a FastAPI backend, a React/Vite frontend, and SQLite snapshots for Sprint rooms.

## Prerequisites

- Python 3.11 or newer
- Node.js with npm compatible with the Vite version in frontend/package.json
- Git for cloning the repository
- A browser with WebGL for the 3D tower

## Configure local development

Clone the repository and work from the HITL project root. Copy .env.example to .env, then set:

| Variable | Local value or purpose |
| --- | --- |
| ENVIRONMENT | development, so the API explorer is available at /docs |
| ADMIN_SECRET_KEY | A local secret for the admin dashboard; do not commit .env |
| CORS_ORIGINS | http://localhost:5173,http://127.0.0.1:5173 |
| SPRINT_CONTENT_PACK | launch_day for the current story, or classic for the alternate Salesforce pack |
| ENABLE_GATEKEEPER_MODE | false to show only Sprint; true to enable the separate two-minute mode |

The backend loads .env from its working directory. The commands below start it from the project root so it reads the root .env file. Without SPRINT_CONTENT_PACK, backend code defaults to classic. Switching packs requires a backend restart. Their saved Sprint rooms occupy separate tables in the same SQLite database.

## Start the backend

On macOS or Linux, from the project root:

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r backend/requirements.txt
    python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload

On Windows PowerShell, from the project root:

    py -3.11 -m venv .venv
    .\.venv\Scripts\Activate.ps1
    pip install -r backend/requirements.txt
    python -m uvicorn main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload

The health endpoint is http://127.0.0.1:8000/api/health and returns a status of ok. In development, the API explorer is at http://127.0.0.1:8000/docs. The explorer is disabled when ENVIRONMENT=production.

## Start the frontend

In a second terminal:

    cd frontend
    npm install
    npm run dev

Open http://localhost:5173. Vite proxies /api to the backend at 127.0.0.1:8000. The default UI theme is light liquid glass; players can switch themes.

## Play a short local check

1. On the home screen, choose **Create table**, enter a team name and your own name, choose **Sprint**, and start. The Sprint Field Guide appears before the game.
2. The game opens ticket 1, a 54-block tower, the current AI diff, the four proposal cards, Team review, Review tests, and Merge.
3. Note the four-character PIN in the game header. In an incognito window or different browser, open the home screen, choose **Join with PIN**, enter the PIN and a different player name.
4. Open a secret note on one screen. Both screens should show the shared 10-second countdown and then the revealed note.
5. Run a test. Both screens should show the shared 15-second countdown. One player can still inspect the diff or vote while it runs.
6. Have each player vote Ready or Needs work. Their names and choices should appear in Team review. A strict Ready majority permits a normal Merge.
7. After a revision, verify that current test results and votes reset. Open Review tests yourself to retest the new diff.

A table's state is isolated from other tables. The room uses a proposal token to reject stale actions when a teammate changes the proposal first; the client refreshes the latest room state on conflict.

## Useful URLs

| URL | Use |
| --- | --- |
| http://localhost:5173 | Player lobby and game |
| http://localhost:5173/admin | Authenticated facilitator dashboard |
| http://127.0.0.1:8000/api/health | Backend health |
| http://127.0.0.1:8000/docs | API explorer in development only |

The authenticated /api/leaderboard endpoint is for the facilitator. Players see their own score in the cockpit. The admin dashboard separates Sprint and Gatekeeper rooms, offers Sprint standings, and provides spectator and timer controls.

## Verify changes

From the project root, with the Python environment active:

    python -m unittest discover -s backend/tests -q
    python3 scripts/generate_launch_day_reference.py --check
    python3 scripts/generate_sprint_stage_reference.py --check

From frontend:

    npm run build

The stage reference scripts read authored content and verify the facilitator answer keys. To regenerate them after content edits, run each script without --check. The current Launch Day answer key is docs/SPRINT_STAGE_REFERENCE.md; the alternate Classic key is docs/CLASSIC_STAGE_REFERENCE.md.

## Data and restarts

By default, Sprint rooms are saved in backend/data/hitl.sqlite3. Set HITL_STATE_DB to move the SQLite file. A backend restart reloads Sprint progress and pending note/test countdowns. The current server uses one process with an in-memory room map and a lock; do not launch multiple workers against the same room state. Gatekeeper rooms remain in memory.

A Hotfix after collapse stays on the same ticket with 35% health and a fresh proposal. It resets tests and votes, retains spent resources, bugs, pulls, and negative overtime, and gives no extra time. **New Run** starts at ticket 1. The first completed Sprint run stays the official competition entry for a room that is replayed.

## Docker alternative

See [DOCKER_RUN.md](DOCKER_RUN.md). Compose builds both services, uses a named sprint_state volume for SQLite, and can start an optional Cloudflare tunnel profile. Use docker-compose.local.yml when a localhost port is needed.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Frontend says it cannot reach the backend | Verify /api/health on port 8000, then inspect the Vite /api proxy in frontend/vite.config.js. |
| /docs returns 404 | Set ENVIRONMENT=development in root .env and restart the backend. |
| The wrong tickets appear | Check SPRINT_CONTENT_PACK in .env and restart the backend. Create a new table for the selected pack. |
| Gatekeeper is missing | ENABLE_GATEKEEPER_MODE=false hides and blocks it by design. Set true and restart to enable it. |
| A second player cannot see the same game | Join with the exact four-character PIN and a different player name. Confirm both browsers use the same backend. |
| A test or note button is disabled | The team already has one of that kind in progress; wait for the shared countdown. |
| Port 8000 or 5173 is occupied | Stop the earlier backend or frontend process, or change both the server port and corresponding proxy configuration. |
| Admin access fails | Check ADMIN_SECRET_KEY in the backend environment and use that value in the admin login. |
