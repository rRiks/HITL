# Enterprise hosting request: HITL Jenga

**Audience:** Enterprise IT, platform engineering, security, and workshop facilitators  
**Workload:** Internal, time-limited multiplayer training game  
**Current experience:** Launch Day Sprint Delivery, with optional Gatekeeper mode

## Request summary

Host HITL Jenga as an internal HTTPS web application for a workshop. Teams join separate tables by PIN and share live Sprint state. The facilitator uses an authenticated admin dashboard for standings, telemetry, and room controls. The backend stores Sprint progress in SQLite so a process restart does not erase a workshop run.

The current deployment design is **one backend process with persistent storage**. It is not a horizontally scaled, multi-worker service. If the hosting platform requires multiple replicas, a separate design is needed for transactional shared room state and cross-process action serialization.

## Application components

| Component | Current implementation | Hosting requirement |
| --- | --- | --- |
| Frontend | React 19/Vite static build served by Nginx; Three.js tower renders in each browser | HTTPS access, SPA fallback routing, /api reverse proxy |
| Backend | Python 3.11, FastAPI, one Uvicorn worker | Private service access from the frontend proxy |
| Sprint persistence | SQLite file, default backend/data/hitl.sqlite3; Compose uses /app/data/hitl.sqlite3 | Persistent writable volume, backed up if the workshop state matters |
| Gatekeeper state | In-memory legacy mode | Optional; normally disabled for the current workshop |
| Admin | ADMIN_SECRET_KEY protected routes and leaderboard | Secret injection and restricted facilitator access |
| Player sync | REST polling, including about 2.5-second Sprint state polls | Capacity and network access for the planned number of browser clients |

The app does not call a live LLM to generate Sprint proposals. Ticket code, notes, and test results are authored game scenarios. Browser assets may request third-party fonts according to the current frontend styling and Nginx content-security policy; review those requests if strict offline operation is required.

## Recommended deployment shape

For the present single-process implementation, use one host or task with:

1. The provided frontend and backend containers.
2. A persistent volume mounted to the backend's /app/data directory.
3. An internal HTTPS ingress or approved tunnel routing requests to the frontend Nginx container.
4. Nginx proxying /api to the backend on its private network.
5. A secure source for ADMIN_SECRET_KEY and any tunnel token.

The repository includes backend/Dockerfile, frontend/Dockerfile, frontend/nginx.conf, docker-compose.yml, and a loopback-only local override in docker-compose.local.yml. The optional Compose tunnel profile is for a configured Cloudflare Tunnel. See [DOCKER_RUN.md](DOCKER_RUN.md) for run commands.

ECS, Kubernetes, or a similar platform can host the containers, but a backend replica count greater than one is **not supported by the current room-state design**. Shared SQLite storage alone does not solve the in-memory manager and lock coordination problem. Use one backend replica or fund a shared transactional-state redesign before horizontal scaling.

## Configuration

| Variable | Use |
| --- | --- |
| ADMIN_SECRET_KEY | Required admin passcode; store as a secret. |
| CORS_ORIGINS | Comma-separated browser origins permitted by FastAPI. Use exact workshop origins. |
| ENVIRONMENT=production | Disables the interactive API explorer and applies production configuration. |
| SPRINT_CONTENT_PACK=launch_day | Current 11-ticket story. The alternate value classic restores Salesforce Sprint content. |
| ENABLE_GATEKEEPER_MODE=false | Hides and rejects the optional two-minute Gatekeeper mode. |
| HITL_STATE_DB | SQLite path; Compose sets /app/data/hitl.sqlite3. |
| TUNNEL_TOKEN | Required only when starting the optional tunnel profile. |

The server assigns Sprint tables to the Bangalore workshop. Players need only a table PIN and a name. Switching content packs requires a backend restart; Classic and Launch Day use separate SQLite room tables.

## Access and data handling

- Participants join by a short table PIN. The PIN is a collaboration convenience, **not strong authentication**. Place the player app behind the workshop's approved network boundary.
- The admin dashboard, cross-team leaderboard, and facilitator controls require ADMIN_SECRET_KEY. Avoid sharing this secret with players.
- Sprint snapshots store team names, entered player names, chat choices, notes read, test history, votes, bug records, score history, and timestamps. Ask players to use gamer tags rather than sensitive personal data.
- The backend database must be writable by its container process and retained across restarts. Decide a retention and deletion schedule for workshop data.
- The frontend should be served over HTTPS for an off-machine workshop. Configure the exact CORS origin and ingress route. The current Nginx configuration includes security headers and an /api proxy; review its content-security policy against the chosen domain and font policy.
- ENVIRONMENT=production disables /docs, /redoc, and /openapi.json. The /api/health endpoint returns a minimal status.

## Operational checks before the workshop

1. Start the stack with the intended environment and verify container health.
2. Create a Sprint table, join with two browsers, and confirm shared note, test, and vote updates.
3. Restart the backend and verify Sprint state returns from SQLite.
4. Verify the admin secret is required for the dashboard and cross-team standings.
5. Confirm the intended content pack, disabled or enabled Gatekeeper flag, light default theme, and four-character PIN flow.
6. Confirm facilitator pause/resume, spectator mode, and the final report in a rehearsal room.
7. Load-test with a representative number of tables and browsers. The repository does not include a measured concurrency or resource-capacity guarantee.

## Approval request

Provision an internal HTTPS route, one frontend service, one **single-worker** backend service, persistent storage for /app/data, secret injection for ADMIN_SECRET_KEY, and monitoring for container health and backend errors. Approve any optional external tunnel and external font access according to the organization's network policy. Keep the multi-replica redesign out of the initial deployment unless it is explicitly required.
