# Product Analytics Platform

A centralized product analytics platform: event tracking, funnels, retention, cohorts, A/B testing, segments, alerts, and real-time dashboards — built to the spec in `PRD.md`, `Architecture.md`, `Rules.md`, `Phases.md`, `Design.md`, and `CodingStandards.md`.

## Status: all 10 phases complete

| Phase | Deliverable                                  | Status |
| ----- | -------------------------------------------- | ------ |
| 1     | Project setup, Docker, auth                  | ✅     |
| 2     | Event tracking (API, SDK, storage, explorer) | ✅     |
| 3     | Dashboard (KPIs, chart, date range)          | ✅     |
| 4     | Funnels                                      | ✅     |
| 5     | Retention (Day 1/7/30, cohort heatmap)       | ✅     |
| 6     | A/B testing (significance, winner detection) | ✅     |
| 7     | Segments, alerts, CSV reports                | ✅     |
| 8     | Real-time (WebSocket live feed)              | ✅     |
| 9     | Multi-workspace, teams, roles                | ✅     |
| 10    | Tests, docs, CI                              | ✅     |

## Stack

- **Frontend**: Next.js (App Router), TypeScript (strict), Tailwind CSS, Context API for client state, TanStack Query for server state, React Hook Form + Zod, Axios, Recharts, React Hot Toast
- **Backend**: FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis, JWT, pandas + scipy (analytics engine), WebSockets
- **Infra**: Docker Compose, GitHub Actions CI

## Quick start (Docker)

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# edit backend/.env and set a real SECRET_KEY

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend docs (Swagger): http://localhost:8000/docs
- Postgres: localhost:5432 (user/password/product_analytics)

On first run, apply migrations inside the backenAd container:

```bash
docker compose exec backend alembic revision --autogenerate -m "init"
docker compose exec backend alembic upgrade head
```

## Local development (without Docker)

**Backend**

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # point DATABASE_URL at your local Postgres
alembic revision --autogenerate -m "init"
alembic upgrade head
uvicorn app.main:app --reload
```

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Running tests

```bash
cd backend
pytest -v
```

19 tests cover the full stack: auth, event ingestion (both API-key auth paths), the Event Explorer, dashboard KPI math, funnels (including the sequential-step-ordering edge case), retention (Day-N rates and the cohort matrix), A/B test significance and winner detection, segments, alerts, and the full team-permission matrix (invite/role-change/remove, including last-owner protection).

CI (`.github/workflows/ci.yml`) runs the backend test suite and a frontend typecheck + production build on every push/PR.

## Product tour

### Event tracking (Phase 2)

Create a project to get an API key, then embed the SDK (`frontend/public/sdk/analytics.js`):

```html
<script src="https://your-app.com/sdk/analytics.js"></script>
<script>
  Analytics.init("YOUR_API_KEY", { apiUrl: "https://your-api.com/api/v1" });
  Analytics.track("Purchase", { amount: 49.99 });
</script>
```

The SDK uses `sendBeacon` when available (safe on page unload) and falls back to `fetch`. Ingestion supports the key via header (`X-API-Key`, used by fetch) or query param (`?api_key=`, needed for `sendBeacon`, which can't set custom headers).

### Dashboard (Phase 3)

DAU/WAU/MAU, active/new/returning users, revenue, and conversion rate, computed by a pandas-based analytics engine (`backend/app/analytics/metrics.py`) that's decoupled from the ORM so it's easy to unit test.

### Funnels (Phase 4)

Define an ordered sequence of event names. A user only counts toward step N if they hit steps 1..N-1 in order first — not just "did this event happen at some point."

### Retention (Phase 5)

Day 1/7/30 exact-day retention rates, plus a day/week cohort heatmap (`backend/app/analytics/retention.py`).

### A/B testing (Phase 6)

`Analytics.getVariant(experimentId, variants)` deterministically buckets a user (consistent hash of experiment + distinct ID, so they always see the same variant) and auto-fires the exposure event. Results use a two-proportion z-test for statistical significance (95% confidence) and declare a winner only when a variant is both better and significant.

### Segments, alerts, reports (Phase 7)

- **Segments**: saved filters combining property conditions (e.g. `country=US`) and behavioral conditions (e.g. `fired Purchase >= 2`), AND-combined. Covers both the PRD's "Segmentation" and "Cohort Analysis" as one mechanism.
- **Alerts**: day-over-day threshold rules on DAU/revenue/conversion rate, checked on demand.
- **Reports**: CSV export of raw events.

### Real-time (Phase 8)

A WebSocket live feed (`/ws/projects/{id}/live`) broadcasts newly tracked events to connected dashboard clients as they happen.

### Multi-workspace & teams (Phase 9)

Workspaces have owner/admin/member roles with real enforcement (only owner/admin can invite, only owner can change roles, a workspace can never be left ownerless). Workspace and project switchers live in the navbar.

## Honest scope notes (what's *not* built, and why)

This scaffold is complete for the spec's functional requirements, but a few things were deliberately left as documented gaps rather than faked:

- **Team invites** add an *existing* registered user directly — there's no outbound email in this environment to send an invite link through.
- **Alerts** compute on-demand only. Wiring them to a scheduler + real notification delivery (email/Slack/webhook) needs infrastructure this environment doesn't have.
- **Reports** ship CSV only. PDF export and scheduled reports both need real infrastructure (a PDF renderer, a job queue) not present here.
- **WebSocket broadcasting** is in-memory, single-process. A multi-instance deployment should swap this for Redis pub/sub (Redis is already in the stack) so broadcasts reach clients connected to a different server process.
- **Analytics queries** scan raw events per request (via pandas) rather than pre-aggregating. Fine at this scale; a high-volume production system would add rollup tables or a dedicated OLAP store.

## Project structure

```
Product-Analytics-Platform/
├── backend/
│   └── app/
│       ├── api/            REST + WebSocket routes
│       ├── core/           config, database, security, response envelope
│       ├── models/         SQLAlchemy models
│       ├── schemas/        Pydantic request/response contracts
│       ├── repositories/   direct DB access, one per resource
│       ├── services/       business logic, orchestrates repositories
│       ├── analytics/      pure metric-computation engine (pandas/scipy)
│       ├── websocket/      live-feed connection manager
│       ├── middleware/     exception handling, request logging
│       └── dependencies/   auth (JWT + API key) dependencies
│   └── tests/               pytest suite (19 tests)
├── frontend/
│   └── app/                 Next.js App Router pages
│   └── components/          common / dashboard / charts / forms / layout
│   └── context/              Theme, Auth, Workspace (client state only)
│   └── hooks/                 TanStack Query hooks (server state)
│   └── services/               one per API resource, all calls go through here
│   └── public/sdk/              analytics.js tracking SDK
├── .github/workflows/ci.yml
├── docker-compose.yml
├── PRD.md, Architecture.md, Rules.md, Phases.md, Design.md, CodingStandards.md
```
