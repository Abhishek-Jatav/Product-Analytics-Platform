# Architecture

# Tech Stack

## Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React Context API
- React Hook Form
- Zod
- Axios
- React Hot Toast
- Recharts
- TanStack Query

---

## Backend

- FastAPI
- SQLAlchemy
- Alembic
- PostgreSQL (Neon)
- Pandas
- SciPy
- Redis
- JWT
- WebSockets

---

## Database

PostgreSQL

Tables

- users
- workspaces
- projects
- events
- funnels
- experiments
- variants
- reports
- api_keys

---

# High Level Flow

User

↓

Frontend

↓

API Layer

↓

FastAPI

↓

Business Logic

↓

Database

↓

Analytics Engine

↓

Charts

---

# Folder Structure

```
Product-Analytics-Platform/

frontend/

    app/

    components/

        common/

        dashboard/

        charts/

        forms/

        layout/

    context/

    hooks/

    services/

    lib/

    types/

    utils/

    constants/

    styles/

    public/

backend/

    app/

        api/

        core/

        models/

        schemas/

        services/

        repositories/

        analytics/

        websocket/

        middleware/

        dependencies/

        utils/

    migrations/

    tests/

    scripts/

```

---

# API Flow

Client

↓

Axios Service

↓

API Route

↓

Validation

↓

Business Service

↓

Repository

↓

Database

↓

Response

---

# Analytics Flow

Event

↓

Validation

↓

Database

↓

Analytics Engine

↓

Aggregation

↓

Dashboard

---

# Authentication Flow

Login

↓

JWT

↓

Protected Routes

↓

API Authorization

↓

Database
