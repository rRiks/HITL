# Run HITL Jenga with Docker Compose

The Compose stack builds a FastAPI backend and an Nginx-served frontend. Sprint room snapshots live in a named sprint_state volume, so recreating containers does not erase Sprint progress. The optional tunnel profile starts Cloudflare Tunnel. The current workshop URL is configured outside this repository; the application itself does not require a public tunnel.

## Configure

Copy .env.example to .env and set real values for ADMIN_SECRET_KEY and CORS_ORIGINS. For the current workshop, keep SPRINT_CONTENT_PACK=launch_day and ENABLE_GATEKEEPER_MODE=false. Add TUNNEL_TOKEN only if using the tunnel profile. Do not commit .env.

Compose passes ENVIRONMENT, the mode flag, and the content-pack selection to the backend. A content-pack change requires recreating the backend container. Classic and Launch Day rooms use separate tables in the same SQLite volume.

## Local-only run

Publish the frontend only on loopback port 8080:

    docker compose -f docker-compose.yml -f docker-compose.local.yml up -d --build
    docker compose -f docker-compose.yml -f docker-compose.local.yml ps

Open http://127.0.0.1:8080. Nginx forwards /api requests to the backend. The backend is not published directly to the host in the base Compose file. Use the same pair of Compose files when stopping this local stack:

    docker compose -f docker-compose.yml -f docker-compose.local.yml down

The local override does not remove the named volume. Removing it explicitly would remove saved Sprint rooms.

## Tunnel run

If your machine uses Colima, start it first. Otherwise use your existing Docker engine.

    colima start --cpu 2 --memory 4
    docker compose --profile tunnel up -d --build
    docker compose --profile tunnel ps
    docker compose --profile tunnel logs -f tunnel

The tunnel service shares the frontend container's network namespace. If the frontend container is recreated, recreate the tunnel service too. To stop only public access while leaving the app running:

    docker compose stop tunnel

To stop all services:

    docker compose --profile tunnel down

Stop Colima separately if you started it.

## Verify and troubleshoot

- Backend and frontend health checks should show healthy in docker compose ps.
- docker compose logs -f backend shows backend startup and request errors.
- docker compose logs -f frontend shows Nginx requests.
- In production, the FastAPI /docs explorer is disabled by ENVIRONMENT=production; /api/health remains available and returns status ok.
- If the wrong story appears, verify SPRINT_CONTENT_PACK in .env, then recreate the backend and create a new table in that pack.
- If the admin login fails, verify the ADMIN_SECRET_KEY passed to the backend.
- The named sprint_state volume contains the SQLite room database at /app/data/hitl.sqlite3. Back up this volume before removing it.
- The current deployment assumes one backend process. Running multiple replicas against this setup requires a shared transactional room store and coordination.
