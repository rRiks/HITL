# Enterprise Cloud Hosting Request: Human-in-the-Loop (HITL) Simulation

**Document Version:** 1.0  
**Target Audience:** Enterprise IT, Cloud Platform Engineering, DevOps & Security Architecture  
**Application Name:** Human-in-the-Loop (HITL) Jenga – Interactive AI Architecture Simulation  
**Classification:** Internal Developer Enablement Tool (Non-Production / Training Environment)  

---

## 1. Executive Summary & Business Justification

| Field | Detail |
|---|---|
| **Project Sponsor** | Engineering Enablement / GenAI Center of Excellence |
| **Tool Purpose** | Interactive co-op simulation for engineering teams to experience the risks of unverified AI code generation (speed vs. technical debt) using an interactive 3D Voxel Tower and real-time voting consensus. |
| **Target Audience** | Internal engineers, tech leads, architects, and product managers. |
| **Typical Session Size** | 20 to 100 concurrent participants (4 to 25 squad tables) per 90-minute workshop session. |
| **Why Internal AWS Hosting?** | Public platforms (Netlify / Render) are blocked by corporate proxy/Zscaler/VPN policies. Hosting internally ensures full compliance with corporate data boundaries, internal DNS resolution, and seamless access from managed corporate laptops. |

---

## 2. Technical Stack & Runtime Characteristics

The application is lightweight, containerized, and stateless in terms of persistent storage:

```
                      Corporate Managed Laptops
                      (Zscaler / VPN / Office LAN)
                                  │
                                  ▼ [HTTPS 443]
                     ┌──────────────────────────┐
                     │ Internal ALB / Ingress   │
                     │ (*.internal.corp.com)    │
                     └────────────┬─────────────┘
                                  │
          ┌───────────────────────┴───────────────────────┐
          │                                               │
   [Path: /]                                       [Path: /api/*]
          ▼                                               ▼
┌───────────────────────────┐                   ┌───────────────────────────┐
│ Frontend Container        │                   │ Backend Container         │
│ Nginx 1.25 Alpine         │                   │ Python 3.11 / FastAPI     │
│ React 18 + Vite SPA       │                   │ Uvicorn ASGI Server       │
│ Three.js WebGL (Client)   │                   │ In-Memory Room Engine     │
└───────────────────────────┘                   └───────────────────────────┘
```

| Component | Technology | Operational Profile |
|---|---|---|
| **Frontend** | React 18, Vite, Three.js, Vanilla CSS | Static single-page application (SPA). WebGL 3D rendering executes 100% client-side on the user's browser GPU. Served via Nginx. |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic | High-performance asynchronous REST API. Handles room creation, consensus voting, tie-breakers, and telemetry polling. |
| **Persistence / DB** | In-Memory (`GameManager`) | **Zero external database dependencies.** Active room states and timers run in-memory within Python. No RDS, DynamoDB, or external caches required for standard workshop operations. |
| **Network Traffic** | REST Polling over HTTP/HTTPS | Each active client polls room state every ~1.5s–2.0s during active rounds. Bandwidth per request is minuscule (~2KB JSON). |
| **Health Check** | `GET /api/health` | Returns `{"status": "healthy", "timestamp": ...}` with HTTP 200. |

---

## 3. Recommended AWS Deployment Options

We offer three flexible architecture options depending on your team's standard operating model. **Option A or Option B** is recommended for lowest operational overhead.

### Option A: Single EC2 Instance via Docker Compose (Fastest & Lowest Friction)
*Best for rapid enablement or running dedicated training sandboxes.*
- **Compute:** 1x EC2 `t3.small` (2 vCPU, 2 GB RAM) or `t4g.small` (AWS Graviton2).
- **OS:** Amazon Linux 2023 or Ubuntu 22.04 LTS with Docker & Docker Compose.
- **Routing:** Attached to an existing Internal Application Load Balancer (ALB) or private Route 53 record.
- **Artifacts:** Pre-configured `docker-compose.yml`, `backend/Dockerfile`, and `frontend/Dockerfile` are already included in the repository.

### Option B: AWS ECS Fargate (Serverless & Managed)
*Best for standard enterprise container platform compliance.*
- **Cluster:** Existing or shared internal ECS Cluster.
- **Task Definition:**
  - `hitl-backend`: 0.5 vCPU, 1 GB RAM (Port 8000).
  - `hitl-frontend`: 0.25 vCPU, 0.5 GB RAM (Port 80).
- **Ingress:** Internal Application Load Balancer with path-based routing:
  - `/api/*` -> Forward to `hitl-backend` target group.
  - `/*` -> Forward to `hitl-frontend` target group.

### Option C: S3 + CloudFront (Frontend) + ECS/App Runner (Backend)
- Frontend deployed as static assets in a private S3 bucket fronted by CloudFront/Internal ALB.
- Backend hosted on AWS ECS Fargate or AWS App Runner within the private VPC.

---

## 4. Resource Bill of Materials (BOM) & Sizing

For a workshop cohort of **up to 100 concurrent developers (25 active tables)**:

| AWS Resource | Specification / Size | Quantity | Notes |
|---|---|---|---|
| **Compute (CPU/RAM)** | 1.0 vCPU, 2.0 GB RAM total | 1 task / instance | Baseline memory usage is ~150MB for FastAPI and ~30MB for Nginx. |
| **Storage (EBS / EFS)** | 20 GB gp3 root volume | 1 volume | Used solely for OS, container images, and temporary logs. |
| **Container Registry (ECR)** | 2 repositories (`hitl-backend`, `hitl-frontend`) | ~500 MB total | Storing Docker image layers. |
| **Load Balancer (ALB)** | AWS Application Load Balancer (Internal) | 1 (or share existing) | Terminates TLS; distributes traffic across private subnets. |
| **DNS (Route 53)** | Private Hosted Zone record (`hitl.internal.<corp>`) | 1 CNAME / Alias | Maps internal domain to ALB DNS name. |
| **TLS Certificate** | AWS Certificate Manager (ACM) | 1 certificate | Corporate wildcard cert (e.g. `*.corp.yourcompany.com`). |
| **Secrets Manager / SSM** | AWS SSM Parameter Store (Standard) | 1 parameter | Stores `ADMIN_SECRET_KEY` (string). Zero cost. |
| **Monitoring** | CloudWatch Logs | 1 Log Group | Container stdout/stderr logs with 7-day retention. |

---

## 5. Network, Firewall & Security Specifications

### 5.1 Ingress Requirements
- **Protocol / Port:** HTTPS (TCP 443).
- **Source CIDRs:** Restricted strictly to Corporate VPN pools, Zscaler GRE/IPsec tunnels, or internal office LAN subnets (e.g., `10.0.0.0/8`, `172.16.0.0/12`).
- **Public Internet Ingress:** **NONE (0.0.0.0/0 ingress is explicitly NOT required).**

### 5.2 Egress Requirements
- **Outbound Internet:** **NONE required.** The application contains all simulation stages, logic, and assets locally. No external APIs (e.g., OpenAI, public registries) are called during gameplay.
- **Internal AWS Egress:** ECR (for pulling images), CloudWatch (for metrics/logs), and SSM Parameter Store (for config). These can be routed via standard AWS VPC Endpoints (PrivateLink) or NAT Gateway.

### 5.3 Security & Data Governance
- **Data Classification:** Internal / Non-Sensitive.
- **PII / Confidential Data:** **None collected.** Participants use arbitrary gamer handles (e.g., "Riks", "Wayne", "Squad-1"). No employee IDs, email addresses, or source code are transmitted or stored.
- **Authentication & Roles:**
  - **Participants:** Ephemeral room access via table code (no password needed).
  - **Game Master Facilitator Console (`/admin`):** Guarded by passkey authentication validated against `ADMIN_SECRET_KEY`.
  - *(Optional)* Can be integrated with Corporate SSO (Okta / Azure AD / PingID) directly at the ALB listener level using OpenID Connect (OIDC).

---

## 6. Environment Variables & Configuration

The deployment requires only a few environment variables:

| Variable | Target Component | Description | Example / Recommended Value |
|---|---|---|---|
| `PORT` | Backend | Port for Uvicorn listener | `8000` |
| `ADMIN_SECRET_KEY` | Backend | Passkey for Game Master `/admin` access | Injected from AWS SSM Parameter Store |
| `CORS_ORIGINS` | Backend | Allowed origins for cross-origin calls | `*` (or specific internal domain `https://hitl.internal.corp.com`) |
| `VITE_API_BASE` | Frontend | API URL endpoint for client browser | `/api` (default relative path works with Nginx reverse proxy) |

---

## 7. Estimated Monthly Cost (AWS US East / EU West)

Because the architecture requires zero database licensing and minimal compute:

| Item | Monthly Cost Estimate |
|---|---|
| Compute (t3.small EC2 or ECS Fargate 0.5 vCPU/1GB) | ~$15.00 – $22.00 |
| Internal ALB (shared or dedicated) | ~$16.00 – $22.00 |
| Storage & CloudWatch Logs (<20GB) | ~$2.00 |
| **Total Estimated Run Rate** | **~$33.00 – $46.00 / month** |
| *(On-Demand / Workshop-Only Run)* | **< $5.00 per workshop day** |

---

## 8. Ready-to-Deploy Assets Provided in Repository

The codebase is fully container-ready. DevOps engineers can inspect and test locally in minutes:

- `backend/Dockerfile`: Minimal multi-stage Python 3.11 image with non-root security principles and built-in container health check.
- `frontend/Dockerfile`: Multi-stage build (Node.js build -> Alpine Nginx runtime, ~25MB compressed).
- `frontend/nginx.conf`: Nginx SPA routing with automated `/api/` reverse proxy.
- `docker-compose.yml`: Local orchestrator ready for single-command verification (`docker compose up --build`).

---

## 9. Request Checklist for IT / DevOps Ticket

```markdown
### Infrastructure Provisioning Request
- [ ] **Action:** Deploy containerized internal web application ("HITL AI Workshop Simulation").
- [ ] **Target Environment:** AWS Internal Non-Prod / Sandbox VPC.
- [ ] **Compute:** 1x EC2 (t3.small) OR ECS Fargate Task (0.5 vCPU / 1GB RAM).
- [ ] **Network:** Internal ALB in private subnets; HTTPS 443 restricted to internal VPN/Zscaler CIDRs.
- [ ] **DNS:** Internal private CNAME (e.g., `hitl.internal.<corp>.com`).
- [ ] **Secrets:** 1x SSM parameter for `ADMIN_SECRET_KEY`.
- [ ] **Database / Storage:** None required (fully in-memory state).
- [ ] **Source Code / Dockerfiles:** GitHub repository ready with Dockerfile & docker-compose.
```
