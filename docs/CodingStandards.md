# Coding Standards

# Project Philosophy

The project must prioritize:

- Reusable code
- Type safety
- Maintainability
- Readability
- Scalability

Never optimize for writing fewer files.
Always optimize for easier maintenance.

---

# Folder Organization

Repository

```
root
│
├── frontend
├── backend
├── README.md
├── PRD.md
├── Architecture.md
├── Rules.md
├── Phases.md
├── Design.md
├── CodingStandards.md
```

Frontend contains only frontend code.

Backend contains only backend code.

Root contains documentation and configuration only.

---

# File Size Rules

React Component

Maximum

200 Lines

Utility File

Maximum

150 Lines

Service

Maximum

200 Lines

API Route

Maximum

120 Lines

If a file becomes too large, split it immediately.

---

# Component Rules

Every component should do one job.

Good

```
MetricCard
```

Bad

```
DashboardEverything
```

---

# Context API

Use Context API only for global state.

Examples

- Theme
- Authentication
- User
- Workspace
- Notifications

Do NOT use Context for server data.

Use TanStack Query for API data.

---

# Reusable Code

Common logic belongs in:

- hooks/
- utils/
- services/
- lib/

Never duplicate business logic.

---

# API Rules

Every API call goes through:

services/

Never call Axios directly inside components.

---

# Forms

Always use

- React Hook Form
- Zod

Never use uncontrolled forms.

---

# Notifications

Every important action must display a toast.

Examples

- Login Success
- Login Failed
- Create Project
- Delete Project
- Save Changes
- Export Complete
- API Errors
- Validation Errors

Never use browser alerts.

---

# Theme

Must support

- Dark Mode
- Light Mode

Theme preference should persist using local storage.

---

# Error Handling

Frontend

- Loading UI
- Empty State
- Error State
- Retry Button
- Toast Notification

Backend

- Global Exception Handler
- Validation Errors
- Structured Responses
- Proper HTTP Status Codes
- Request Logging

---

# Naming Conventions

Components

PascalCase

```
MetricCard.tsx
```

Hooks

```
useDashboard.ts
```

Context

```
ThemeContext.tsx
```

Types

```
dashboard.types.ts
```

Services

```
dashboard.service.ts
```

Utilities

```
date.utils.ts
```

Constants

```
dashboard.constants.ts
```

---

# TypeScript Rules

- Strict mode enabled
- No `any`
- Prefer interfaces for API contracts
- Reuse shared types
- Keep type definitions separate from components

---

# Clean Code Rules

- One responsibility per function
- Functions under ~40 lines when practical
- Avoid nested conditionals
- Extract reusable logic
- Remove dead code
- No commented-out code in commits

---

# Performance

- Lazy load large pages
- Memoize expensive calculations when needed
- Use pagination for large datasets
- Avoid unnecessary re-renders

---

# Testing

- Unit test business logic
- Test API endpoints
- Test critical user flows
- Validate analytics calculations

---

# Git Rules

Branch naming

feature/dashboard

feature/funnel

fix/login

refactor/charts

Commit format

feat:

fix:

refactor:

docs:

test:

style:

---

# AI Coding Rules

When generating code, AI must:

- Follow the folder structure exactly
- Create small, reusable files
- Keep components focused on a single responsibility
- Use TypeScript everywhere
- Use Context API only for global state
- Use TanStack Query for server state
- Show toast notifications for user actions
- Include loading, empty, and error states
- Avoid code duplication
- Prefer composition over large components
- Write production-ready, maintainable code
- Use separate .env files in frontend and backend folder
