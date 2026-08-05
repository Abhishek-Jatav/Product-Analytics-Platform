# Development Rules

# Must Use

## Frontend

- TypeScript only
- Context API
- React Hook Form
- Zod Validation
- Tailwind CSS
- Axios
- React Hot Toast
- Recharts
- TanStack Query

---

## Backend

- FastAPI
- SQLAlchemy ORM
- Alembic
- Repository Pattern
- Service Layer
- Dependency Injection

---

## Database

- PostgreSQL
- Proper Indexes
- Foreign Keys
- UUID IDs

---

## Coding Rules

- Small reusable components
- Small reusable functions
- Single Responsibility Principle
- DRY
- Type Safety
- Clean Architecture

---

# Error Handling

Every API must return

```
success

message

data

errors
```

Every frontend request

- Loading State
- Success Toast
- Error Toast
- Empty State

---

# AI Boundaries

AI should NEVER

- Create huge files
- Put business logic inside UI
- Duplicate code
- Ignore TypeScript errors
- Use "any"
- Hardcode secrets
- Skip validation

AI SHOULD

- Create reusable code
- Split files logically
- Follow folder structure
- Create proper types
- Create comments only when necessary

---

# Avoid

- Inline styles
- Massive React Components
- SQL in API Routes
- Business Logic in Controllers
- Direct DB Access from API
- Magic Numbers
- Deep Nesting
- Long Functions
- Long Files
